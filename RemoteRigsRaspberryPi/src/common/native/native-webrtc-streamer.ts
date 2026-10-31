import nodeDataChannel, { type IceServer, type PeerConnection, type RtpPacketizationConfig, type Track } from 'node-datachannel';
import { randomInt } from 'crypto';

import { ClientRTCConfigurationViewModel, LogSettingType, VideoType, WebRTCConnectionType, WebRTCMessage } from '../../models/models.js';
import SignalR from '../signalr.js';
import Component from '../../component/component.js';
import Debug from '../debug.js';
import IStreamer from '../streamer.js';
import CaptureSource, { AudioFrame, CaptureSettings, VideoFrame } from './capture-source.js';

// the payload types match what the relay (SIPSorcery) and the browser already expect from webrtc-streamer
const H264_PAYLOAD_TYPE = 100;
const OPUS_PAYLOAD_TYPE = 111;

// the browser only accepts this H264 variant (setCodecPreferences in WebRTCConnection.ts), the relay uses the same
const H264_FMTP = "level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f";

const VIDEO_MID = "0";
const AUDIO_MID = "1";
const STREAM_ID = "remoterigs";

// the relay on the server (LocalMediaRelay) does not handle audio yet: only send audio on direct connections
const AUDIO_ON_RELAY = false;

// how long a peer may stay 'disconnected' before it is closed (libdatachannel can recover from a short drop)
const DISCONNECTED_TIMEOUT_MS = 15000;

interface Peer {
    sessionId: string;
    pc: PeerConnection;
    message: WebRTCMessage;                     // the createOffer message: ids to answer with
    videoTrack: Track;
    videoConfig: RtpPacketizationConfig;
    audioTrack: Track | null;
    audioConfig: RtpPacketizationConfig | null;
    waitingForKeyframe: boolean;
    remoteDescriptionSet: boolean;
    pendingRemoteCandidates: { candidate: string, mid: string }[];
    pendingLocalCandidates: { candidate: string, mid: string }[];
    disconnectedTimer: NodeJS.Timeout | null;
    closed: boolean;
    framesSent: number;
}

/**
 * WebRTC streamer without the webrtc-streamer binary:
 * - node-datachannel (libdatachannel) is the WebRTC peer (ICE/STUN/TURN, DTLS-SRTP, RTP/RTCP)
 * - ffmpeg captures and encodes (CaptureSource), h264_v4l2m2m = the hardware encoder of the Pi 4
 * - the signaling is the same as with WebRTCStreamerWrapper: the rig makes the offer (createOffer),
 *   the browser / relay answers (setAnswer), candidates are trickled in both directions
 */
export default class NativeWebRTCStreamer implements IStreamer {
    private static loggerInitialized = false;

    private peers: Map<string, Peer> = new Map();
    private capture: CaptureSource | null = null;
    private started: boolean = false;

    private readonly onVideo = (frame: VideoFrame) => this.SendVideo(frame);
    private readonly onAudio = (frame: AudioFrame) => this.SendAudio(frame);

    constructor(private component: Component, private clientRTCConfigurationViewModel: ClientRTCConfigurationViewModel, private videoType: VideoType) {
    }

    public async Start(): Promise<void> {
        this.component.SetStatusState("State", "Starting");

        if (!NativeWebRTCStreamer.loggerInitialized) {
            NativeWebRTCStreamer.loggerInitialized = true;
            nodeDataChannel.initLogger("Warning", (level, message) => {
                Debug.LogAlways("libdatachannel", `${level}: ${message}`, false);
            });
        }

        if (this.videoType != VideoType.H264) {
            this.Log("WARNING: the native streamer only sends H264 (the rig is set to " + VideoType[this.videoType] + ")");
        }

        const settings = this.GetCaptureSettings();
        this.Log("capture settings: " + JSON.stringify(settings));

        this.capture = new CaptureSource(settings, (message) => this.Log(message));
        this.capture.on("video", this.onVideo);
        this.capture.on("audio", this.onAudio);

        this.started = true;
        this.component.SetStatusState("State", "Started");
        this.Log("native streamer is ready (libdatachannel " + nodeDataChannel.getLibraryVersion() + ")");
    }

    public async Stop(): Promise<void> {
        this.started = false;

        for (const peer of [...this.peers.values()]) {
            this.ClosePeer(peer, "streamer stopped");
        }

        if (this.capture != null) {
            this.capture.Dispose();
            this.capture = null;
        }

        this.component.SetStatusState("State", "Stopped");
    }

    public async PutWebRTCMessage(message: WebRTCMessage): Promise<void> {
        if (!this.started) {
            this.Log("IGNORED! PutWebRTCMessage userId: " + message.userId + " messageType: " + message.messageType);
            return;
        }

        this.Log("PutWebRTCMessage userId: " + message.userId + " messageType: " + message.messageType + " session: " + message.sessionId);

        try {
            switch (message.messageType) {
                case "createOffer":
                    this.CreateOffer(message);
                    break;
                case "setAnswer":
                    this.SetAnswer(message);
                    break;
                case "addIceCandidate":
                    this.AddIceCandidate(message);
                    break;
                case "hangup":
                    this.Hangup(message);
                    break;
                case "getIceServers":
                    this.GetIceServers(message);
                    break;
                case "onReceiveCall":
                    // only used with the 'call' flow of webrtc-streamer
                    break;
                case "call":
                    this.Error("'call' (browser makes the offer) is not supported by the native streamer, use createOffer");
                    break;
                default:
                    this.Log("unknown messageType: " + message.messageType);
                    break;
            }
        }
        catch (err: any) {
            this.Error(`${message.messageType} failed: ${err?.message ?? err}`);
        }
    }

    // ---------------------------------------------------------------- signaling

    private CreateOffer(message: WebRTCMessage): void {
        if (this.capture == null) {
            throw new Error("capture not started");
        }

        // a new offer for an existing session: the browser starts over
        const existing = this.peers.get(message.sessionId);
        if (existing != null) {
            this.ClosePeer(existing, "new offer for the same session");
        }

        const pc = new nodeDataChannel.PeerConnection(message.sessionId, {
            iceServers: this.GetIceServerConfig(),
            disableAutoNegotiation: true,
        });

        // video
        const videoSsrc = randomInt(1, 0x7fffffff);
        const video = new nodeDataChannel.Video(VIDEO_MID, "SendOnly");
        video.addH264Codec(H264_PAYLOAD_TYPE, H264_FMTP);
        video.addSSRC(videoSsrc, "video", STREAM_ID, "video");

        const videoTrack = pc.addTrack(video);
        const videoConfig = new nodeDataChannel.RtpPacketizationConfig(videoSsrc, "video", H264_PAYLOAD_TYPE, 90000);
        const videoPacketizer = new nodeDataChannel.H264RtpPacketizer("StartSequence", videoConfig);
        videoPacketizer.addToChain(new nodeDataChannel.RtcpSrReporter(videoConfig));
        videoPacketizer.addToChain(new nodeDataChannel.RtcpNackResponder());
        videoTrack.setMediaHandler(videoPacketizer);

        // audio
        let audioTrack: Track | null = null;
        let audioConfig: RtpPacketizationConfig | null = null;

        const withAudio = this.capture.HasAudio && (message.webRTCConnectionType != WebRTCConnectionType.Relay || AUDIO_ON_RELAY);

        if (withAudio) {
            const audioSsrc = randomInt(1, 0x7fffffff);
            const audio = new nodeDataChannel.Audio(AUDIO_MID, "SendOnly");
            audio.addOpusCodec(OPUS_PAYLOAD_TYPE);
            audio.addSSRC(audioSsrc, "audio", STREAM_ID, "audio");

            audioTrack = pc.addTrack(audio);
            audioConfig = new nodeDataChannel.RtpPacketizationConfig(audioSsrc, "audio", OPUS_PAYLOAD_TYPE, 48000);
            const audioPacketizer = new nodeDataChannel.RtpPacketizer(audioConfig);
            audioPacketizer.addToChain(new nodeDataChannel.RtcpSrReporter(audioConfig));
            audioPacketizer.addToChain(new nodeDataChannel.RtcpNackResponder());
            audioTrack.setMediaHandler(audioPacketizer);
        }

        const peer: Peer = {
            sessionId: message.sessionId,
            pc: pc,
            message: message,
            videoTrack: videoTrack,
            videoConfig: videoConfig,
            audioTrack: audioTrack,
            audioConfig: audioConfig,
            waitingForKeyframe: true,
            remoteDescriptionSet: false,
            pendingRemoteCandidates: [],
            pendingLocalCandidates: [],
            disconnectedTimer: null,
            closed: false,
            framesSent: 0,
        };

        this.peers.set(message.sessionId, peer);

        pc.onLocalDescription((sdp, type) => {
            this.Log(`local description (${type}) for session ${peer.sessionId}:\r\n${sdp}`);
            this.SendToServer(peer, "receiveOffer", JSON.stringify({ type: type, sdp: sdp }));
        });

        pc.onLocalCandidate((candidate, mid) => {
            // like webrtc-streamer: the candidates go out after the answer, the other side then has a peer to add them to
            if (peer.remoteDescriptionSet) {
                this.SendLocalCandidate(peer, candidate, mid);
            } else {
                peer.pendingLocalCandidates.push({ candidate, mid });
            }
        });

        pc.onStateChange((state) => this.OnPeerStateChange(peer, state));

        videoTrack.onOpen(() => {
            this.Log(`video track open for session ${peer.sessionId}, waiting for a keyframe`);
            peer.waitingForKeyframe = true;
        });

        videoTrack.onMessage((msg) => this.OnRtcp(peer, msg));

        this.capture.Subscribe();

        this.Log(`creating offer for session ${peer.sessionId} (${WebRTCConnectionType[message.webRTCConnectionType]}, audio: ${withAudio})`);
        pc.setLocalDescription();
    }

    private SetAnswer(message: WebRTCMessage): void {
        const peer = this.peers.get(message.sessionId);

        if (peer == null) {
            this.Log("setAnswer for unknown session " + message.sessionId);
            return;
        }

        const answer = JSON.parse(message.message);
        this.Log(`remote description (answer) for session ${peer.sessionId}:\r\n${answer.sdp}`);

        peer.pc.setRemoteDescription(answer.sdp, "answer");
        peer.remoteDescriptionSet = true;

        for (const c of peer.pendingRemoteCandidates) {
            this.ApplyRemoteCandidate(peer, c.candidate, c.mid);
        }
        peer.pendingRemoteCandidates = [];

        for (const c of peer.pendingLocalCandidates) {
            this.SendLocalCandidate(peer, c.candidate, c.mid);
        }
        peer.pendingLocalCandidates = [];
    }

    private AddIceCandidate(message: WebRTCMessage): void {
        const peer = this.peers.get(message.sessionId);

        if (peer == null) {
            this.Log("addIceCandidate for unknown session " + message.sessionId);
            return;
        }

        const init = JSON.parse(message.message);
        const candidate: string = init.candidate ?? "";

        if (candidate == "") {
            // end of candidates
            return;
        }

        const mid: string = init.sdpMid ?? (init.sdpMLineIndex != null ? String(init.sdpMLineIndex) : VIDEO_MID);

        if (!peer.remoteDescriptionSet) {
            peer.pendingRemoteCandidates.push({ candidate, mid });
            return;
        }

        this.ApplyRemoteCandidate(peer, candidate, mid);
    }

    private ApplyRemoteCandidate(peer: Peer, candidate: string, mid: string): void {
        try {
            this.Log(`remote candidate for session ${peer.sessionId}: ${candidate}`);
            peer.pc.addRemoteCandidate(candidate, mid);
        }
        catch (err: any) {
            // e.g. an mDNS (.local) candidate that cannot be resolved: the other candidates still work
            this.Log(`addRemoteCandidate failed (${candidate}): ${err?.message ?? err}`);
        }
    }

    private SendLocalCandidate(peer: Peer, candidate: string, mid: string): void {
        this.Log(`local candidate for session ${peer.sessionId}: ${candidate}`);

        const init = {
            candidate: candidate.startsWith("a=") ? candidate.substring(2) : candidate,
            sdpMid: mid,
            sdpMLineIndex: mid == AUDIO_MID ? 1 : 0,
        };

        this.SendToServer(peer, "onReceiveCandidate", JSON.stringify(init));
    }

    private Hangup(message: WebRTCMessage): void {
        const peer = this.peers.get(message.sessionId);

        if (peer != null) {
            this.ClosePeer(peer, "hangup");
        }
    }

    private GetIceServers(message: WebRTCMessage): void {
        // same format as /api/getIceServers of webrtc-streamer
        const iceServers: any[] = [];
        const stun = this.clientRTCConfigurationViewModel.stunServer ?? "";
        const turn = this.ParseTurnServer();

        if (stun != "") {
            iceServers.push({ urls: [`stun:${stun}`] });
        }

        if (turn != null) {
            iceServers.push({ urls: [`turn:${turn.hostname}:${turn.port}`], username: turn.username, credential: turn.password });
        }

        const response = new WebRTCMessage();
        response.componentId = this.component.component.id;
        response.rigId = message.rigId;
        response.webRTCConnectionType = message.webRTCConnectionType;
        response.sessionId = message.sessionId;
        response.userId = message.userId;
        response.rigOwnerUserId = message.rigOwnerUserId;
        response.messageType = "getIceServersResponse";
        response.message = JSON.stringify({ iceServers });

        SignalR.SendWebRTCMessage(response);
    }

    private SendToServer(peer: Peer, messageType: string, payload: string): void {
        const webrtcMessage = new WebRTCMessage();
        webrtcMessage.componentId = this.component.component.id;
        webrtcMessage.rigId = peer.message.rigId;
        webrtcMessage.webRTCConnectionType = peer.message.webRTCConnectionType;
        webrtcMessage.sessionId = peer.sessionId;
        webrtcMessage.userId = peer.message.userId;
        webrtcMessage.rigOwnerUserId = peer.message.rigOwnerUserId;
        webrtcMessage.messageType = messageType;
        webrtcMessage.message = payload;

        SignalR.SendWebRTCMessage(webrtcMessage);
    }

    // ---------------------------------------------------------------- peers

    private OnPeerStateChange(peer: Peer, state: string): void {
        this.Log(`session ${peer.sessionId} state: ${state}`);

        if (peer.disconnectedTimer != null) {
            clearTimeout(peer.disconnectedTimer);
            peer.disconnectedTimer = null;
        }

        if (state == "connected") {
            const pair = peer.pc.getSelectedCandidatePair();
            if (pair != null) {
                this.Log(`session ${peer.sessionId} connected via ${pair.local.type}/${pair.local.transportType} -> ${pair.remote.type} ${pair.remote.address}:${pair.remote.port}`);
            }
        }
        else if (state == "disconnected") {
            peer.disconnectedTimer = setTimeout(() => this.ClosePeer(peer, "disconnected too long"), DISCONNECTED_TIMEOUT_MS);
        }
        else if (state == "failed" || state == "closed") {
            // close() from within the state callback of libdatachannel itself is not allowed: defer it
            setImmediate(() => this.ClosePeer(peer, state));
        }
    }

    private ClosePeer(peer: Peer, reason: string): void {
        if (peer.closed) {
            return;
        }

        peer.closed = true;

        if (peer.disconnectedTimer != null) {
            clearTimeout(peer.disconnectedTimer);
            peer.disconnectedTimer = null;
        }

        if (this.peers.get(peer.sessionId) === peer) {
            this.peers.delete(peer.sessionId);
        }

        this.Log(`closing session ${peer.sessionId} (${reason}) after ${peer.framesSent} frames`);

        try {
            peer.pc.close();
        }
        catch (err: any) {
            this.Log("close failed: " + (err?.message ?? err));
        }

        this.capture?.Unsubscribe();
    }

    private OnRtcp(peer: Peer, msg: Buffer): void {
        // walk the compound RTCP packet, looking for PLI (PSFB 206 / FMT 1) and FIR (PSFB 206 / FMT 4)
        let offset = 0;

        while (offset + 4 <= msg.length) {
            const fmt = msg[offset] & 0x1f;
            const packetType = msg[offset + 1];
            const length = (msg.readUInt16BE(offset + 2) + 1) * 4;

            if (packetType == 206 && (fmt == 1 || fmt == 4)) {
                // the encoder cannot be forced to make a keyframe: the next one (keyframe interval) is at most ~1 s away
                this.Log(`session ${peer.sessionId} requests a keyframe (${fmt == 1 ? "PLI" : "FIR"})`);
            }

            offset += length;
        }
    }

    // ---------------------------------------------------------------- media

    private SendVideo(frame: VideoFrame): void {
        for (const peer of this.peers.values()) {
            if (peer.closed || !peer.videoTrack.isOpen()) {
                continue;
            }

            if (peer.waitingForKeyframe) {
                if (!frame.keyframe) {
                    continue;
                }

                peer.waitingForKeyframe = false;
                this.Log(`first keyframe to session ${peer.sessionId} (${frame.data.length} bytes)`);
            }

            try {
                peer.videoConfig.timestamp = frame.timestamp;
                peer.videoTrack.sendMessageBinary(frame.data);
                peer.framesSent++;
            }
            catch (err: any) {
                this.Log(`video send to session ${peer.sessionId} failed: ${err?.message ?? err}`);
            }
        }
    }

    private SendAudio(frame: AudioFrame): void {
        for (const peer of this.peers.values()) {
            if (peer.closed || peer.audioTrack == null || peer.audioConfig == null || !peer.audioTrack.isOpen()) {
                continue;
            }

            try {
                peer.audioConfig.timestamp = frame.timestamp;
                peer.audioTrack.sendMessageBinary(frame.data);
            }
            catch (err: any) {
                this.Log(`audio send to session ${peer.sessionId} failed: ${err?.message ?? err}`);
            }
        }
    }

    // ---------------------------------------------------------------- configuration

    private GetIceServerConfig(): (string | IceServer)[] {
        const servers: (string | IceServer)[] = [];
        const stun = this.clientRTCConfigurationViewModel.stunServer ?? "";

        if (stun != "") {
            servers.push(`stun:${stun}`);
        }

        const turn = this.ParseTurnServer();
        if (turn != null) {
            servers.push(turn);
        }

        return servers;
    }

    // the server sends "username:credential@host:port" (the --turn format of webrtc-streamer);
    // a TURN REST username contains a ':' itself (expiry:user), the credential (base64) does not
    private ParseTurnServer(): IceServer | null {
        const turn = this.clientRTCConfigurationViewModel.turnServer ?? "";

        if (turn == "") {
            return null;
        }

        const at = turn.lastIndexOf("@");
        const hostPort = at >= 0 ? turn.substring(at + 1) : turn;
        const credentials = at >= 0 ? turn.substring(0, at) : "";

        const colon = credentials.lastIndexOf(":");
        const username = colon >= 0 ? credentials.substring(0, colon) : credentials;
        const password = colon >= 0 ? credentials.substring(colon + 1) : "";

        const portColon = hostPort.lastIndexOf(":");
        const hostname = portColon >= 0 ? hostPort.substring(0, portColon) : hostPort;
        const port = portColon >= 0 ? parseInt(hostPort.substring(portColon + 1)) : 3478;

        return { hostname, port: isNaN(port) ? 3478 : port, username, password, relayType: "TurnUdp" };
    }

    private GetCaptureSettings(): CaptureSettings {
        const number = (name: string, fallback: number): number => {
            const value = parseInt(this.GetOptionalProperty(name));
            return isNaN(value) || value <= 0 ? fallback : value;
        };

        const fps = number("fps", 30);

        // webrtc-streamer took the bitrate in bps or kbps depending on the version: accept both
        let bitrate = number("bitrate", 2000);
        if (bitrate >= 50000) {
            bitrate = Math.round(bitrate / 1000);
        }

        return {
            devicePath: this.GetOptionalProperty("devicepath"),
            audioPath: this.GetOptionalProperty("audiopath"),
            width: number("width", 1280),
            height: number("height", 720),
            fps: fps,
            videoBitrateKbps: bitrate,
            audioBitrateKbps: number("audiobitrate", 32),
            inputFormat: this.GetOptionalProperty("inputformat").toLowerCase(),
            encoder: this.GetOptionalProperty("encoder") || process.env["REMOTERIGS_H264_ENCODER"] || "h264_v4l2m2m",
            keyframeIntervalFrames: fps,
        };
    }

    // GetProperty logs every missing property: the optional ones are checked here first
    private GetOptionalProperty(name: string): string {
        if (!this.component.property.hasOwnProperty(name)) {
            return "";
        }

        return (this.component.GetProperty(name) ?? "").trim();
    }

    private GetName(): string {
        return "#" + this.component.component.id + " NativeStreamer";
    }

    private Log(message: string): void {
        Debug.Log(LogSettingType.Component, this.component.component.id, this.GetName(), message);
    }

    private Error(message: string): void {
        Debug.Error(this.GetName(), message);
    }
}
