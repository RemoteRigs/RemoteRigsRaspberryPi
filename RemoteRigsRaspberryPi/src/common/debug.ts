import { LogModel, LogSettingType, StatusModel, StatusType } from '../models/models.js';
import Server from "../server.js";
import SignalR from "./signalr.js";

type CallbackType = () => void;

export default class Debug {

    // Timings
    public static watchdogtimer: number = 1000;
    public static pwmdelay: number = 100;
    public static pwmstart: number = 120;

    public static pwm_frequency: number = 800;
    public static pwm_dutycycle_max: number = 1000000;
    public static time_to_full_speed_ms: number = 10000;
    public static commandtimer: number = 500;
    //public time_to_full_speed_ms: number = 10000;

    // Debug
    private static error_callback: CallbackType;

    public static SetErrorCallback(callback_param: CallbackType): void {
        Debug.error_callback = callback_param;
    }

    public static Log(pVehicleSettingType: LogSettingType, id: number | undefined, name: string, message: string): void {
        if (Debug.GetLogSetting(pVehicleSettingType, id)) {
            Debug.LogAlways(name, message, true);
        }
    }

    public static LogAlways(name: string, message: string, signalr: boolean): void {
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

    public static Error(name: string, message: string): void {
        var date = new Date();
        var logModel = new LogModel();

        logModel.dateTime = date;
        logModel.name = name;
        logModel.message = message;

        Debug.SendLogModel(logModel);
        console.error(date.toLocaleTimeString() + " / " + name + " / " + message);

        Debug.error_callback();
    }

    public static SendLogModel(logModel: LogModel): void {
        if (Server.rig != null) {
            var tStatusModel = new StatusModel();

            tStatusModel.type = StatusType.RigLog;
            tStatusModel.value = logModel;

            SignalR.UpdateStatus(tStatusModel);
        }
    }

    public static GetLogSetting(pLogSettingType: LogSettingType, id?: number): boolean {
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

    public static GetStringValue(logSettingType: LogSettingType): string {
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