import * as signalR from '@microsoft/signalr';
import Server from './../server.js';
import Debug from './debug.js';
import Rig from '../rig.js';
import { exec } from "child_process";
import { KeyEventClientModel, LogSettingType, RigClientViewModel, WebRTCMessage, HighScoreModel, CommandMessage, CommandType, StatusModel, StatusType } from '../models/models.js';

export default class SignalR {
    private static hubConnection: signalR.HubConnection | null = null;
    private static reconnectTimer: NodeJS.Timeout | null = null;
    private static lastUniqueCode: string | null = null;
    private static intentionalStop: boolean = false;
    private static signInRetryTimer: NodeJS.Timeout | null = null;
    private static signInAttempts: number = 0;

    private static GetName(): string {
        return "SignalR";
    }

    public static StartConnection(uniquecode: string): void {

        SignalR.lastUniqueCode = uniquecode;
        SignalR.intentionalStop = false;
        SignalR.CancelSignInRetry();

        Debug.LogAlways(SignalR.GetName(), "initiating hub connection... url: '" + Server.signalr + "'", false);

        SignalR.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(Server.signalr)
            .withAutomaticReconnect()
            .build();

        SignalR.hubConnection.on('keyevent', (keyEventClientModel: KeyEventClientModel) => {
            if (Server.rig != null) {
                Server.rig.ProcessKeyEvent(keyEventClientModel);
            }
            else {
                Debug.LogAlways(SignalR.GetName(), "no rig to process keyevent", true);
            }
        });

        SignalR.hubConnection.on("web-rtc-message", async (webRTCMessage: WebRTCMessage) => {
            if (Server.rig != null) {
                if (Server.rig.rig.id !== webRTCMessage.rigId) {
                    Debug.Error(SignalR.GetName(), "incoming web-rtc-message error Server.rig.rig.id (" + Server.rig.rig.id + ") !== message.rigId (" + webRTCMessage.rigId + ")");
                }

                Debug.Log(LogSettingType.SignalR, undefined, SignalR.GetName(), "incoming web-rtc-message rigId:" + webRTCMessage.rigId + " componentId:" + webRTCMessage.componentId + " userId: " + webRTCMessage.userId + " rigOwnerUserId: " + webRTCMessage.rigOwnerUserId);
                Server.rig.PutWebRTCMessage(webRTCMessage);
            }
            else {
                Debug.LogAlways(SignalR.GetName(), "no rig to process webrtc message", true);
            }
        });

        SignalR.hubConnection.on("send-command", async (commandMessage: CommandMessage) => {
            Debug.Log(LogSettingType.SignalR, undefined, SignalR.GetName(), "incoming message: " + JSON.stringify(commandMessage));

            switch (commandMessage.type) {
                case CommandType.RigReloadRigModel:
                    SignalR.SignIn(uniquecode);
                    break;
                case CommandType.RigShutdown:
                    Debug.LogAlways("Raspberry Pi", "SHUTTING DOWN! (received command)", true);
                    exec("shutdown now");
                    break;
            }
        });

        SignalR.hubConnection.onreconnecting((error) => {
            Debug.LogAlways(SignalR.GetName(), "hub connection lost, attempting to reconnect..." + (error ? (" reason: " + error) : ""), true);
        });

        SignalR.hubConnection.onreconnected(() => {
            Debug.LogAlways(SignalR.GetName(), "hub connection reconnected, re-signing in...", true);
            SignalR.SignIn(uniquecode);
        });

        SignalR.hubConnection.onclose((error) => {
            Debug.LogAlways(SignalR.GetName(), "hub connection closed" + (error ? (": " + error) : ""), true);
            // a new connection signs in itself (StartConnection)
            SignalR.CancelSignInRetry();
            SignalR.ScheduleReconnect();
        });

        SignalR.hubConnection
            .start()
            .then(() => {
                Debug.LogAlways(SignalR.GetName(), 'hub connection established', false);
                SignalR.SignIn(uniquecode);
            })
            .catch((err) => {
                Debug.LogAlways(SignalR.GetName(), "failed to establish hub connection: " + err, false);
                SignalR.ScheduleReconnect();
            });
    }

    private static ScheduleReconnect(): void {
        if (SignalR.intentionalStop) {
            return;
        }

        if (SignalR.reconnectTimer != null) {
            return;
        }

        Debug.LogAlways(SignalR.GetName(), "scheduling reconnect attempt in 30s...", true);

        SignalR.reconnectTimer = setTimeout(() => {
            SignalR.reconnectTimer = null;

            if (SignalR.lastUniqueCode != null && !SignalR.intentionalStop) {
                Debug.LogAlways(SignalR.GetName(), "attempting reconnect now...", true);
                SignalR.StartConnection(SignalR.lastUniqueCode);
            }
        }, 30000);
    }

    /// The server refuses a sign in while another connection is still signed in as this rig. After a network drop
    /// that is our own old connection: the server only drops it after the SignalR timeout (30s). The server also
    /// refuses (with the same empty answer) when there are too many sign in attempts from this IP address.
    /// So keep trying: after 5s, 10s, 20s and then every 30s.
    private static ScheduleSignInRetry(uniquecode: string): void {
        if (SignalR.intentionalStop || SignalR.signInRetryTimer != null) {
            return;
        }

        SignalR.signInAttempts++;

        const delay = Math.min(5000 * Math.pow(2, SignalR.signInAttempts - 1), 30000);

        Debug.LogAlways(SignalR.GetName(), "retrying sign in in " + (delay / 1000) + "s (attempt " + SignalR.signInAttempts + ")...", true);

        SignalR.signInRetryTimer = setTimeout(() => {
            SignalR.signInRetryTimer = null;

            if (!SignalR.intentionalStop) {
                SignalR.SignIn(uniquecode);
            }
        }, delay);
    }

    private static CancelSignInRetry(): void {
        if (SignalR.signInRetryTimer != null) {
            clearTimeout(SignalR.signInRetryTimer);
            SignalR.signInRetryTimer = null;
        }

        SignalR.signInAttempts = 0;
    }

    public static StopConnection(): void {
        Debug.Log(LogSettingType.SignalR, undefined, SignalR.GetName(), "stopping hub connection...");

        SignalR.intentionalStop = true;
        SignalR.CancelSignInRetry();

        if (SignalR.reconnectTimer != null) {
            clearTimeout(SignalR.reconnectTimer);
            SignalR.reconnectTimer = null;
        }

        if (SignalR.hubConnection) {
            SignalR.hubConnection.stop()
                .then(() => {
                    Debug.LogAlways(SignalR.GetName(), 'hub connection stopped', false);
                })
                .catch((err) => {
                    Debug.LogAlways(SignalR.GetName(), "StopConnection err: '" + err + "'", false);
                });
        }
    }

    public static IsConnected(): boolean {
        return SignalR.hubConnection != null && SignalR.hubConnection.state === signalR.HubConnectionState.Connected;
    }

    public static SignIn(uniquecode: string): void {
        if (SignalR.hubConnection != null && SignalR.IsConnected()) {
            SignalR.hubConnection.invoke('SignIn', uniquecode)
                .then((rigClientViewModel: RigClientViewModel) => {
                    if (rigClientViewModel.rigModelViewModel == undefined) {
                        // unknown code, the rig is still signed in on another (old) connection, or too many attempts
                        Debug.LogAlways(SignalR.GetName(), "sign in to server failed! GUID: " + uniquecode, true);

                        SignalR.ScheduleSignInRetry(uniquecode);
                    }
                    else {
                        SignalR.CancelSignInRetry();

                        Debug.LogAlways(SignalR.GetName(), "sign in to server successful", true);
                        Debug.LogAlways(SignalR.GetName(), "rig #" + rigClientViewModel.id + " '" + rigClientViewModel.name + "'", true);
                        Debug.LogAlways(SignalR.GetName(), "rig model #" + rigClientViewModel.rigModelViewModel.id + " '" + rigClientViewModel.rigModelViewModel.name + "'", true);

                        Server.rig = new Rig(rigClientViewModel);

                        Server.rig.CreateComponents();
                        Server.rig.Init();
                        Server.rig.SendCurrent();
                    }
                })
                .catch((err) => {
                    Debug.Error(SignalR.GetName(), err);
                });
        }
        else {
            Debug.LogAlways(SignalR.GetName(), "sign in canceled: no hub connection", false);
        }
    }

    public static UpdateStatus(pStatusModel: StatusModel): void {
        if (SignalR.hubConnection != null && SignalR.IsConnected()) {
            if (pStatusModel.type != StatusType.RigLog) {
                Debug.Log(LogSettingType.SignalR, undefined, SignalR.GetName(), "outgoing UpdateStatus type: " + pStatusModel.type);
            }

            SignalR.hubConnection.invoke('UpdateStatus', pStatusModel)
                .then(() => {
                    if (pStatusModel.type != StatusType.RigLog) {
                        Debug.Log(LogSettingType.SignalR, undefined, SignalR.GetName(), "outgoing UpdateStatus type: " + pStatusModel.type);
                    }
                })
                .catch((err) => {
                    Debug.Error(SignalR.GetName(), "outgoing UpdateStatus error: " + err);
                });
        }
        else {
            Debug.LogAlways(SignalR.GetName(), "outgoing UpdateStatus: no hub connection", false);
        }
    }

    public static SendWebRTCMessage(message: WebRTCMessage): void {
        if (SignalR.hubConnection != null && SignalR.IsConnected()) {
            Debug.Log(LogSettingType.SignalR, undefined, SignalR.GetName(), "outgoing SendWebRTCMessage rigId: " + message.rigId + " componentId:" + message.componentId + " userId: " + message.userId + " rigOwnerUserId: " + message.rigOwnerUserId);

            SignalR.hubConnection.invoke("SendWebRTCMessage", message)
                .then(() => {
                    Debug.Log(LogSettingType.SignalR, undefined, SignalR.GetName(), "outgoing SendWebRTCMessage success rigId: " + message.rigId + " componentId:" + message.componentId + " userId: " + message.userId + " rigOwnerUserId: " + message.rigOwnerUserId);
                })
                .catch((err) => {
                    Debug.Error(SignalR.GetName(), "outgoing SendWebRTCMessage error: " + err);
                });
        }
        else {
            Debug.LogAlways(SignalR.GetName(), "SendWebRTCMessage: no hub connection", false);
        }
    }

    public static AddHighScorePoints(message: HighScoreModel): void {
        if (SignalR.hubConnection != null && SignalR.IsConnected()) {
            Debug.Log(LogSettingType.SignalR, undefined, SignalR.GetName(), "outgoing AddHighScorePoints: " + JSON.stringify(message));

            SignalR.hubConnection.invoke("AddHighScorePoints", message)
                .then(() => {
                    Debug.Log(LogSettingType.SignalR, undefined, SignalR.GetName(), "outgoing AddHighScorePoints success: " + JSON.stringify(message));
                })
                .catch((err) => {
                    Debug.Error(SignalR.GetName(), "outgoing AddHighScorePoints error: " + err);
                });
        }
        else {
            Debug.LogAlways(SignalR.GetName(), "outgoing AddHighScorePoints: no hub connection", false);
        }
    }
}