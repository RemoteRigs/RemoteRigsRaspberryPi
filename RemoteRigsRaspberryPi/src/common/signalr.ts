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

    private static GetName(): string {
        return "SignalR";
    }

    public static StartConnection(uniquecode: string): void {

        SignalR.lastUniqueCode = uniquecode;
        SignalR.intentionalStop = false;

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

                Debug.Log(LogSettingType.SignalR, undefined, SignalR.GetName(), "incoming web-rtc-message rigId:" + webRTCMessage.rigId + " componentId:" + webRTCMessage.componentId + " userName: " + webRTCMessage.userName + " rigOwnerUsername: " + webRTCMessage.rigOwnerUsername);
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

    public static StopConnection(): void {
        Debug.Log(LogSettingType.SignalR, undefined, SignalR.GetName(), "stopping hub connection...");

        SignalR.intentionalStop = true;

        if (SignalR.reconnectTimer != null) {
            clearTimeout(SignalR.reconnectTimer);
            SignalR.reconnectTimer = null;
        }

        if (SignalR.hubConnection) {
            SignalR.hubConnection.stop()
                .then(() => {
                    Debug.Log(LogSettingType.SignalR, undefined, SignalR.GetName(), 'hub connection stopped');
                })
                .catch((err) => {
                    Debug.Error(SignalR.GetName(), err);
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
                        Debug.LogAlways(SignalR.GetName(), "sign in to server failed! GUID: " + uniquecode, true);
                    }
                    else {
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
            Debug.Error(SignalR.GetName(), "sign in canceled: no hub connection");
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
            Debug.Error(SignalR.GetName(), "outgoing UpdateStatus: no hub connection");
        }
    }

    public static SendWebRTCMessage(message: WebRTCMessage): void {
        if (SignalR.hubConnection != null && SignalR.IsConnected()) {
            Debug.Log(LogSettingType.SignalR, undefined, SignalR.GetName(), "outgoing SendWebRTCMessage rigId: " + message.rigId + " componentId:" + message.componentId + " userName: " + message.userName + " rigOwnerUsername: " + message.rigOwnerUsername);

            SignalR.hubConnection.invoke("SendWebRTCMessage", message)
                .then(() => {
                    Debug.Log(LogSettingType.SignalR, undefined, SignalR.GetName(), "outgoing SendWebRTCMessage success rigId: " + message.rigId + " componentId:" + message.componentId + " userName: " + message.userName + " rigOwnerUsername: " + message.rigOwnerUsername);
                })
                .catch((err) => {
                    Debug.Error(SignalR.GetName(), "outgoing SendWebRTCMessage error: " + err);
                });
        }
        else {
            Debug.Error(SignalR.GetName(), "SendWebRTCMessage: no hub connection");
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
            Debug.Error(SignalR.GetName(), "outgoing AddHighScorePoints: no hub connection");
        }
    }
}