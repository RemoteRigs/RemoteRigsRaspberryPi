import SignalR from '../../common/signalr.js';
import { ComponentStatusViewModel, StatusModel, RigComponentStatusModel } from '../../models/models.js';


export default class Status {
    protected last_value: number | null = null;

    protected rig_id: number;
    protected component_id: number;
    protected status: ComponentStatusViewModel;

    constructor(status: ComponentStatusViewModel, rig_id: number, component_id: number) {
        this.rig_id = rig_id;
        this.component_id = component_id;
        this.status = status;
    }

    public UpdateStatus(value: number): void {
        if (this.last_value !== value) {
            this.last_value = value;
            this.SendUpdateStatus(value);
        }
    }

    public SendCurrent(): void {
        if (this.last_value != null) {
            this.SendUpdateStatus(this.last_value);
        }
    }

    public GetValue(): number | null {
        return this.last_value;
    }

    public GetName(): string {
        return "status #" + this.status.id + " name: '" + this.status.name + "' component #" + this.component_id;
    }

    private SendUpdateStatus(value: number): void {
        if (SignalR.IsConnected()) {
            var tUpdateStatusModel: StatusModel = new StatusModel();

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