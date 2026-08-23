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
            Debug.Error(this.GetName(), "config file path is missing");
            return;
        }

        fs.readFile(configPath, 'utf8', (error: any, data: any) => {
            if (error != undefined) {
                Debug.Error(this.GetName(), 'error reading config: ' + error);
                return;
            }

            try {
                this.Load(JSON.parse(data));
            }
            catch (parseError: any) {
                Debug.Error(this.GetName(), 'error parsing config: ' + parseError);
            }

            this.SetupVariables();

            SignalR.StartConnection(Server.rig_uniquecode);
        });
    }

    private Load(config: any): void {
        // Server
        if (config.server.url != undefined) {
            Server.serverurl = config.server.url;
        }
        else {
            Debug.Error(this.GetName(), "server ip address is not defined in config.json");
        }

        // rig
        if (config.rig?.uniquecode != undefined) {
            Server.rig_uniquecode = config.rig.uniquecode;
        }
        else {
            Debug.Error(this.GetName(), "rig unique code is not defined in config.json");
        }
    }

    private Shutdown(): void {
        if (Server.rig != null) {
            Debug.LogAlways(this.GetName(), "SHUTDOWN", true);

            Server.rig.Shutdown();

            SignalR.StopConnection();

            Server.rig = null;
        }

        process.exit(0);
    }

    private SetupVariables(): void {
        Server.signalr = Server.serverurl + "/righub";
    }

    private GetName(): string {
        return "server";
    }
}