// require
import fs from 'fs';
import Debug from './common/debug.js';
import SignalR from './common/signalr.js';
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
    Start() {
        //this.InitHandlers();
        fs.readFile("config.json", 'utf8', (error, data) => {
            if (error != undefined) {
                Debug.Error(this.GetName(), 'Error reading config: ' + error);
                return;
            }
            try {
                this.Load(JSON.parse(data));
            }
            catch (parseError) {
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
    Load(config) {
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
    Shutdown() {
        if (Server.rig != null) {
            Debug.LogAlways(this.GetName(), "SHUTDOWN", true);
            Server.rig.Shutdown();
            SignalR.StopConnection();
            Server.rig = null;
        }
    }
    SetupVariables() {
        Server.signalr = Server.serverurl + "/righub";
    }
    GetName() {
        return "server";
    }
}
//# sourceMappingURL=server.js.map