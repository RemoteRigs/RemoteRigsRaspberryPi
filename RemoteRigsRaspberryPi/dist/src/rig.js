import Component from './component/component.js';
import Debug from './common/debug.js';
import SignalR from './common/signalr.js';
import { StatusModel, StatusType, RigModelLoadedModel } from './models/models.js';
export default class Rig {
    constructor(rigModel) {
        this.rig = rigModel;
        this.components = new Array();
        for (var i = 0; i < this.rig.logSettings.length; i++) {
            var text = "logSettingType: " + Debug.GetStringValue(this.rig.logSettings[i].logSettingType);
            if (this.rig.logSettings[i].parameter1 != undefined) {
                text += " / parameter1: " + this.rig.logSettings[i].parameter1;
            }
            Debug.LogAlways("#" + this.rig.logSettings[i].id + " log setting", text, true);
        }
        Debug.LogAlways(this.GetName(), "rig instance created & log settings loaded", true);
    }
    CreateComponents() {
        Debug.LogAlways(this.GetName(), "creating components for rig (" + this.rig.rigModelViewModel.components.length + " component(s))", true);
        for (var i = 0; i < this.rig.rigModelViewModel.components.length; i++) {
            try {
                this.components.push(new Component(this, this.rig.rigModelViewModel.components[i], this.rig.clientRTCConfigurationViewModel, null));
            }
            catch (ex) {
                Debug.Error(this.GetName(), "FAILED TO CREATE CHILD COMPONENT: " + ex);
            }
        }
        Debug.LogAlways(this.GetName(), "rig components created", true);
    }
    Init() {
        for (var i = 0; i < this.components.length; i++) {
            this.components[i].Init();
        }
        Debug.LogAlways(this.GetName(), "rig 'init' functions executed", true);
    }
    Shutdown() {
        for (var i = 0; i < this.components.length; i++) {
            this.components[i].Shutdown();
        }
    }
    SendCurrent() {
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
        Debug.LogAlways(this.GetName(), "rig current status send to server", true);
    }
    ProcessKeyEvent(event) {
        for (var i = 0; i < this.components.length; i++) {
            this.components[i].ProcessKeyEvent(event);
        }
    }
    PutWebRTCMessage(message) {
        for (var i = 0; i < this.components.length; i++) {
            this.components[i].PutWebRTCMessage(message);
        }
    }
    GetName() {
        return "rig #" + this.rig.id;
    }
}
//# sourceMappingURL=rig.js.map