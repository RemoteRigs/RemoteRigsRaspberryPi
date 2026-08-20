import SignalR from '../../common/signalr.js';
import { StatusModel, RigComponentStatusModel } from '../../models/models.js';
export default class Status {
    constructor(status, rig_id, component_id) {
        this.last_value = null;
        this.rig_id = rig_id;
        this.component_id = component_id;
        this.status = status;
    }
    UpdateStatus(value) {
        if (this.last_value !== value) {
            this.last_value = value;
            this.SendUpdateStatus(value);
        }
    }
    SendCurrent() {
        if (this.last_value != null) {
            this.SendUpdateStatus(this.last_value);
        }
    }
    GetValue() {
        return this.last_value;
    }
    GetName() {
        return "status #" + this.status.id + " name: '" + this.status.name + "' component #" + this.component_id;
    }
    SendUpdateStatus(value) {
        if (SignalR.IsConnected()) {
            var tUpdateStatusModel = new StatusModel();
            tUpdateStatusModel.type = this.status.type;
            var tRigComponentStatusModel = new RigComponentStatusModel();
            tRigComponentStatusModel.rigId = this.rig_id;
            tRigComponentStatusModel.componentId = this.component_id;
            tRigComponentStatusModel.statusId = this.status.id;
            tRigComponentStatusModel.value = value;
            tUpdateStatusModel.value = tRigComponentStatusModel;
            SignalR.UpdateStatus(tUpdateStatusModel);
        }
    }
}
//# sourceMappingURL=status.js.map