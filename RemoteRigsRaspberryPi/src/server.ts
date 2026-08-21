// require
import fs from 'fs';

import Rig from './rig.js';
import Debug from './common/debug.js';
import SignalR from './common/signalr.js';
import { config } from 'process';

export default class Server {

    // Server
    //public static serveraddress: string = "";
    //public static httpprotocol: string = "http";

    public static serverurl: string;

    public static signalr: string = "";

    public static rig: Rig | null = null;
    public static rig_uniquecode: string = "";

    constructor() {
        //this.OnExit = this.OnExit.bind(this);
        //this.OnSigInt = this.OnSigInt.bind(this);
        //this.OnSigTerm = this.OnSigTerm.bind(this);

        Debug.SetErrorCallback(() => {
            if (Server.rig != null) {
                Debug.LogAlways(this.GetName(), "ERROR SHUTDOWN!", true);

                this.Shutdown();
            }
        });
    }

    public Start(configPath: string): void {
        //this.InitHandlers();

        if (configPath == undefined || configPath == "" || config == null) {
            Debug.Error(this.GetName(), "Config file path is missing");
            return;
        }

        fs.readFile(configPath, 'utf8', (error: any, data: any) => {
            if (error != undefined) {
                Debug.Error(this.GetName(), 'Error reading config: ' + error);
                return;
            }

            try {
                this.Load(JSON.parse(data));
            }
            catch (parseError: any) {
                Debug.Error(this.GetName(), 'Error parsing config: ' + parseError);
            }

            this.SetupVariables();

            SignalR.StartConnection(Server.rig_uniquecode);
        });
    }

    //private InitHandlers(): void {
    //    process.on('exit', this.OnExit);

    //    process.on('SIGINT', this.OnSigInt);

    //    process.on('SIGTERM', this.OnSigTerm);
    //}

    //private OnExit(code: any) {
    //    Debug.LogAlways(this.GetName(), `exit-code: ${code}`);
    //    this.Shutdown();
    //}

    //private OnSigInt() {
    //    Debug.LogAlways(this.GetName(), "SIGINT received (ctrl + c)");
    //    this.Shutdown();
    //    process.exit();
    //}

    //private OnSigTerm() {
    //    Debug.LogAlways(this.GetName(), "SIGTERM received");
    //    this.Shutdown();
    //    process.exit();
    //}

    private Load(config: any): void {
        // Server
        if (config.server.url != undefined) {
            Server.serverurl = config.server.url;
        }
        else {
            Debug.Error(this.GetName(), "Server IP address is not defined in config.json");
        }

        // rig
        if (config.rig?.uniquecode != undefined) {
            Server.rig_uniquecode = config.rig.uniquecode;
        }
        else {
            Debug.Error(this.GetName(), "Rig unique code is not defined in config.json");
        }
    }

    private Shutdown(): void {
        if (Server.rig != null) {
            Debug.LogAlways(this.GetName(), "SHUTDOWN", true);

            Server.rig.Shutdown();

            SignalR.StopConnection();

            Server.rig = null;
        }
    }

    private SetupVariables(): void {
        Server.signalr = Server.serverurl + "/righub";
    }

    private GetName(): string {
        return "server";
    }
}