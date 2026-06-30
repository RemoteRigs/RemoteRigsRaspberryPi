import Component from './component/component.js';
import Debug from './common/debug.js';
import SignalR from './common/signalr.js';

import { RigClientViewModel, KeyEventClientModel, WebRTCMessage, StatusModel, StatusType, RigModelLoadedModel } from './models/models.js';

export default class Rig {

    public rig: RigClientViewModel;

    private components: Array<Component>;

    constructor(rigModel: RigClientViewModel) {
        this.rig = rigModel;
        this.components = new Array<Component>();

        for (var i = 0; i < this.rig.logSettings.length; i++) {
            var text = "logSettingType: " + Debug.GetStringValue(this.rig.logSettings[i].logSettingType);

            if (this.rig.logSettings[i].parameter1 != undefined) {
                text += " / parameter1: " + this.rig.logSettings[i].parameter1;
            }

            Debug.LogAlways("#" + this.rig.logSettings[i].id + " log setting", text, true);
        }

        Debug.LogAlways(this.GetName(), "Rig instance '" + this.rig.name + "' created", true);
    }

    public CreateComponents(): void {
        Debug.LogAlways(this.GetName(), "CreateComponents this.rig.rigModelViewModel.components.length: " + this.rig.rigModelViewModel.components.length, true);

        for (var i = 0; i < this.rig.rigModelViewModel.components.length; i++) {
            try {
                this.components.push(new Component(this, this.rig.rigModelViewModel.components[i], this.rig.clientRTCConfigurationViewModel, null));
            }
            catch (ex) {
                Debug.Error(this.GetName(), "FAILED TO CREATE CHILD COMPONENT: " + ex);
            }
        }
    }

    public Init(): void {
        for (var i = 0; i < this.components.length; i++) {
            this.components[i].Init();
        }
    }

    public Shutdown(): void {
        for (var i = 0; i < this.components.length; i++) {
            this.components[i].Shutdown();
        }
    }

    public SendCurrent(): void {
        var tStatusModel = new StatusModel();

        tStatusModel.type = StatusType.RigModelLoaded;

        var tRigLoadedModel = new RigModelLoadedModel();
        tRigLoadedModel.rigId = this.rig.id;
        tRigLoadedModel.rigModelVersion = this.rig.rigModelViewModel.version;

        tStatusModel.value = tRigLoadedModel;

        SignalR.UpdateStatus(tStatusModel);

        for (var i = 0; i < this.components.length; i++) {
            this.components[i].SendCurrent();
        }
    }

    public ProcessKeyEvent(event: KeyEventClientModel): void {
        for (var i = 0; i < this.components.length; i++) {
            this.components[i].ProcessKeyEvent(event);
        }
    }

    public PutWebRTCMessage(message: WebRTCMessage): void {
        for (var i = 0; i < this.components.length; i++) {
            this.components[i].PutWebRTCMessage(message);
        }
    }

    private GetName(): string {
        return "rig #" + this.rig.id;
    }
}