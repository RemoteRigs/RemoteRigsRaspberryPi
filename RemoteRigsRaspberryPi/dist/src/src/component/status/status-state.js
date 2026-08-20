import Debug from '../../common/debug.js';
import Status from './status.js';
export default class StatusState extends Status {
    constructor(status, rig_id, component_id) {
        super(status, rig_id, component_id);
    }
    SelectState(value) {
        for (var i = 0; i < this.status.states.length; i++) {
            if (this.status.states[i].name == value) {
                this.UpdateStatus(this.status.states[i].id);
                return;
            }
        }
        Debug.LogAlways(this.GetName(), "UNKNOWN STATE: '" + value + "'", true);
    }
    GetValueStr() {
        if (this.last_value != null) {
            for (var i = 0; i < this.status.states.length; i++) {
                if (this.status.states[i].id == this.last_value) {
                    return this.status.states[i].name;
                }
            }
        }
        return "";
    }
}
//# sourceMappingURL=status-state.js.map