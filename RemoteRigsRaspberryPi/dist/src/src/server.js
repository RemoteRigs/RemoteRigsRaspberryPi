// require
import fs from 'fs';
import Debug from './common/debug.js';
import SignalR from './common/signalr.js';
import { config } from 'process';
export default class Server {
    static { this.signalr = ""; }
    static { this.rig = null; }
    static { this.rig_uniquecode = ""; }
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
    Start(configPath) {
        //this.InitHandlers();
        if (configPath == undefined || configPath == "" || config == null) {
            Debug.Error(this.GetName(), "config file path is missing");
            return;
        }
        fs.readFile(configPath, 'utf8', (error, data) => {
            if (error != undefined) {
                Debug.Error(this.GetName(), 'error reading config: ' + error);
                return;
            }
            try {
                this.Load(JSON.parse(data));
            }
            catch (parseError) {
                Debug.Error(this.GetName(), 'error parsing config: ' + parseError);
            }
            this.SetupVariables();
            SignalR.StartConnection(Server.rig_uniquecode);
        });
    }
    Load(config) {
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
    Shutdown() {
        if (Server.rig != null) {
            Debug.LogAlways(this.GetName(), "SHUTDOWN", true);
            Server.rig.Shutdown();
            SignalR.StopConnection();
            Server.rig = null;
        }
        process.exit(0);
    }
    SetupVariables() {
        Server.signalr = Server.serverurl + "/righub";
    }
    GetName() {
        return "server";
    }
}
//# sourceMappingURL=server.js.map