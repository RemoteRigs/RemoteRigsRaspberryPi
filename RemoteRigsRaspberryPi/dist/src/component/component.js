import Debug from '../common/debug.js';
import WebRTCStreamerWrapper from "../common/webrtc-streamer-wrapper.js";
import Code from "../common/code.js";
import StatusNumber from './status/status-number.js';
import StatusState from './status/status-state.js';
import Pin from './pin/pin.js';
import Property from './property/property.js';
import Input from './input/input.js';
import { CodeBlockType, ComponentType, HighScoreModel, LogSettingType, StatusType } from '../models/models.js';
import SignalR from '../common/signalr.js';
export default class Component {
    constructor(rig, component, clientRTCConfigurationViewModel, parent) {
        this.rig = rig;
        this.child = {};
        this.property = {};
        this.input = {};
        this.pin = {};
        this.status = {};
        this.boolean = {};
        this.number = {};
        this.string = {};
        this.timeout = {};
        this.streamer = null;
        this.callback = null;
        this.SandboxVars = {};
        this.component = component;
        this.parent = parent;
        this.clientRTCConfigurationViewModel = clientRTCConfigurationViewModel;
        this.Log("component: " + this.component.id + " " + this.component.name);
        for (var i = 0; i < this.component.children.length; i++) {
            try {
                var child = new Component(this.rig, this.component.children[i], this.clientRTCConfigurationViewModel, this);
                this.child[child.GetStorageName()] = child;
            }
            catch (ex) {
                this.Error("FAILED TO CREATE CHILD COMPONENT: " + ex);
            }
        }
        for (var i = 0; i < this.component.properties.length; i++) {
            this.property[this.component.properties[i].componentDefinitionPropertyName.toLowerCase()] = new Property(this.component.properties[i]);
            this.Log(this.property[this.component.properties[i].componentDefinitionPropertyName.toLowerCase()].GetLogMessage());
        }
        for (var i = 0; i < this.component.inputs.length; i++) {
            this.input[this.component.inputs[i].componentDefinitionInputName] = new Input(this.component.inputs[i]);
            this.Log(this.input[this.component.inputs[i].componentDefinitionInputName].GetLogMessage());
        }
        for (var i = 0; i < this.component.pins.length; i++) {
            this.pin[this.component.pins[i].componentDefinitionMicroControllerPinName] = new Pin(this, this.component.pins[i]);
            this.Log(this.pin[this.component.pins[i].componentDefinitionMicroControllerPinName].GetLogMessage());
        }
        for (var i = 0; i < this.component.status.length; i++) {
            switch (this.component.status[i].type) {
                case StatusType.RigComponentStates:
                    this.status[this.component.status[i].name.toLowerCase()] = new StatusState(this.component.status[i], rig.rig.id, this.component.id);
                    break;
                case StatusType.RigComponentNumber:
                    this.status[this.component.status[i].name.toLowerCase()] = new StatusNumber(this.component.status[i], rig.rig.id, this.component.id);
                    break;
                default:
                    Debug.Error(this.GetName(), "UNKNOWN STATUS TYPE: '" + this.component.status[i].type + "'");
            }
            this.Log("status: '" + this.component.status[i].name.toLowerCase() + "'");
        }
        for (var i = 0; i < this.component.codeBlocks.length; i++) {
            if (this.component.codeBlocks[i].type == CodeBlockType.Function) {
                try {
                    switch (this.component.codeBlocks[i].parameters.length) {
                        case 1:
                            this[this.component.codeBlocks[i].name] = new Function(this.component.codeBlocks[i].parameters[0].name, this.component.codeBlocks[i].code);
                            break;
                        case 2:
                            this[this.component.codeBlocks[i].name] = new Function(this.component.codeBlocks[i].parameters[0].name, this.component.codeBlocks[i].parameters[1].name, this.component.codeBlocks[i].code);
                            break;
                        case 3:
                            this[this.component.codeBlocks[i].name] = new Function(this.component.codeBlocks[i].parameters[0].name, this.component.codeBlocks[i].parameters[1].name, this.component.codeBlocks[i].parameters[2].name, this.component.codeBlocks[i].code);
                            break;
                        case 4:
                            this[this.component.codeBlocks[i].name] = new Function(this.component.codeBlocks[i].parameters[0].name, this.component.codeBlocks[i].parameters[1].name, this.component.codeBlocks[i].parameters[2].name, this.component.codeBlocks[i].parameters[3].name, this.component.codeBlocks[i].code);
                            break;
                        case 5:
                            this[this.component.codeBlocks[i].name] = new Function(this.component.codeBlocks[i].parameters[0].name, this.component.codeBlocks[i].parameters[1].name, this.component.codeBlocks[i].parameters[2].name, this.component.codeBlocks[i].parameters[3].name, this.component.codeBlocks[i].parameters[4].name, this.component.codeBlocks[i].code);
                            break;
                        case 6:
                            this[this.component.codeBlocks[i].name] = new Function(this.component.codeBlocks[i].parameters[0].name, this.component.codeBlocks[i].parameters[1].name, this.component.codeBlocks[i].parameters[2].name, this.component.codeBlocks[i].parameters[3].name, this.component.codeBlocks[i].parameters[4].name, this.component.codeBlocks[i].parameters[5].name, this.component.codeBlocks[i].code);
                            break;
                        case 7:
                            this[this.component.codeBlocks[i].name] = new Function(this.component.codeBlocks[i].parameters[0].name, this.component.codeBlocks[i].parameters[1].name, this.component.codeBlocks[i].parameters[2].name, this.component.codeBlocks[i].parameters[3].name, this.component.codeBlocks[i].parameters[4].name, this.component.codeBlocks[i].parameters[5].name, this.component.codeBlocks[i].parameters[6].name, this.component.codeBlocks[i].code);
                            break;
                        default:
                            this[this.component.codeBlocks[i].name] = new Function(this.component.codeBlocks[i].code);
                            break;
                    }
                    this.Log("codeblock: '" + this.component.codeBlocks[i].name.toLowerCase() + "'");
                }
                catch (ex) {
                    if (ex instanceof Error) {
                        this.LogAlways("Syntax error adding the function '" + this.component.codeBlocks[i].name + "' to component '" + this.component.name + "' (#" + this.component.id + ")");
                        this.LogAlways("Error:" + ex.message);
                    }
                    else {
                        this.Error("UNKNOWN ERROR ADDING THE FUNCTION '" + this.component.codeBlocks[i].name + "' TO COMPONENT '" + this.component.name + "' (#" + this.component.id + "): " + ex);
                    }
                }
            }
        }
        this.SandboxVars = Code.GetComponentContext(this);
        var allFunctions = new Array();
        this.GetFunctions(allFunctions);
        for (const func of allFunctions) {
            //this.Log("func added to SandboxVars: '" + func + "'");
            this.SandboxVars[func] = this[func];
        }
    }
    Init() {
        for (const key in this.child) {
            this.child[key].Init();
        }
        if (this.component.componentType == ComponentType.Camera) {
            var devicePath = this.GetProperty("devicepath");
            if (devicePath != undefined) {
                if (this.clientRTCConfigurationViewModel != undefined) {
                    this.streamer = new WebRTCStreamerWrapper(this, this.clientRTCConfigurationViewModel, this.rig.rig.videoType);
                    this.streamer.Start().catch(console.error);
                    this.Log("init webcam streamer success: " + devicePath);
                }
                else {
                    this.Log("init webcam FAILED; missing clientRTCConfigurationViewModel");
                }
            }
            else {
                this.Log("init webcam FAILED; missing devicepath");
            }
        }
        for (var i = 0; i < this.component.codeBlocks.length; i++) {
            if (this.component.codeBlocks[i].type == CodeBlockType.Init) {
                try {
                    eval(this.component.codeBlocks[i].code);
                }
                catch (ex_eval) {
                    try {
                        Code.runSandboxed(this.component.codeBlocks[i].code, this.SandboxVars);
                    }
                    catch (ex) {
                        this.Log("ERROR during execution of code block #" + this.component.codeBlocks[i].id + " '" + this.component.codeBlocks[i].name + "' - error: " + ex);
                    }
                }
            }
        }
    }
    Shutdown() {
        for (const key in this.child) {
            this.child[key].Shutdown();
        }
        for (var i = 0; i < this.component.codeBlocks.length; i++) {
            if (this.component.codeBlocks[i].type == CodeBlockType.Shutdown) {
                try {
                    eval(this.component.codeBlocks[i].code);
                }
                catch (ex_eval) {
                    try {
                        Code.runSandboxed(this.component.codeBlocks[i].code, this.SandboxVars);
                    }
                    catch (ex) {
                        this.Log("ERROR during execution of shutdown code block #" + this.component.codeBlocks[i].id + " '" + this.component.codeBlocks[i].name + "' - error: " + ex);
                    }
                }
            }
        }
    }
    ProcessKeyEvent(event) {
        Debug.Log(LogSettingType.KeyEvents, undefined, this.GetName(), "ProcessKeyEvent: componentInputId=" + event.componentInputId + " type=" + event.type + " timestamp: " + event.timeStamp);
        for (const key in this.child) {
            this.child[key].ProcessKeyEvent(event);
        }
        for (var i = 0; i < this.component.codeBlocks.length; i++) {
            if (this.component.codeBlocks[i].type == CodeBlockType.ProcessKeyEvent) {
                try {
                    eval(this.component.codeBlocks[i].code);
                }
                catch (ex_eval) {
                    try {
                        Code.runSandboxed(this.component.codeBlocks[i].code, {
                            event: event,
                            ...this.SandboxVars,
                        });
                    }
                    catch (ex) {
                        this.Log("ERROR during execution of ProcessKeyEvent code block #" + this.component.codeBlocks[i].id + " '" + this.component.codeBlocks[i].name + "' - error: " + ex);
                    }
                }
            }
        }
    }
    PutWebRTCMessage(message) {
        if (this.component.id == message.componentId) {
            this.Log("PutWebRTCMessage userName: " + message.userName + " rigOwnerUsername: " + message.rigOwnerUsername);
            if (this.streamer != null) {
                this.streamer.PutWebRTCMessage(message);
            }
            else {
                this.Error("No streamer to put WebRTC message to.");
            }
        }
        else {
            for (const key in this.child) {
                this.child[key].PutWebRTCMessage(message);
            }
        }
    }
    SendCurrent() {
        for (const key in this.child) {
            this.child[key].SendCurrent();
        }
        for (const key in this.status) {
            this.status[key].SendCurrent();
        }
    }
    PinAlert(code, level, tick) {
        try {
            eval(code.code);
        }
        catch (ex_eval) {
            try {
                Code.runSandboxed(code.code, {
                    level: level,
                    tick: tick,
                    ...this.SandboxVars,
                });
            }
            catch (ex) {
                this.Log("ERROR during execution of PinAlert code block #" + code.id + " '" + code.name + "' - error: " + ex);
            }
        }
    }
    SetCallback(callback) {
        this.callback = callback;
    }
    SetStatus(status, value) {
        if (this.status.hasOwnProperty(status.toLowerCase())) {
            this.status[status.toLowerCase()].UpdateStatus(value);
        }
        else {
            this.Error("Status not found: '" + status + "'");
        }
    }
    SetStatusState(status, value) {
        if (this.status.hasOwnProperty(status.toLowerCase())) {
            this.status[status.toLowerCase()].SelectState(value);
        }
    }
    GetStatus(status) {
        if (this.status.hasOwnProperty(status.toLowerCase())) {
            var value = this.status[status.toLowerCase()].GetValue();
            if (value != null) {
                return value;
            }
        }
        else {
            this.Error("Status not found: '" + status + "'");
        }
        return 0;
    }
    GetStatusState(status) {
        if (this.status.hasOwnProperty(status.toLowerCase())) {
            this.status[status.toLowerCase()].GetValueStr();
        }
        return "";
    }
    GetName() {
        var name = "";
        if (this.parent != null) {
            name = this.parent.GetName() + " > ";
        }
        name += "#" + this.component.id + " " + this.component.name;
        return name;
    }
    GetStorageName() {
        return this.component.componentDefinitionName.toLowerCase();
    }
    GetChild(name) {
        if (this.child.hasOwnProperty(name.toLowerCase())) {
            return this.child[name.toLowerCase()];
        }
        else {
            this.Log("Child not found: '" + name + "'");
            var av = "";
            for (const key in this.child) {
                if (av != "") {
                    av += ", ";
                }
                av += "'" + key + "'";
            }
            this.Log("Children names: " + av);
            return this;
        }
    }
    Log(message) {
        Debug.Log(LogSettingType.Component, this.component.id, this.GetName(), message);
    }
    LogAlways(message) {
        Debug.LogAlways(this.GetName(), message, true);
    }
    Error(message) {
        Debug.Error(this.GetName(), message);
    }
    GetProperty(name) {
        if (!this.property.hasOwnProperty(name.toLowerCase())) {
            this.Log("Property not found: '" + name + "'");
            return "";
        }
        return this.property[name.toLowerCase()].value;
    }
    GetPropertyNumber(name) {
        if (!this.property.hasOwnProperty(name.toLowerCase())) {
            this.Log("Property not found: '" + name + "'");
            return 0;
        }
        return parseInt(this.property[name.toLowerCase()].value);
    }
    SetTimeOut(name, callback, delay) {
        this.ResetTimeOut(name);
        this.timeout[name] = setTimeout(callback, delay);
    }
    ResetTimeOut(name) {
        if (this.timeout[name] != undefined) {
            clearTimeout(this.timeout[name]);
            delete this.timeout[name];
        }
    }
    IsEventInput(name, event) {
        if (this.input[name] != undefined) {
            if (this.input[name].componentInputId == event.componentInputId) {
                return true;
            }
        }
        else {
            this.Error("Input not found: '" + name + "'");
        }
        return false;
    }
    GetFunctions(functions) {
        //for (const key in this.child) {
        //    this.child[key].GetFunctions(functions);
        //}
        for (var i = 0; i < this.component.codeBlocks.length; i++) {
            if (this.component.codeBlocks[i].type == CodeBlockType.Function) {
                functions.push(this.component.codeBlocks[i].name);
            }
        }
    }
    AddPointsToCurrentSessionHighScore(points) {
        var highScoreModel = new HighScoreModel();
        highScoreModel.points = points;
        this.Log("Adding " + points + " points to current session high score.");
        SignalR.AddHighScorePoints(highScoreModel);
    }
}
//# sourceMappingURL=component.js.map