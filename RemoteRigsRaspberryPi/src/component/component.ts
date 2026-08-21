import Debug from '../common/debug.js';
import WebRTCStreamerWrapper from "../common/webrtc-streamer-wrapper.js";
import Code, { SandboxVars } from "../common/code.js";

import StatusNumber from './status/status-number.js';
import StatusState from './status/status-state.js';
import Status from './status/status.js';

import Pin from './pin/pin.js';
import Property from './property/property.js';
import Input from './input/input.js';

import { ClientRTCConfigurationViewModel, CodeBlockType, CodeBlockViewModel, ComponentType, ComponentViewModel, HighScoreModel, KeyEventClientModel, LogSettingType, StatusType, WebRTCMessage } from '../models/models.js';
import SignalR from '../common/signalr.js';
import Rig from '../rig.js';

type CallbackType = () => void;

export default class Component {
    public component: ComponentViewModel;
    public parent: Component | null;

    public child: Record<string, Component> = {};
    public property: Record<string, Property> = {};
    public input: Record<string, Input> = {};
    public pin: Record<string, Pin> = {};
    public status: Record<string, Status> = {};

    public boolean: Record<string, boolean> = {};
    public number: Record<string, number> = {};
    public string: Record<string, string> = {};
    public timeout: Record<string, ReturnType<typeof setTimeout>> = {};

    public streamer: WebRTCStreamerWrapper | null = null;
    public callback: CallbackType | null = null;

    public SandboxVars: SandboxVars = {};

    private clientRTCConfigurationViewModel: ClientRTCConfigurationViewModel | undefined;

    constructor(private rig: Rig, component: ComponentViewModel, clientRTCConfigurationViewModel: ClientRTCConfigurationViewModel | undefined, parent: Component | null) {
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
                            (this as any)[this.component.codeBlocks[i].name] = new Function(this.component.codeBlocks[i].parameters[0].name, this.component.codeBlocks[i].code);
                            break;
                        case 2:
                            (this as any)[this.component.codeBlocks[i].name] = new Function(this.component.codeBlocks[i].parameters[0].name, this.component.codeBlocks[i].parameters[1].name, this.component.codeBlocks[i].code);
                            break;
                        case 3:
                            (this as any)[this.component.codeBlocks[i].name] = new Function(this.component.codeBlocks[i].parameters[0].name, this.component.codeBlocks[i].parameters[1].name, this.component.codeBlocks[i].parameters[2].name, this.component.codeBlocks[i].code);
                            break;
                        case 4:
                            (this as any)[this.component.codeBlocks[i].name] = new Function(this.component.codeBlocks[i].parameters[0].name,
                                this.component.codeBlocks[i].parameters[1].name,
                                this.component.codeBlocks[i].parameters[2].name,
                                this.component.codeBlocks[i].parameters[3].name,
                                this.component.codeBlocks[i].code);
                            break;
                        case 5:
                            (this as any)[this.component.codeBlocks[i].name] = new Function(this.component.codeBlocks[i].parameters[0].name,
                                this.component.codeBlocks[i].parameters[1].name,
                                this.component.codeBlocks[i].parameters[2].name,
                                this.component.codeBlocks[i].parameters[3].name,
                                this.component.codeBlocks[i].parameters[4].name,
                                this.component.codeBlocks[i].code);
                            break;
                        case 6:
                            (this as any)[this.component.codeBlocks[i].name] = new Function(this.component.codeBlocks[i].parameters[0].name,
                                this.component.codeBlocks[i].parameters[1].name,
                                this.component.codeBlocks[i].parameters[2].name,
                                this.component.codeBlocks[i].parameters[3].name,
                                this.component.codeBlocks[i].parameters[4].name,
                                this.component.codeBlocks[i].parameters[5].name,
                                this.component.codeBlocks[i].code);
                            break;
                        case 7:
                            (this as any)[this.component.codeBlocks[i].name] = new Function(this.component.codeBlocks[i].parameters[0].name,
                                this.component.codeBlocks[i].parameters[1].name,
                                this.component.codeBlocks[i].parameters[2].name,
                                this.component.codeBlocks[i].parameters[3].name,
                                this.component.codeBlocks[i].parameters[4].name,
                                this.component.codeBlocks[i].parameters[5].name,
                                this.component.codeBlocks[i].parameters[6].name,
                                this.component.codeBlocks[i].code);
                            break;
                        default:
                            (this as any)[this.component.codeBlocks[i].name] = new Function(this.component.codeBlocks[i].code);
                            break;
                    }

                    this.Log("codeblock: '" + this.component.codeBlocks[i].name.toLowerCase() + "'");
                }
                catch (ex) {
                    if (ex instanceof Error) {
                        this.LogAlways("Syntax error adding the function '" + this.component.codeBlocks[i].name + "' to component '" + this.component.name + "' (#" + this.component.id + ")");
                        this.LogAlways("Error:" + ex.message);
                    } else {
                        this.Error("UNKNOWN ERROR ADDING THE FUNCTION '" + this.component.codeBlocks[i].name + "' TO COMPONENT '" + this.component.name + "' (#" + this.component.id + "): " + ex);
                    }
                }
            }
        }

        this.SandboxVars = Code.GetComponentContext(this);

        var allFunctions = new Array<string>();
        this.GetFunctions(allFunctions);

        for (const func of allFunctions) {
            //this.Log("func added to SandboxVars: '" + func + "'");

            this.SandboxVars[func] = (this as any)[func];
        }
    }

    public Init(): void {
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

    public Shutdown(): void {
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

    public ProcessKeyEvent(event: KeyEventClientModel): void {
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

    public PutWebRTCMessage(message: WebRTCMessage): void {
        if (this.component.id == message.componentId) {
            this.Log("PutWebRTCMessage userName: " + message.userName + " rigOwnerUsername: " + message.rigOwnerUsername);

            if (this.streamer != null) {
                this.streamer.PutWebRTCMessage(message);
            } else {
                this.Error("No streamer to put WebRTC message to.");
            }
        }
        else {
            for (const key in this.child) {
                this.child[key].PutWebRTCMessage(message);
            }
        }
    }

    public SendCurrent(): void {
        for (const key in this.child) {
            this.child[key].SendCurrent();
        }

        for (const key in this.status) {
            this.status[key].SendCurrent();
        }
    }

    public PinAlert(code: CodeBlockViewModel, level: number, tick: number): void {
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

    public SetCallback(callback: CallbackType | null): void {
        this.callback = callback;
    }

    public SetStatus(status: string, value: number): void {
        if (this.status.hasOwnProperty(status.toLowerCase())) {
            this.status[status.toLowerCase()].UpdateStatus(value);
        } else {
            this.Error("Status not found: '" + status + "'");
        }
    }

    public SetStatusState(status: string, value: string): void {
        if (this.status.hasOwnProperty(status.toLowerCase())) {
            (this.status[status.toLowerCase()] as StatusState).SelectState(value);
        }
    }

    public GetStatus(status: string): number {
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

    public GetStatusState(status: string): string {
        if (this.status.hasOwnProperty(status.toLowerCase())) {
            (this.status[status.toLowerCase()] as StatusState).GetValueStr();
        }

        return "";
    }

    public GetName(): string {
        var name = "";

        if (this.parent != null) {
            name = this.parent.GetName() + " > ";
        }

        name += "#" + this.component.id + " " + this.component.name;

        return name;
    }

    public GetStorageName(): string {
        return this.component.componentDefinitionName.toLowerCase();
    }

    public GetChild(name: string): Component {
        if (this.child.hasOwnProperty(name.toLowerCase())) {
            return this.child[name.toLowerCase()];
        } else {
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

    public Log(message: string): void {
        Debug.Log(LogSettingType.Component, this.component.id, this.GetName(), message);
    }

    public LogAlways(message: string): void {
        Debug.LogAlways(this.GetName(), message, true);
    }

    public Error(message: string): void {
        Debug.Error(this.GetName(), message);
    }

    public GetProperty(name: string): string | undefined {
        if (!this.property.hasOwnProperty(name.toLowerCase())) {
            this.Log("Property not found: '" + name + "'");
            return "";
        }

        return this.property[name.toLowerCase()].value;
    }

    public GetPropertyNumber(name: string): number | undefined {
        if (!this.property.hasOwnProperty(name.toLowerCase())) {
            this.Log("Property not found: '" + name + "'");
            return 0;
        }

        return parseInt(this.property[name.toLowerCase()].value);
    }

    public SetTimeOut(name: string, callback: (_: void) => void, delay: number): void {
        this.ResetTimeOut(name);
        this.timeout[name] = setTimeout(callback, delay);
    }

    public ResetTimeOut(name: string): void {
        if (this.timeout[name] != undefined) {
            clearTimeout(this.timeout[name]);
            delete this.timeout[name];
        }
    }

    public IsEventInput(name: string, event: KeyEventClientModel): boolean {
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

    public GetFunctions(functions: Array<string>): void {

        //for (const key in this.child) {
        //    this.child[key].GetFunctions(functions);
        //}

        for (var i = 0; i < this.component.codeBlocks.length; i++) {
            if (this.component.codeBlocks[i].type == CodeBlockType.Function) {
                functions.push(this.component.codeBlocks[i].name);
            }
        }
    }

    public AddPointsToCurrentSessionHighScore(points: number): void {
        var highScoreModel = new HighScoreModel();

        highScoreModel.points = points;

        this.Log("Adding " + points + " points to current session high score.");

        SignalR.AddHighScorePoints(highScoreModel);
    }
}