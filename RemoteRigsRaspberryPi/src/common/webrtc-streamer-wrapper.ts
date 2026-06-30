import { ChildProcess, spawn } from 'child_process';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ClientRTCConfigurationViewModel, LogSettingType, VideoType, WebRTCConnectionType, WebRTCMessage } from '../models/models.js';
import SignalR from './signalr.js';
import Component from '../component/component.js';
import Debug from './debug.js';

export default class WebRTCStreamerWrapper {
    private webrtcStreamerProcess: ChildProcess | null = null;
    private streamerClient: AxiosInstance;
    private streamerStarted: boolean = false;

    // ICE candidate polling
    private iceCandidatePollers: Map<string, NodeJS.Timeout> = new Map();
    private sentCandidates: Map<string, Set<string>> = new Map(); // Track verzonden candidates per peer
    private readonly ICE_POLLING_INTERVAL = 1000; // Verlaagd naar 1 seconde (was 100ms)
    private readonly MAX_POLL_ATTEMPTS = 30; // Stop na 30 seconden

    private readonly STREAMER_PORT = 8000;
    private readonly STREAMER_BASE_URL = `http://0.0.0.0:${this.STREAMER_PORT}`;

    private candidateBuffer: Map<string, string[]> = new Map();
    private remoteDescriptionSet: Set<string> = new Set();

    constructor(private component: Component, private clientRTCConfigurationViewModel: ClientRTCConfigurationViewModel, private videoType: VideoType) {
        this.streamerClient = axios.create({
            baseURL: this.STREAMER_BASE_URL,
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    public async Start(): Promise<void> {
        this.component.SetStatusState("State", "Starting");

        this.Log("Starting webrtc-streamer...");
        await this.StartWebRTCStreamer();
        await this.WaitForStreamer();
        this.Log("webrtc-streamer is ready");
    }

    public async Stop(): Promise<void> {
        // Stop alle ICE polling
        for (const [peerId, _] of this.iceCandidatePollers) {
            this.StopIceCandidatePolling(peerId);
        }

        // Stop webrtc-streamer process
        if (this.webrtcStreamerProcess) {
            this.webrtcStreamerProcess.kill();
            this.webrtcStreamerProcess = null;
        }
    }

    public async PutWebRTCMessage(message: WebRTCMessage): Promise<void> {
        if (this.streamerStarted) {
            this.Log("PutWebRTCMessage username: " + message.username + " messageType: " + message.messageType);

            if (message.messageType == "getIceServers") {
                await this.GetIceServers(message);
            }
            else if (message.messageType == "call") {
                await this.Call(message);
            }
            else if (message.messageType == "createOffer") {
                await this.CreateOffer(message);
            }
            else if (message.messageType == "setAnswer") {
                await this.SetAnswer(message);

                this.remoteDescriptionSet.add(message.sessionId);
                await this.FlushBufferedCandidates(message.sessionId);
            }
            else if (message.messageType == "onReceiveCall") {
                // SDP answer ontvangen, markeer als 'set' en flush buffer
                this.remoteDescriptionSet.add(message.sessionId);
                await this.FlushBufferedCandidates(message.sessionId);
            }
            else if (message.messageType == "addIceCandidate") {
                // Buffer als SDP answer nog niet ontvangen
                if (!this.remoteDescriptionSet.has(message.sessionId)) {
                    this.Log(`Buffering ICE candidate for session ${message.sessionId}`);
                    if (!this.candidateBuffer.has(message.sessionId)) {
                        this.candidateBuffer.set(message.sessionId, []);
                    }
                    this.candidateBuffer.get(message.sessionId)!.push(message.message);
                } else {
                    await this.AddIceCandidate(message);
                }
            }
            else if (message.messageType == "hangup") {
                await this.Hangup(message);
                // Opruimen na hangup
                this.remoteDescriptionSet.delete(message.sessionId);
                this.candidateBuffer.delete(message.sessionId);
            }
        }
        else {
            this.Log("IGNORED! PutWebRTCMessage username: " + message.username + " messageType: " + message.messageType);
        }
    }

    private async StartWebRTCStreamer(): Promise<void> {
        try {
            const response = await this.streamerClient.get('/api/version');
            this.Log("webrtc-streamer is already running: " + JSON.stringify(response));
            return;
        } catch (err) {
            this.Log("webrtc-streamer not running, starting it...");
        }

        const args = [
            "-H", `0.0.0.0:${this.STREAMER_PORT}`,
            "-s",
            //"--stun", this.clientRTCConfigurationViewModel.stunServer,
            "--turn", this.clientRTCConfigurationViewModel.turnServer
        ];

        const command = "webrtc-streamer";

        this.webrtcStreamerProcess = spawn(command, args);

        if (this.webrtcStreamerProcess != null) {
            if (this.webrtcStreamerProcess.stdout != null) {
                this.webrtcStreamerProcess.stdout.on("data", (data: Buffer) => {
                    this.Log(`webrtc-streamer stdout: ${data}`);
                });
            }

            if (this.webrtcStreamerProcess.stderr != null) {
                this.webrtcStreamerProcess.stderr.on("data", (data: Buffer) => {
                    this.Log(`webrtc-streamer stderr: ${data}`);
                });
            }

            this.webrtcStreamerProcess.on("error", (err: Error) => {
                this.Error(`webrtc-streamer error: ${JSON.stringify(err)}`);
            });

            this.webrtcStreamerProcess.on("close", (code: number) => {
                this.Log(`webrtc-streamer exited with code ${code}`);
            });
        }

        this.Log("Spawned webrtc-streamer process: " + command);
    }

    private async WaitForStreamer(): Promise<void> {
        const maxRetries = 20;
        const retryDelay = 500;

        for (let i = 0; i < maxRetries; i++) {
            var response: AxiosResponse<string> | null = null;
            var skip = false;

            try {
                response = await this.streamerClient.get('/api/version');
            }
            catch (err) {
                //this.Log("WaitForStreamer err: " + err);
                skip = true;
            }

            if (response?.data && !skip) {
                this.streamerStarted = true;
                this.component.SetStatusState("State", "Started");

                this.Log("WaitForStreamer version: " + response.data);

                //const getMediaList = await this.streamerClient.get('/api/getMediaList');
                //this.Log("WaitForStreamer getMediaList: " + JSON.stringify(getMediaList.data, null, 2));

                const getVideoDeviceList = await this.streamerClient.get('/api/getVideoDeviceList');
                this.Log("WaitForStreamer getVideoDeviceList: " + getVideoDeviceList.data);

                const getAudioDeviceList = await this.streamerClient.get('/api/getAudioDeviceList');
                this.Log("WaitForStreamer getAudioDeviceList: " + getAudioDeviceList.data);

                //const getAudioPlayoutList = await this.streamerClient.get('/api/getAudioPlayoutList');
                //this.Log("WaitForStreamer getAudioPlayoutList: " + getAudioPlayoutList.data);

                //const getPeerConnectionList = await this.streamerClient.get('/api/getPeerConnectionList');
                //this.Log("WaitForStreamer getPeerConnectionList: " + getPeerConnectionList.data);

                //const getStreamList = await this.streamerClient.get('/api/getStreamList');
                //this.Log("WaitForStreamer getStreamList: " + getStreamList.data);

                return;
            }

            this.Log("WaitForStreamer starting wait: " + i + "/" + maxRetries + " - " + retryDelay + "ms");

            var start = new Date().getTime();
            var end = start;

            while (end < start + retryDelay) {
                end = new Date().getTime();
            }
        }

        if (this.streamerStarted == false) {
            this.component.SetStatusState("State", "Stopped");
            throw new Error("webrtc-streamer failed to start");
        }
    }

    private async FlushBufferedCandidates(sessionId: string): Promise<void> {
        const buffer = this.candidateBuffer.get(sessionId);
        if (buffer && buffer.length > 0) {
            this.Log(`Flushing ${buffer.length} buffered ICE candidates for session ${sessionId}`);
            this.candidateBuffer.delete(sessionId);
        }
    }

    private async GetIceServers(message: WebRTCMessage): Promise<void> {
        try {
            this.Log("Request Ice servers /api/getIceServers");

            const response = await this.streamerClient.get('/api/getIceServers');

            this.Log("Response status: " + response.status);
            this.Log("Response data: " + JSON.stringify(response.data));

            var webrtcMessage = new WebRTCMessage();
            webrtcMessage.componentId = this.component.component.id;
            webrtcMessage.rigId = message.rigId;
            webrtcMessage.webRTCConnectionType = message.webRTCConnectionType;
            webrtcMessage.sessionId = message.sessionId;
            webrtcMessage.username = message.username;
            webrtcMessage.rigOwnerUsername = message.rigOwnerUsername;
            webrtcMessage.messageType = 'getIceServersResponse';
            webrtcMessage.message = JSON.stringify(response.data);

            SignalR.SendWebRTCMessage(webrtcMessage);
        } catch (err: any) {
            if (err.response) {
                this.Log("Response status: " + err.response.status);
                this.Log("Response data: " + JSON.stringify(err.response.data));
            }
            this.Error("GetIceServers error: " + err.message);
        }
    }

    private async Call(message: WebRTCMessage): Promise<void> {
        try {
            var devicePath = this.component.GetProperty("devicepath");

            if (devicePath != null && devicePath != "") {
                var audioPath = this.component.GetProperty("audiopath");
                var audioStr = "";

                if (audioPath != null && audioPath != "") {
                    audioStr = "&audiourl=" + encodeURIComponent(audioPath);
                }

                var width = this.component.GetProperty("width");
                var widthStr = "";

                if (width != null && width != "") {
                    widthStr = "&width=" + width;
                }

                var height = this.component.GetProperty("height");
                var heightStr = "";

                if (height != null && height != "") {
                    heightStr = "&height=" + height;
                }

                var bitrate = this.component.GetProperty("bitrate");
                var bitrateStr = "";

                if (bitrate != null && bitrate != "") {
                    bitrateStr = "&bitrate=" + bitrate;
                }

                //let options = encodeURIComponent("rtptransport=tcp&width=1280&height=720&fps=30&bitrate=2000000");

                let callurl = "/api/call?peerid=" + message.sessionId +
                    "&url=" + encodeURIComponent(devicePath) +
                    audioStr +
                    "&options=" + encodeURIComponent("rtptransport=tcp" + widthStr + heightStr + bitrateStr);

                //m_func[basePath + "/api/call"] = [this](const struct mg_request_info * req_info, const Json:: Value &in) -> HttpServerRequestHandler::httpFunctionReturn {
                //    std::string peerid = getParam(req_info -> query_string, "peerid");
                //    std::string url = getParam(req_info -> query_string, "url");
                //    std::string audiourl = getParam(req_info -> query_string, "audiourl");
                //    std::string options = getParam(req_info -> query_string, "options");
                //    return std:: make_tuple(200, std:: map < std:: string, std:: string > (), this -> call(peerid, url, audiourl, options, in));
                //};

                this.Log("Call: " + callurl);

                const response = await this.streamerClient.post(callurl, message.message);

                this.Log("Response status: " + response.status);
                this.Log("Response data: " + JSON.stringify(response.data));

                // Stuur de answer terug naar de client
                var webrtcMessage = new WebRTCMessage();
                webrtcMessage.componentId = this.component.component.id;
                webrtcMessage.rigId = message.rigId;
                webrtcMessage.sessionId = message.sessionId;
                webrtcMessage.webRTCConnectionType = message.webRTCConnectionType;
                webrtcMessage.username = message.username;
                webrtcMessage.rigOwnerUsername = message.rigOwnerUsername;
                webrtcMessage.messageType = 'onReceiveCall';
                webrtcMessage.message = JSON.stringify(response.data);

                SignalR.SendWebRTCMessage(webrtcMessage);

                // Start polling voor ICE candidates van de server
                this.StartIceCandidatePolling(message.sessionId, message.rigId, message.username, message.rigOwnerUsername, message.webRTCConnectionType);
            } else {
                this.Error("devicePath is empty");
            }
        } catch (err: any) {
            if (err.response) {
                this.Log("Response status: " + err.response.status);
                this.Log("Response data: " + JSON.stringify(err.response.data));
            }
            this.Error("Call error: " + err.message);
        }
    }

    private async CreateOffer(message: WebRTCMessage): Promise<void> {
        //m_func[basePath + "/api/createOffer"] = [this](const struct mg_request_info * req_info, const Json:: Value &in) -> HttpServerRequestHandler::httpFunctionReturn {
        //    std::string peerid = getParam(req_info -> query_string, "peerid");
        //    std::string url = getParam(req_info -> query_string, "url");
        //    std::string audiourl = getParam(req_info -> query_string, "audiourl");
        //    std::string options = getParam(req_info -> query_string, "options");
        //    return std:: make_tuple(200, std:: map < std:: string, std:: string > (), this -> createOffer(peerid, url, audiourl, options));
        //};
        try {
            var devicePath = this.component.GetProperty("devicepath");

            if (devicePath != null && devicePath != "") {
                var audioPath = this.component.GetProperty("audiopath");
                var audioStr = "";

                if (audioPath != null && audioPath != "") {
                    audioStr = "&audiourl=" + encodeURIComponent(audioPath);
                }

                var width = this.component.GetProperty("width");
                var widthStr = "";

                if (width != null && width != "") {
                    widthStr = "&width=" + width;
                }

                var height = this.component.GetProperty("height");
                var heightStr = "";

                if (height != null && height != "") {
                    heightStr = "&height=" + height;
                }

                var bitrate = this.component.GetProperty("bitrate");
                var bitrateStr = "";

                if (bitrate != null && bitrate != "") {
                    bitrateStr = "&bitrate=" + bitrate;
                }

                let createOfferurl = "/api/createOffer?peerid=" + message.sessionId +
                    "&url=" + encodeURIComponent(devicePath) +
                    audioStr +
                    "&options=" + encodeURIComponent("rtptransport=tcp" + widthStr + heightStr + bitrateStr);

                this.Log("createOffer: " + createOfferurl);

                const response = await this.streamerClient.post(createOfferurl, message.message);

                let sdp: string = response.data.sdp;

                if (this.videoType == VideoType.H264) {
                    // Zet H264 (100+101) als eerste in de m=video regel
                    sdp = sdp.replace(
                        /m=video (\S+) (\S+) ([\d ]+)/,
                        (_match: string, port: string, proto: string, payloads: string) => {
                            const ids = payloads.trim().split(' ');
                            const preferred = ['100', '101'];
                            const rest = ids.filter((id: string) => !preferred.includes(id));
                            return `m=video ${port} ${proto} ${[...preferred, ...rest].join(' ')}`;
                        }
                    );
                }

                this.Log("CreateOffer Response status: " + response.status);
                this.Log("CreateOffer Response SDP:\\r\\n" + JSON.stringify(sdp));

                // Stuur de answer terug naar de client
                var webrtcMessage = new WebRTCMessage();
                webrtcMessage.componentId = this.component.component.id;
                webrtcMessage.rigId = message.rigId;
                webrtcMessage.webRTCConnectionType = message.webRTCConnectionType;
                webrtcMessage.sessionId = message.sessionId;
                webrtcMessage.username = message.username;
                webrtcMessage.rigOwnerUsername = message.rigOwnerUsername;
                webrtcMessage.messageType = 'receiveOffer';
                //webrtcMessage.message = JSON.stringify(response.data);
                webrtcMessage.message = JSON.stringify({ ...response.data, sdp });

                SignalR.SendWebRTCMessage(webrtcMessage);
            } else {
                this.Error("devicePath is empty");
            }
        } catch (err: any) {
            if (err.response) {
                this.Log("CreateOffer Response status: " + err.response.status);
                this.Log("CreateOffer Response data: " + JSON.stringify(err.response.data));
            }
            this.Error("CreateOffer Call error: " + err.message);
        }
    }

    private async SetAnswer(message: WebRTCMessage): Promise<void> {
        //m_func[basePath + "/api/setAnswer"] = [this](const struct mg_request_info * req_info, const Json:: Value &in) -> HttpServerRequestHandler::httpFunctionReturn {
        //    std::string peerid = getParam(req_info -> query_string, "peerid");
        //    return std:: make_tuple(200, std:: map < std:: string, std:: string > (), this -> setAnswer(peerid, in));
        //};
        try {
            let setAnswerUrl = "/api/setAnswer?peerid=" + message.sessionId;
            this.Log("setAnswer: " + setAnswerUrl + " message: " + message.message);

            var tJSON = JSON.parse(message.message);

            const response = await this.streamerClient.post(setAnswerUrl, tJSON);

            this.Log("SetAnswer Response status: " + response.status);
            this.Log("SetAnswer Response data:\\r\\n" + JSON.stringify(response.data?.sdp));

            this.StartIceCandidatePolling(message.sessionId, message.rigId, message.username, message.rigOwnerUsername, message.webRTCConnectionType);

        } catch (err: any) {
            if (err.response) {
                this.Log("SetAnswer Response status: " + err.response.status);
                this.Log("SetAnswer Response data: " + JSON.stringify(err.response.data));
            }
            this.Error("SetAnswer Call error: " + err.message);
        }
    }

    private StartIceCandidatePolling(peerId: string, rigId: number, username: string, rigOwnerUsername: string, webRTCConnectionType: WebRTCConnectionType): void {
        // Stop eventuele bestaande polling voor deze peer
        this.StopIceCandidatePolling(peerId);

        // Initialiseer candidate tracking voor deze peer
        this.sentCandidates.set(peerId, new Set<string>());

        this.Log(`Starting ICE candidate polling for peer: ${peerId} with WebRTC connection type: ${webRTCConnectionType}`);

        let pollAttempts = 0;

        const poller = setInterval(async () => {
            pollAttempts++;

            // Stop na MAX_POLL_ATTEMPTS
            if (pollAttempts > this.MAX_POLL_ATTEMPTS) {
                this.Log(`Stopping ICE polling for peer ${peerId} after ${pollAttempts} attempts`);
                this.StopIceCandidatePolling(peerId);
                return;
            }

            try {
                const url = '/api/getIceCandidate?peerid=' + peerId;
                const response = await this.streamerClient.get(url);

                // Als er ICE candidates zijn, filter en stuur ze door
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {

                    const sentSet = this.sentCandidates.get(peerId)!;
                    const newCandidates = response.data.filter(candidate => {
                        // Maak unieke ID voor deze candidate
                        const candidateId = this.GetCandidateId(candidate);
                        return !sentSet.has(candidateId);
                    });

                    if (newCandidates.length > 0) {
                        this.Log(`Got ${newCandidates.length} NEW ICE candidates for peer ${peerId} (filtered from ${response.data.length} total)`);

                        for (const candidate of newCandidates) {
                            const candidateId = this.GetCandidateId(candidate);
                            sentSet.add(candidateId);

                            const webrtcMessage = new WebRTCMessage();
                            webrtcMessage.componentId = this.component.component.id;
                            webrtcMessage.rigId = rigId;
                            webrtcMessage.sessionId = peerId;
                            webrtcMessage.webRTCConnectionType = webRTCConnectionType;
                            webrtcMessage.username = username;
                            webrtcMessage.rigOwnerUsername = rigOwnerUsername;
                            webrtcMessage.messageType = 'onReceiveCandidate';
                            webrtcMessage.message = JSON.stringify(candidate);

                            SignalR.SendWebRTCMessage(webrtcMessage);
                        }
                    }
                }
            } catch (err: any) {
                // Negeer 404 fouten (geen candidates beschikbaar)
                if (err.response?.status !== 404) {
                    this.Log(`ICE polling error for ${peerId}: ${err.message}`);
                }
            }
        }, this.ICE_POLLING_INTERVAL);

        this.iceCandidatePollers.set(peerId, poller);
    }

    private GetCandidateId(candidate: any): string {
        // Maak een unieke ID voor deze candidate gebaseerd op de kandidaat string
        // Dit voorkomt dat we dezelfde candidate meerdere keren versturen
        if (candidate && candidate.candidate) {
            return candidate.candidate;
        }
        return JSON.stringify(candidate);
    }

    private StopIceCandidatePolling(peerId: string): void {
        const poller = this.iceCandidatePollers.get(peerId);
        if (poller) {
            clearInterval(poller);
            this.iceCandidatePollers.delete(peerId);
            this.sentCandidates.delete(peerId);
            this.Log(`Stopped ICE candidate polling for peer: ${peerId}`);
        }
    }

    private async AddIceCandidate(message: WebRTCMessage): Promise<void> {
        try {
            var url = "/api/addIceCandidate?peerid=" + message.sessionId;

            var messageObj = JSON.parse(message.message);

            if (messageObj.candidate != null && messageObj.candidate != "") {
                this.Log("AddIceCandidate: " + url + " - " + messageObj.candidate);
                await this.streamerClient.post(url, message.message);
                this.Log("ICE candidate added successfully");
            } else {
                this.Log("AddIceCandidate: ignoring empty candidate");
            }
        } catch (err: any) {
            if (err.response) {
                this.Log("AddIceCandidate error Response status: " + err.response.status + " - data: " + JSON.stringify(err.response.data));
            }

            this.Log("AddIceCandidate error: " + err.message);
            this.Log("AddIceCandidate message: " + JSON.stringify(message));
        }
    }

    private async Hangup(message: WebRTCMessage): Promise<void> {
        try {
            const url = '/api/hangup?peerid=' + message.sessionId;
            this.Log("Hangup: " + url);

            // Stop ICE polling voor deze peer
            this.StopIceCandidatePolling(message.sessionId);

            await this.streamerClient.get(url);
            this.Log("Hangup successful");

        } catch (err: any) {
            this.Error("Hangup error: " + err.message);
        }
    }

    private GetName(): string {
        return "#" + this.component.component.id + " WebcamStreamer";
    }

    private Log(message: string): void {
        Debug.Log(LogSettingType.Component, this.component.component.id, this.GetName(), message);
    }

    private Error(message: string): void {
        Debug.Error(this.GetName(), message);
    }
}