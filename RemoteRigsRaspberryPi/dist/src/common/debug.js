import { LogModel, LogSettingType, StatusModel, StatusType } from '../models/models.js';
import Server from "../server.js";
import SignalR from "./signalr.js";
export default class Debug {
    // Timings
    static { this.watchdogtimer = 1000; }
    static { this.pwmdelay = 100; }
    static { this.pwmstart = 120; }
    static { this.pwm_frequency = 800; }
    static { this.pwm_dutycycle_max = 1000000; }
    static { this.time_to_full_speed_ms = 10000; }
    static { this.commandtimer = 500; }
    static SetErrorCallback(callback_param) {
        Debug.error_callback = callback_param;
    }
    static Log(pVehicleSettingType, id, name, message) {
        if (Debug.GetLogSetting(pVehicleSettingType, id)) {
            Debug.LogAlways(name, message, true);
        }
    }
    static LogAlways(name, message, signalr) {
        var date = new Date();
        if (signalr) {
            var logModel = new LogModel();
            logModel.dateTime = date;
            logModel.name = name;
            logModel.message = message;
            Debug.SendLogModel(logModel);
        }
        console.log(date.toLocaleTimeString() + " / " + name + " / " + message);
    }
    static Error(name, message) {
        var date = new Date();
        var logModel = new LogModel();
        logModel.dateTime = date;
        logModel.name = name;
        logModel.message = message;
        Debug.SendLogModel(logModel);
        console.error(date.toLocaleTimeString() + " / " + name + " / " + message);
        Debug.error_callback();
    }
    static SendLogModel(logModel) {
        if (Server.rig != null) {
            var tStatusModel = new StatusModel();
            tStatusModel.type = StatusType.RigLog;
            tStatusModel.value = logModel;
            SignalR.UpdateStatus(tStatusModel);
        }
    }
    static GetLogSetting(pLogSettingType, id) {
        if (Server.rig != null) {
            for (var i = 0; i < Server.rig.rig.logSettings.length; i++) {
                if (Server.rig.rig.logSettings[i].logSettingType == pLogSettingType &&
                    Server.rig.rig.logSettings[i].parameter1 == id) {
                    return true;
                }
            }
        }
        return false;
    }
    static GetStringValue(logSettingType) {
        switch (logSettingType) {
            case LogSettingType.BLESensor:
                return "BLESensor";
            case LogSettingType.Commands:
                return "Commands";
            case LogSettingType.KeyEvents:
                return "KeyEvents";
            case LogSettingType.SignalR:
                return "SignalR";
            case LogSettingType.Component:
                return "Component";
        }
        return "";
    }
}
//# sourceMappingURL=debug.js.map