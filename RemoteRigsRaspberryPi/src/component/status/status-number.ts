import { ComponentStatusViewModel } from '../../models/models.js';
import Status from './status.js';

export default class StatusNumber extends Status {
    constructor(status: ComponentStatusViewModel, rig_id: number, component_id: number) {
        super(status, rig_id, component_id);
    }
}