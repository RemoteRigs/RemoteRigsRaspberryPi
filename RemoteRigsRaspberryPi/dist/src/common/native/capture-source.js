import { spawn, spawnSync } from 'child_process';
import { EventEmitter } from 'events';
import dgram from 'dgram';
import { performance } from 'perf_hooks';
const START_CODE = Buffer.from([0, 0, 0, 1]);
const NAL_IDR = 5;
const NAL_SPS = 7;
const NAL_PPS = 8;
const NAL_AUD = 9;
// wall clock in ms, shared by audio and video so the timestamps of both tracks run on the same clock
function NowMs() {
    return performance.timeOrigin + performance.now();
}
/**
 * Captures the webcam (and optionally the microphone) with ffmpeg and emits encoded frames:
 * - 'video' (VideoFrame): H264, raw Annex-B from ffmpeg stdout, split into access units here
 * - 'audio' (AudioFrame): Opus, RTP from ffmpeg to a local UDP socket, unpacked here
 *
 * One capture per camera, shared by all viewers. The processes only run while there are subscribers.
 */
export default class CaptureSource extends EventEmitter {
    constructor(settings, log) {
        super();
        this.settings = settings;
        this.log = log;
        this.videoProcess = null;
        this.audioProcess = null;
        this.audioSocket = null;
        this.running = false;
        this.subscribers = 0;
        this.stopTimer = null;
        this.restartTimers = new Set();
        // mjpeg is the format most USB webcams need for 720p/1080p at 30 fps; not every camera supports it
        this.useDefaultInputFormat = false;
        // H264 parsing
        this.videoBuffer = Buffer.alloc(0);
        this.currentAccessUnit = [];
        this.currentAccessUnitTime = 0;
        this.sps = null;
        this.pps = null;
        this.framesEmitted = 0;
        // audio timestamps: ffmpeg RTP timestamp + offset = wall clock in 48 kHz
        this.audioTimestampOffset = null;
        this.resolvedAudioDevice = null;
        // keep the camera open a bit after the last viewer left, a reconnect (page reload) is then instant
        this.STOP_DELAY_MS = 15000;
        this.RESTART_DELAY_MS = 2000;
        this.setMaxListeners(100);
    }
    get HasAudio() {
        return this.settings.audioPath != "";
    }
    Subscribe() {
        this.subscribers++;
        if (this.stopTimer != null) {
            clearTimeout(this.stopTimer);
            this.stopTimer = null;
        }
        if (!this.running) {
            this.StartCapture();
        }
    }
    Unsubscribe() {
        this.subscribers = Math.max(0, this.subscribers - 1);
        if (this.subscribers == 0 && this.running && this.stopTimer == null) {
            this.stopTimer = setTimeout(() => {
                this.stopTimer = null;
                if (this.subscribers == 0) {
                    this.log("no viewers left, stopping capture");
                    this.StopCapture();
                }
            }, this.STOP_DELAY_MS);
        }
    }
    Dispose() {
        if (this.stopTimer != null) {
            clearTimeout(this.stopTimer);
            this.stopTimer = null;
        }
        this.subscribers = 0;
        this.StopCapture();
        this.removeAllListeners();
    }
    StartCapture() {
        this.running = true;
        this.StartVideo();
        if (this.HasAudio) {
            this.StartAudio().catch(err => this.log("audio start failed: " + err));
        }
    }
    StopCapture() {
        this.running = false;
        for (const timer of this.restartTimers) {
            clearTimeout(timer);
        }
        this.restartTimers.clear();
        if (this.videoProcess != null) {
            this.videoProcess.kill("SIGKILL");
            this.videoProcess = null;
        }
        if (this.audioProcess != null) {
            this.audioProcess.kill("SIGKILL");
            this.audioProcess = null;
        }
        if (this.audioSocket != null) {
            this.audioSocket.close();
            this.audioSocket = null;
        }
        this.videoBuffer = Buffer.alloc(0);
        this.currentAccessUnit = [];
        this.audioTimestampOffset = null;
    }
    ScheduleRestart(what, start) {
        if (!this.running) {
            return;
        }
        this.log(`${what} stopped, restarting in ${this.RESTART_DELAY_MS} ms`);
        const timer = setTimeout(() => {
            this.restartTimers.delete(timer);
            if (this.running) {
                start();
            }
        }, this.RESTART_DELAY_MS);
        this.restartTimers.add(timer);
    }
    // ---------------------------------------------------------------- video
    BuildVideoArgs() {
        const s = this.settings;
        const inputFormat = s.inputFormat != "" ? s.inputFormat : (this.useDefaultInputFormat ? "" : "mjpeg");
        const args = [
            "-hide_banner", "-loglevel", "warning", "-nostdin",
            "-fflags", "nobuffer", "-flags", "low_delay",
        ];
        if (s.devicePath.startsWith("lavfi:")) {
            // test source without a camera, e.g. devicepath = "lavfi:testsrc2"
            const source = s.devicePath.substring(6);
            const size = s.width > 0 && s.height > 0 ? `:size=${s.width}x${s.height}` : "";
            args.push("-re", "-f", "lavfi", "-i", `${source}${source.includes("=") ? ":" : "="}rate=${s.fps}${size}`);
        }
        else {
            args.push("-f", "v4l2", "-thread_queue_size", "64");
            if (inputFormat != "") {
                args.push("-input_format", inputFormat);
            }
            if (s.width > 0 && s.height > 0) {
                args.push("-video_size", `${s.width}x${s.height}`);
            }
            if (s.fps > 0) {
                args.push("-framerate", String(s.fps));
            }
            args.push("-i", s.devicePath);
        }
        args.push("-an");
        if (inputFormat == "h264") {
            // the camera encodes itself: no CPU / encoder load at all
            args.push("-c:v", "copy");
        }
        else {
            args.push("-c:v", s.encoder, "-pix_fmt", "yuv420p", "-b:v", `${s.videoBitrateKbps}k`, "-maxrate", `${s.videoBitrateKbps}k`, "-bufsize", `${s.videoBitrateKbps}k`, 
            // a short GOP: a viewer that connects (or loses a packet) waits at most this long for a picture
            "-g", String(s.keyframeIntervalFrames), "-keyint_min", String(s.keyframeIntervalFrames));
            if (s.encoder == "libx264") {
                args.push("-preset", "ultrafast", "-tune", "zerolatency", "-profile:v", "baseline");
            }
            else {
                // 66 = H264 baseline (the v4l2m2m wrapper only takes the numeric value)
                args.push("-profile:v", "66");
            }
        }
        args.push(
        // an access unit delimiter in front of every frame: makes splitting the stream into frames trivial
        "-bsf:v", "h264_metadata=aud=insert", "-flush_packets", "1", "-f", "h264", "pipe:1");
        return args;
    }
    StartVideo() {
        const args = this.BuildVideoArgs();
        const startedAt = Date.now();
        let lastStderr = "";
        this.log("starting video: ffmpeg " + args.join(" "));
        const proc = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
        this.videoProcess = proc;
        this.videoBuffer = Buffer.alloc(0);
        this.currentAccessUnit = [];
        this.framesEmitted = 0;
        proc.stdout.on("data", (chunk) => this.OnVideoData(chunk));
        proc.stderr.on("data", (data) => {
            lastStderr = data.toString().trim();
            this.log("ffmpeg video: " + lastStderr);
        });
        proc.on("error", (err) => {
            this.log("ffmpeg video error: " + err.message);
        });
        proc.on("exit", (code, signal) => {
            if (this.videoProcess !== proc) {
                return;
            }
            this.videoProcess = null;
            this.log(`ffmpeg video exited (code ${code}, signal ${signal}) after ${this.framesEmitted} frames`);
            // the camera does not do mjpeg: try again with its default format
            if (this.settings.inputFormat == "" && !this.useDefaultInputFormat && this.framesEmitted == 0 && Date.now() - startedAt < 10000) {
                this.log("no frames with input format mjpeg, falling back to the camera default format");
                this.useDefaultInputFormat = true;
            }
            this.ScheduleRestart("video", () => this.StartVideo());
        });
    }
    OnVideoData(chunk) {
        const now = NowMs();
        const buf = this.videoBuffer.length > 0 ? Buffer.concat([this.videoBuffer, chunk]) : chunk;
        // find all start codes (00 00 01 or 00 00 00 01)
        const starts = [];
        for (let i = 0; i + 2 < buf.length; i++) {
            if (buf[i] === 0 && buf[i + 1] === 0) {
                if (buf[i + 2] === 1) {
                    starts.push({ pos: i, len: 3 });
                    i += 2;
                }
                else if (buf[i + 2] === 0 && i + 3 < buf.length && buf[i + 3] === 1) {
                    starts.push({ pos: i, len: 4 });
                    i += 3;
                }
            }
        }
        if (starts.length == 0) {
            this.videoBuffer = Buffer.from(buf);
            return;
        }
        // every NAL unit between two start codes is complete; the last one may still grow
        for (let k = 0; k < starts.length - 1; k++) {
            const nal = buf.subarray(starts[k].pos + starts[k].len, starts[k + 1].pos);
            if (nal.length > 0) {
                this.OnNalUnit(nal, now);
            }
        }
        this.videoBuffer = Buffer.from(buf.subarray(starts[starts.length - 1].pos));
    }
    OnNalUnit(nal, now) {
        const type = nal[0] & 0x1f;
        if (type == NAL_AUD) {
            // start of the next frame: the current one is complete
            if (this.currentAccessUnit.length > 0) {
                this.EmitAccessUnit();
            }
            this.currentAccessUnitTime = now;
            return;
        }
        if (this.currentAccessUnit.length == 0 && this.currentAccessUnitTime == 0) {
            this.currentAccessUnitTime = now;
        }
        if (type == NAL_SPS) {
            this.sps = Buffer.from(nal);
        }
        else if (type == NAL_PPS) {
            this.pps = Buffer.from(nal);
        }
        this.currentAccessUnit.push(nal);
    }
    EmitAccessUnit() {
        const nals = this.currentAccessUnit;
        this.currentAccessUnit = [];
        const types = nals.map(n => n[0] & 0x1f);
        const keyframe = types.includes(NAL_IDR);
        // the browser can only start decoding at a keyframe WITH SPS/PPS: the encoder does not always repeat them
        if (keyframe && !types.includes(NAL_SPS) && this.sps != null && this.pps != null) {
            nals.unshift(this.sps, this.pps);
        }
        const parts = [];
        for (const nal of nals) {
            parts.push(START_CODE, nal);
        }
        const frame = {
            data: Buffer.concat(parts),
            timestamp: Math.round(this.currentAccessUnitTime * 90) >>> 0,
            keyframe: keyframe,
        };
        this.framesEmitted++;
        this.emit("video", frame);
    }
    // ---------------------------------------------------------------- audio
    ResolveAudioDevice(audioPath) {
        let path = audioPath.trim();
        // webrtc-streamer style: audiocap://1
        const capMatch = /^audiocap:\/\/(\d+)$/.exec(path);
        if (capMatch) {
            path = capMatch[1];
        }
        // ALSA device names (and the lavfi test source) can be used as they are
        if (/^(lavfi|hw|plughw|default|sysdefault|dsnoop|front):?/.test(path)) {
            return path;
        }
        // a card number
        if (/^\d+$/.test(path)) {
            return `plughw:${path},0`;
        }
        // a (part of a) card name, e.g. "C920" or "USB Camera"
        try {
            const result = spawnSync("arecord", ["-l"], { encoding: "utf8" });
            const lines = (result.stdout ?? "").split("\n");
            for (const line of lines) {
                // card 1: C920 [HD Pro Webcam C920], device 0: USB Audio [USB Audio]
                const m = /^card (\d+): (\S+) \[([^\]]*)\], device (\d+)/.exec(line);
                if (m && (line.toLowerCase().includes(path.toLowerCase()))) {
                    return `plughw:CARD=${m[2]},DEV=${m[4]}`;
                }
            }
        }
        catch (err) {
            this.log("arecord -l failed: " + err);
        }
        this.log(`audio device '${audioPath}' not found in 'arecord -l', using it as ALSA device name`);
        return path;
    }
    async StartAudio() {
        if (this.resolvedAudioDevice == null) {
            this.resolvedAudioDevice = this.ResolveAudioDevice(this.settings.audioPath);
            this.log(`audio device '${this.settings.audioPath}' -> '${this.resolvedAudioDevice}'`);
        }
        if (this.audioSocket == null) {
            const socket = dgram.createSocket("udp4");
            socket.on("message", (msg) => this.OnAudioRtp(msg));
            socket.on("error", (err) => this.log("audio socket error: " + err.message));
            await new Promise(resolve => socket.bind(0, "127.0.0.1", () => resolve()));
            this.audioSocket = socket;
        }
        if (!this.running) {
            return;
        }
        const port = this.audioSocket.address().port;
        const args = [
            "-hide_banner", "-loglevel", "warning", "-nostdin",
            ...(this.resolvedAudioDevice.startsWith("lavfi:")
                // test source without a microphone, e.g. audiopath = "lavfi:sine=frequency=440"
                ? ["-re", "-f", "lavfi", "-i", this.resolvedAudioDevice.substring(6), "-ac", "1", "-ar", "48000"]
                : ["-f", "alsa", "-thread_queue_size", "1024", "-ac", "1", "-ar", "48000", "-i", this.resolvedAudioDevice]),
            "-vn",
            "-c:a", "libopus",
            "-b:a", `${this.settings.audioBitrateKbps}k`,
            "-application", "lowdelay",
            "-frame_duration", "20",
            "-payload_type", "111",
            "-f", "rtp",
            // RTCP to the same socket (we ignore it), not to port+1 which may belong to someone else
            `rtp://127.0.0.1:${port}?rtcpport=${port}&pkt_size=1200`,
        ];
        this.log("starting audio: ffmpeg " + args.join(" "));
        const proc = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
        this.audioProcess = proc;
        this.audioTimestampOffset = null;
        proc.stderr.on("data", (data) => {
            this.log("ffmpeg audio: " + data.toString().trim());
        });
        proc.on("error", (err) => {
            this.log("ffmpeg audio error: " + err.message);
        });
        proc.on("exit", (code, signal) => {
            if (this.audioProcess !== proc) {
                return;
            }
            this.audioProcess = null;
            this.log(`ffmpeg audio exited (code ${code}, signal ${signal})`);
            this.ScheduleRestart("audio", () => { this.StartAudio().catch(err => this.log("audio restart failed: " + err)); });
        });
    }
    OnAudioRtp(packet) {
        if (packet.length < 12 || (packet[0] >> 6) != 2) {
            return;
        }
        // RTCP (sender reports of ffmpeg): payload type 200..206
        const payloadTypeByte = packet[1];
        if (payloadTypeByte >= 200 && payloadTypeByte <= 206) {
            return;
        }
        const padding = (packet[0] >> 5) & 1;
        const extension = (packet[0] >> 4) & 1;
        const csrcCount = packet[0] & 0x0f;
        let offset = 12 + 4 * csrcCount;
        if (extension) {
            if (packet.length < offset + 4) {
                return;
            }
            offset += 4 + 4 * packet.readUInt16BE(offset + 2);
        }
        let end = packet.length;
        if (padding) {
            end -= packet[packet.length - 1];
        }
        if (end <= offset) {
            return;
        }
        const rtpTimestamp = packet.readUInt32BE(4);
        if (this.audioTimestampOffset == null) {
            this.audioTimestampOffset = Math.round(NowMs() * 48) - rtpTimestamp;
        }
        const frame = {
            data: Buffer.from(packet.subarray(offset, end)),
            timestamp: (rtpTimestamp + this.audioTimestampOffset) >>> 0,
        };
        this.emit("audio", frame);
    }
}
//# sourceMappingURL=capture-source.js.map