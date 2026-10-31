import { WebRTCMessage } from '../models/models.js';

// common interface of the webcam streamers, so a component can use either implementation:
// - WebRTCStreamerWrapper: the external webrtc-streamer binary (REST api on port 8000)
// - NativeWebRTCStreamer: node-datachannel + ffmpeg, in this process
export default interface IStreamer {
    Start(): Promise<void>;
    Stop(): Promise<void>;
    PutWebRTCMessage(message: WebRTCMessage): Promise<void>;
}
