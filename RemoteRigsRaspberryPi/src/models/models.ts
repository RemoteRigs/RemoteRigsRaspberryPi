
export enum StatusType {
    RigComponentNumber = 1,
    RigComponentStates = 2,
    RigOnline = 3,
    RigModelLoaded = 4,
    RigLog = 5,
    RigOperator = 6,
    RigComponentCamera = 7,
    WorldStatus = 100,
    WorldQueuePositions = 101,
    WorldActiveSession = 102,
}
export class ComponentStatusViewModel implements IComponentStatusViewModel {
    id!: number;
    componentId!: number;
    name!: string;
    type!: StatusType;
    states!: ComponentStatusStateViewModel[];

    constructor(data?: IComponentStatusViewModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
        if (!data) {
            this.states = [];
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.componentId = _data["componentId"];
            this.name = _data["name"];
            this.type = _data["type"];
            if (Array.isArray(_data["states"])) {
                this.states = [] as any;
                for (let item of _data["states"])
                    this.states!.push(ComponentStatusStateViewModel.fromJS(item));
            }
        }
    }

    static fromJS(data: any): ComponentStatusViewModel {
        data = typeof data === 'object' ? data : {};
        let result = new ComponentStatusViewModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["componentId"] = this.componentId;
        data["name"] = this.name;
        data["type"] = this.type;
        if (Array.isArray(this.states)) {
            data["states"] = [];
            for (let item of this.states)
                data["states"].push(item ? item.toJSON() : undefined as any);
        }
        return data;
    }
}

export interface IComponentStatusViewModel {
    id: number;
    componentId: number;
    name: string;
    type: StatusType;
    states: ComponentStatusStateViewModel[];
}

export class ComponentStatusStateViewModel implements IComponentStatusStateViewModel {
    id!: number;
    name!: string;

    constructor(data?: IComponentStatusStateViewModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.name = _data["name"];
        }
    }

    static fromJS(data: any): ComponentStatusStateViewModel {
        data = typeof data === 'object' ? data : {};
        let result = new ComponentStatusStateViewModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["name"] = this.name;
        return data;
    }
}

export interface IComponentStatusStateViewModel {
    id: number;
    name: string;
}

export class ClientRTCConfigurationViewModel implements IClientRTCConfigurationViewModel {
    stunServer!: string;
    turnServer!: string;

    constructor(data?: IClientRTCConfigurationViewModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.stunServer = _data["stunServer"];
            this.turnServer = _data["turnServer"];
        }
    }

    static fromJS(data: any): ClientRTCConfigurationViewModel {
        data = typeof data === 'object' ? data : {};
        let result = new ClientRTCConfigurationViewModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["stunServer"] = this.stunServer;
        data["turnServer"] = this.turnServer;
        return data;
    }
}

export interface IClientRTCConfigurationViewModel {
    stunServer: string;
    turnServer: string;
}

export class StatusModel implements IStatusModel {
    value?: any | undefined;
    type!: StatusType;

    constructor(data?: IStatusModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.value = _data["value"];
            this.type = _data["type"];
        }
    }

    static fromJS(data: any): StatusModel {
        data = typeof data === 'object' ? data : {};
        let result = new StatusModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["value"] = this.value;
        data["type"] = this.type;
        return data;
    }
}

export interface IStatusModel {
    value?: any | undefined;
    type: StatusType;
}

export class RigComponentStatusModel implements IRigComponentStatusModel {
    rigId!: number;
    worldId?: number | undefined;
    componentId!: number;
    statusId!: number;
    componentDefinitionStatusName!: string;
    componentName!: string;
    value?: number | undefined;
    valueStr!: string;

    constructor(data?: IRigComponentStatusModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.rigId = _data["rigId"];
            this.worldId = _data["worldId"];
            this.componentId = _data["componentId"];
            this.statusId = _data["statusId"];
            this.componentDefinitionStatusName = _data["componentDefinitionStatusName"];
            this.componentName = _data["componentName"];
            this.value = _data["value"];
            this.valueStr = _data["valueStr"];
        }
    }

    static fromJS(data: any): RigComponentStatusModel {
        data = typeof data === 'object' ? data : {};
        let result = new RigComponentStatusModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["rigId"] = this.rigId;
        data["worldId"] = this.worldId;
        data["componentId"] = this.componentId;
        data["statusId"] = this.statusId;
        data["componentDefinitionStatusName"] = this.componentDefinitionStatusName;
        data["componentName"] = this.componentName;
        data["value"] = this.value;
        data["valueStr"] = this.valueStr;
        return data;
    }
}

export interface IRigComponentStatusModel {
    rigId: number;
    worldId?: number | undefined;
    componentId: number;
    statusId: number;
    componentDefinitionStatusName: string;
    componentName: string;
    value?: number | undefined;
    valueStr: string;
}

export class RigModelLoadedModel implements IRigModelLoadedModel {
    rigId!: number;
    rigModelVersion?: number | undefined;

    constructor(data?: IRigModelLoadedModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.rigId = _data["rigId"];
            this.rigModelVersion = _data["rigModelVersion"];
        }
    }

    static fromJS(data: any): RigModelLoadedModel {
        data = typeof data === 'object' ? data : {};
        let result = new RigModelLoadedModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["rigId"] = this.rigId;
        data["rigModelVersion"] = this.rigModelVersion;
        return data;
    }
}

export interface IRigModelLoadedModel {
    rigId: number;
    rigModelVersion?: number | undefined;
}

export class WebRTCMessage implements IWebRTCMessage {
    rigOwnerUsername!: string;
    rigId!: number;
    componentId!: number;
    webRTCConnectionType!: WebRTCConnectionType;
    sessionId!: string;
    username!: string;
    messageType!: string;
    message!: string;

    constructor(data?: IWebRTCMessage) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.rigOwnerUsername = _data["rigOwnerUsername"];
            this.rigId = _data["rigId"];
            this.componentId = _data["componentId"];
            this.webRTCConnectionType = _data["webRTCConnectionType"];
            this.sessionId = _data["sessionId"];
            this.username = _data["username"];
            this.messageType = _data["messageType"];
            this.message = _data["message"];
        }
    }

    static fromJS(data: any): WebRTCMessage {
        data = typeof data === 'object' ? data : {};
        let result = new WebRTCMessage();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["rigOwnerUsername"] = this.rigOwnerUsername;
        data["rigId"] = this.rigId;
        data["componentId"] = this.componentId;
        data["webRTCConnectionType"] = this.webRTCConnectionType;
        data["sessionId"] = this.sessionId;
        data["username"] = this.username;
        data["messageType"] = this.messageType;
        data["message"] = this.message;
        return data;
    }
}

export interface IWebRTCMessage {
    rigOwnerUsername: string;
    rigId: number;
    componentId: number;
    webRTCConnectionType: WebRTCConnectionType;
    sessionId: string;
    username: string;
    messageType: string;
    message: string;
}

export enum WebRTCConnectionType {
    Direct = 0,
    Relay = 1,
    File = 2,
}

export class KeyEventClientModel implements IKeyEventClientModel {
    componentInputId!: number;
    type!: string;
    timeStamp!: number;
    keyUp!: boolean;
    keyDown!: boolean;

    constructor(data?: IKeyEventClientModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.componentInputId = _data["componentInputId"];
            this.type = _data["type"];
            this.timeStamp = _data["timeStamp"];
            this.keyUp = _data["keyUp"];
            this.keyDown = _data["keyDown"];
        }
    }

    static fromJS(data: any): KeyEventClientModel {
        data = typeof data === 'object' ? data : {};
        let result = new KeyEventClientModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["componentInputId"] = this.componentInputId;
        data["type"] = this.type;
        data["timeStamp"] = this.timeStamp;
        data["keyUp"] = this.keyUp;
        data["keyDown"] = this.keyDown;
        return data;
    }
}

export interface IKeyEventClientModel {
    componentInputId: number;
    type: string;
    timeStamp: number;
    keyUp: boolean;
    keyDown: boolean;
}

export enum LogSettingType {
    None = 0,
    KeyEvents = 8,
    Commands = 9,
    BLESensor = 10,
    Component = 13,
    SignalR = 14,
}

export class RigClientViewModel implements IRigClientViewModel {
    id!: number;
    name!: string;
    uniqueCode!: string;
    videoType!: VideoType;
    rigModelViewModel!: RigModelViewModel;
    clientRTCConfigurationViewModel?: ClientRTCConfigurationViewModel | undefined;
    logSettings!: LogSettingViewModel[];

    constructor(data?: IRigClientViewModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
        if (!data) {
            this.rigModelViewModel = new RigModelViewModel();
            this.logSettings = [];
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.name = _data["name"];
            this.uniqueCode = _data["uniqueCode"];
            this.videoType = _data["videoType"];
            this.rigModelViewModel = _data["rigModelViewModel"] ? RigModelViewModel.fromJS(_data["rigModelViewModel"]) : new RigModelViewModel();
            this.clientRTCConfigurationViewModel = _data["clientRTCConfigurationViewModel"] ? ClientRTCConfigurationViewModel.fromJS(_data["clientRTCConfigurationViewModel"]) : undefined as any;
            if (Array.isArray(_data["logSettings"])) {
                this.logSettings = [] as any;
                for (let item of _data["logSettings"])
                    this.logSettings!.push(LogSettingViewModel.fromJS(item));
            }
        }
    }

    static fromJS(data: any): RigClientViewModel {
        data = typeof data === 'object' ? data : {};
        let result = new RigClientViewModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["name"] = this.name;
        data["uniqueCode"] = this.uniqueCode;
        data["videoType"] = this.videoType;
        data["rigModelViewModel"] = this.rigModelViewModel ? this.rigModelViewModel.toJSON() : undefined as any;
        data["clientRTCConfigurationViewModel"] = this.clientRTCConfigurationViewModel ? this.clientRTCConfigurationViewModel.toJSON() : undefined as any;
        if (Array.isArray(this.logSettings)) {
            data["logSettings"] = [];
            for (let item of this.logSettings)
                data["logSettings"].push(item ? item.toJSON() : undefined as any);
        }
        return data;
    }
}

export interface IRigClientViewModel {
    id: number;
    name: string;
    uniqueCode: string;
    videoType: VideoType;
    rigModelViewModel: RigModelViewModel;
    clientRTCConfigurationViewModel?: ClientRTCConfigurationViewModel | undefined;
    logSettings: LogSettingViewModel[];
}

export enum VideoType {
    VP8 = 0,
    H264 = 1,
}

export class RigModelViewModel implements IRigModelViewModel {
    id!: number;
    name!: string;
    username!: string;
    canBeDelete!: boolean;
    canBeEdited!: boolean;
    version!: number;
    microControllerId!: number;
    descriptionHTML!: string;
    components!: ComponentViewModel[];

    constructor(data?: IRigModelViewModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
        if (!data) {
            this.components = [];
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.name = _data["name"];
            this.username = _data["username"];
            this.canBeDelete = _data["canBeDelete"];
            this.canBeEdited = _data["canBeEdited"];
            this.version = _data["version"];
            this.microControllerId = _data["microControllerId"];
            this.descriptionHTML = _data["descriptionHTML"];
            if (Array.isArray(_data["components"])) {
                this.components = [] as any;
                for (let item of _data["components"])
                    this.components!.push(ComponentViewModel.fromJS(item));
            }
        }
    }

    static fromJS(data: any): RigModelViewModel {
        data = typeof data === 'object' ? data : {};
        let result = new RigModelViewModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["name"] = this.name;
        data["username"] = this.username;
        data["canBeDelete"] = this.canBeDelete;
        data["canBeEdited"] = this.canBeEdited;
        data["version"] = this.version;
        data["microControllerId"] = this.microControllerId;
        data["descriptionHTML"] = this.descriptionHTML;
        if (Array.isArray(this.components)) {
            data["components"] = [];
            for (let item of this.components)
                data["components"].push(item ? item.toJSON() : undefined as any);
        }
        return data;
    }
}

export interface IRigModelViewModel {
    id: number;
    name: string;
    username: string;
    canBeDelete: boolean;
    canBeEdited: boolean;
    version: number;
    microControllerId: number;
    descriptionHTML: string;
    components: ComponentViewModel[];
}

export class ComponentViewModel implements IComponentViewModel {
    id!: number;
    name!: string;
    position!: number;
    componentDefinitionName!: string;
    componentType!: ComponentType;
    componentDisplay!: ComponentDisplay;
    componentDefinitionId!: number;
    active!: boolean;
    rigModelIsParent!: boolean;
    hide!: boolean;
    tempOpen!: boolean;
    hideChildren!: boolean;
    hideProperties!: boolean;
    hideInputs!: boolean;
    hidePins!: boolean;
    children!: ComponentViewModel[];
    properties!: ComponentPropertyViewModel[];
    inputs!: ComponentInputViewModel[];
    pins!: ComponentMicroControllerPinViewModel[];
    status!: ComponentStatusViewModel[];
    codeBlocks!: CodeBlockViewModel[];

    constructor(data?: IComponentViewModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
        if (!data) {
            this.children = [];
            this.properties = [];
            this.inputs = [];
            this.pins = [];
            this.status = [];
            this.codeBlocks = [];
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.name = _data["name"];
            this.position = _data["position"];
            this.componentDefinitionName = _data["componentDefinitionName"];
            this.componentType = _data["componentType"];
            this.componentDisplay = _data["componentDisplay"];
            this.componentDefinitionId = _data["componentDefinitionId"];
            this.active = _data["active"];
            this.rigModelIsParent = _data["rigModelIsParent"];
            this.hide = _data["hide"];
            this.tempOpen = _data["tempOpen"];
            this.hideChildren = _data["hideChildren"];
            this.hideProperties = _data["hideProperties"];
            this.hideInputs = _data["hideInputs"];
            this.hidePins = _data["hidePins"];
            if (Array.isArray(_data["children"])) {
                this.children = [] as any;
                for (let item of _data["children"])
                    this.children!.push(ComponentViewModel.fromJS(item));
            }
            if (Array.isArray(_data["properties"])) {
                this.properties = [] as any;
                for (let item of _data["properties"])
                    this.properties!.push(ComponentPropertyViewModel.fromJS(item));
            }
            if (Array.isArray(_data["inputs"])) {
                this.inputs = [] as any;
                for (let item of _data["inputs"])
                    this.inputs!.push(ComponentInputViewModel.fromJS(item));
            }
            if (Array.isArray(_data["pins"])) {
                this.pins = [] as any;
                for (let item of _data["pins"])
                    this.pins!.push(ComponentMicroControllerPinViewModel.fromJS(item));
            }
            if (Array.isArray(_data["status"])) {
                this.status = [] as any;
                for (let item of _data["status"])
                    this.status!.push(ComponentStatusViewModel.fromJS(item));
            }
            if (Array.isArray(_data["codeBlocks"])) {
                this.codeBlocks = [] as any;
                for (let item of _data["codeBlocks"])
                    this.codeBlocks!.push(CodeBlockViewModel.fromJS(item));
            }
        }
    }

    static fromJS(data: any): ComponentViewModel {
        data = typeof data === 'object' ? data : {};
        let result = new ComponentViewModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["name"] = this.name;
        data["position"] = this.position;
        data["componentDefinitionName"] = this.componentDefinitionName;
        data["componentType"] = this.componentType;
        data["componentDisplay"] = this.componentDisplay;
        data["componentDefinitionId"] = this.componentDefinitionId;
        data["active"] = this.active;
        data["rigModelIsParent"] = this.rigModelIsParent;
        data["hide"] = this.hide;
        data["tempOpen"] = this.tempOpen;
        data["hideChildren"] = this.hideChildren;
        data["hideProperties"] = this.hideProperties;
        data["hideInputs"] = this.hideInputs;
        data["hidePins"] = this.hidePins;
        if (Array.isArray(this.children)) {
            data["children"] = [];
            for (let item of this.children)
                data["children"].push(item ? item.toJSON() : undefined as any);
        }
        if (Array.isArray(this.properties)) {
            data["properties"] = [];
            for (let item of this.properties)
                data["properties"].push(item ? item.toJSON() : undefined as any);
        }
        if (Array.isArray(this.inputs)) {
            data["inputs"] = [];
            for (let item of this.inputs)
                data["inputs"].push(item ? item.toJSON() : undefined as any);
        }
        if (Array.isArray(this.pins)) {
            data["pins"] = [];
            for (let item of this.pins)
                data["pins"].push(item ? item.toJSON() : undefined as any);
        }
        if (Array.isArray(this.status)) {
            data["status"] = [];
            for (let item of this.status)
                data["status"].push(item ? item.toJSON() : undefined as any);
        }
        if (Array.isArray(this.codeBlocks)) {
            data["codeBlocks"] = [];
            for (let item of this.codeBlocks)
                data["codeBlocks"].push(item ? item.toJSON() : undefined as any);
        }
        return data;
    }
}


export enum ComponentType {
    General = 1,
    Camera = 2,
    CameraContainer = 3,
}

export enum ComponentDisplay {
    Default = 0,
    TwoInputsAndOneStatus = 1,
    Movement = 2,
    Actuator = 3,
    Camera = 4,
}

export class HighScoreModel implements IHighScoreModel {
    points!: number;

    constructor(data?: IHighScoreModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.points = _data["points"];
        }
    }

    static fromJS(data: any): HighScoreModel {
        data = typeof data === 'object' ? data : {};
        let result = new HighScoreModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["points"] = this.points;
        return data;
    }
}

export class LogModel implements ILogModel {
    dateTime!: Date;
    name!: string;
    message!: string;
    storedInFile!: boolean;

    constructor(data?: ILogModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.dateTime = _data["dateTime"] ? new Date(_data["dateTime"].toString()) : undefined as any;
            this.name = _data["name"];
            this.message = _data["message"];
            this.storedInFile = _data["storedInFile"];
        }
    }

    static fromJS(data: any): LogModel {
        data = typeof data === 'object' ? data : {};
        let result = new LogModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["dateTime"] = this.dateTime ? this.dateTime.toISOString() : undefined as any;
        data["name"] = this.name;
        data["message"] = this.message;
        data["storedInFile"] = this.storedInFile;
        return data;
    }
}

export class CommandMessage implements ICommandMessage {
    type!: CommandType;
    value?: any | undefined;

    constructor(data?: ICommandMessage) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.type = _data["type"];
            this.value = _data["value"];
        }
    }

    static fromJS(data: any): CommandMessage {
        data = typeof data === 'object' ? data : {};
        let result = new CommandMessage();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["type"] = this.type;
        data["value"] = this.value;
        return data;
    }
}

export interface ICommandMessage {
    type: CommandType;
    value?: any | undefined;
}

export enum CommandType {
    RigReloadRigModel = 1,
    RigShutdown = 2,
    RigBecomeOperator = 3,
    RigStopBeingOperator = 4,
    RigStartWebRTCConnection = 5,
    WorldStart = 101,
    WorldStop = 102,
    ExploreWorldJoinQueue = 201,
    ExploreWorldLeaveQueue = 202,
    ExploreWorldStartSession = 203,
    ExploreWorldStopSession = 204,
    VideoSetTime = 301,
    VideoSetPlayPause = 302,
}

export interface ILogModel {
    dateTime: Date;
    name: string;
    message: string;
    storedInFile: boolean;
}

export interface IHighScoreModel {
    points: number;
}

export interface IComponentViewModel {
    id: number;
    name: string;
    position: number;
    componentDefinitionName: string;
    componentType: ComponentType;
    componentDisplay: ComponentDisplay;
    componentDefinitionId: number;
    active: boolean;
    rigModelIsParent: boolean;
    hide: boolean;
    tempOpen: boolean;
    hideChildren: boolean;
    hideProperties: boolean;
    hideInputs: boolean;
    hidePins: boolean;
    children: ComponentViewModel[];
    properties: ComponentPropertyViewModel[];
    inputs: ComponentInputViewModel[];
    pins: ComponentMicroControllerPinViewModel[];
    status: ComponentStatusViewModel[];
    codeBlocks: CodeBlockViewModel[];
}

export class ComponentPropertyViewModel implements IComponentPropertyViewModel {
    componentPropertyId?: number | undefined;
    componentPropertyValue!: string;
    componentDefinitionPropertyId!: number;
    componentDefinitionPropertyName!: string;
    componentDefinitionPropertyDefault!: string;
    componentDefinitionPropertyType!: ComponentDefinitionPropertyType;

    constructor(data?: IComponentPropertyViewModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.componentPropertyId = _data["componentPropertyId"];
            this.componentPropertyValue = _data["componentPropertyValue"];
            this.componentDefinitionPropertyId = _data["componentDefinitionPropertyId"];
            this.componentDefinitionPropertyName = _data["componentDefinitionPropertyName"];
            this.componentDefinitionPropertyDefault = _data["componentDefinitionPropertyDefault"];
            this.componentDefinitionPropertyType = _data["componentDefinitionPropertyType"];
        }
    }

    static fromJS(data: any): ComponentPropertyViewModel {
        data = typeof data === 'object' ? data : {};
        let result = new ComponentPropertyViewModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["componentPropertyId"] = this.componentPropertyId;
        data["componentPropertyValue"] = this.componentPropertyValue;
        data["componentDefinitionPropertyId"] = this.componentDefinitionPropertyId;
        data["componentDefinitionPropertyName"] = this.componentDefinitionPropertyName;
        data["componentDefinitionPropertyDefault"] = this.componentDefinitionPropertyDefault;
        data["componentDefinitionPropertyType"] = this.componentDefinitionPropertyType;
        return data;
    }
}

export interface IComponentPropertyViewModel {
    componentPropertyId?: number | undefined;
    componentPropertyValue: string;
    componentDefinitionPropertyId: number;
    componentDefinitionPropertyName: string;
    componentDefinitionPropertyDefault: string;
    componentDefinitionPropertyType: ComponentDefinitionPropertyType;
}


export enum ComponentDefinitionPropertyType {
    String = 0,
    Integer = 1,
    Float = 2,
    Boolean = 3,
}

export class ComponentInputViewModel implements IComponentInputViewModel {
    position!: number;
    componentInputId!: number;
    componentInputName!: string;
    input!: InputViewModel;
    componentDefinitionInputId!: number;
    componentDefinitionInputName!: string;
    componentDefinitionInputParentName!: string;
    componentDefinitionInput!: InputViewModel;

    constructor(data?: IComponentInputViewModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
        if (!data) {
            this.input = new InputViewModel();
            this.componentDefinitionInput = new InputViewModel();
        }
    }

    init(_data?: any) {
        if (_data) {
            this.position = _data["position"];
            this.componentInputId = _data["componentInputId"];
            this.componentInputName = _data["componentInputName"];
            this.input = _data["input"] ? InputViewModel.fromJS(_data["input"]) : new InputViewModel();
            this.componentDefinitionInputId = _data["componentDefinitionInputId"];
            this.componentDefinitionInputName = _data["componentDefinitionInputName"];
            this.componentDefinitionInputParentName = _data["componentDefinitionInputParentName"];
            this.componentDefinitionInput = _data["componentDefinitionInput"] ? InputViewModel.fromJS(_data["componentDefinitionInput"]) : new InputViewModel();
        }
    }

    static fromJS(data: any): ComponentInputViewModel {
        data = typeof data === 'object' ? data : {};
        let result = new ComponentInputViewModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["position"] = this.position;
        data["componentInputId"] = this.componentInputId;
        data["componentInputName"] = this.componentInputName;
        data["input"] = this.input ? this.input.toJSON() : undefined as any;
        data["componentDefinitionInputId"] = this.componentDefinitionInputId;
        data["componentDefinitionInputName"] = this.componentDefinitionInputName;
        data["componentDefinitionInputParentName"] = this.componentDefinitionInputParentName;
        data["componentDefinitionInput"] = this.componentDefinitionInput ? this.componentDefinitionInput.toJSON() : undefined as any;
        return data;
    }
}

export interface IComponentInputViewModel {
    position: number;
    componentInputId: number;
    componentInputName: string;
    input: InputViewModel;
    componentDefinitionInputId: number;
    componentDefinitionInputName: string;
    componentDefinitionInputParentName: string;
    componentDefinitionInput: InputViewModel;
}

export class InputViewModel implements IInputViewModel {
    id!: number;
    inputCategoryId!: number;
    categoryName!: string;
    name!: string;
    username!: string;
    singlePress!: boolean;
    defaultKey!: string;
    defaultAltKey?: string | undefined;
    canBeDelete!: boolean;
    canBeEdited!: boolean;

    constructor(data?: IInputViewModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.inputCategoryId = _data["inputCategoryId"];
            this.categoryName = _data["categoryName"];
            this.name = _data["name"];
            this.username = _data["username"];
            this.singlePress = _data["singlePress"];
            this.defaultKey = _data["defaultKey"];
            this.defaultAltKey = _data["defaultAltKey"];
            this.canBeDelete = _data["canBeDelete"];
            this.canBeEdited = _data["canBeEdited"];
        }
    }

    static fromJS(data: any): InputViewModel {
        data = typeof data === 'object' ? data : {};
        let result = new InputViewModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["inputCategoryId"] = this.inputCategoryId;
        data["categoryName"] = this.categoryName;
        data["name"] = this.name;
        data["username"] = this.username;
        data["singlePress"] = this.singlePress;
        data["defaultKey"] = this.defaultKey;
        data["defaultAltKey"] = this.defaultAltKey;
        data["canBeDelete"] = this.canBeDelete;
        data["canBeEdited"] = this.canBeEdited;
        return data;
    }
}

export interface IInputViewModel {
    id: number;
    inputCategoryId: number;
    categoryName: string;
    name: string;
    username: string;
    singlePress: boolean;
    defaultKey: string;
    defaultAltKey?: string | undefined;
    canBeDelete: boolean;
    canBeEdited: boolean;
}

export class ComponentMicroControllerPinViewModel implements IComponentMicroControllerPinViewModel {
    componentMicroControllerPinId?: number | undefined;
    componentMicroControllerPin!: MicroControllerPinViewModel;
    rigModelId!: number;
    componentDefinitionMicroControllerPinId!: number;
    componentDefinitionMicroControllerPinName!: string;
    pinMode!: PinMode;
    pinPullUpDown!: PinPullUpDown;
    codeBlock?: CodeBlockViewModel | undefined;

    constructor(data?: IComponentMicroControllerPinViewModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
        if (!data) {
            this.componentMicroControllerPin = new MicroControllerPinViewModel();
        }
    }

    init(_data?: any) {
        if (_data) {
            this.componentMicroControllerPinId = _data["componentMicroControllerPinId"];
            this.componentMicroControllerPin = _data["componentMicroControllerPin"] ? MicroControllerPinViewModel.fromJS(_data["componentMicroControllerPin"]) : new MicroControllerPinViewModel();
            this.rigModelId = _data["rigModelId"];
            this.componentDefinitionMicroControllerPinId = _data["componentDefinitionMicroControllerPinId"];
            this.componentDefinitionMicroControllerPinName = _data["componentDefinitionMicroControllerPinName"];
            this.pinMode = _data["pinMode"];
            this.pinPullUpDown = _data["pinPullUpDown"];
            this.codeBlock = _data["codeBlock"] ? CodeBlockViewModel.fromJS(_data["codeBlock"]) : undefined as any;
        }
    }

    static fromJS(data: any): ComponentMicroControllerPinViewModel {
        data = typeof data === 'object' ? data : {};
        let result = new ComponentMicroControllerPinViewModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["componentMicroControllerPinId"] = this.componentMicroControllerPinId;
        data["componentMicroControllerPin"] = this.componentMicroControllerPin ? this.componentMicroControllerPin.toJSON() : undefined as any;
        data["rigModelId"] = this.rigModelId;
        data["componentDefinitionMicroControllerPinId"] = this.componentDefinitionMicroControllerPinId;
        data["componentDefinitionMicroControllerPinName"] = this.componentDefinitionMicroControllerPinName;
        data["pinMode"] = this.pinMode;
        data["pinPullUpDown"] = this.pinPullUpDown;
        data["codeBlock"] = this.codeBlock ? this.codeBlock.toJSON() : undefined as any;
        return data;
    }
}

export interface IComponentMicroControllerPinViewModel {
    componentMicroControllerPinId?: number | undefined;
    componentMicroControllerPin: MicroControllerPinViewModel;
    rigModelId: number;
    componentDefinitionMicroControllerPinId: number;
    componentDefinitionMicroControllerPinName: string;
    pinMode: PinMode;
    pinPullUpDown: PinPullUpDown;
    codeBlock?: CodeBlockViewModel | undefined;
}

export class MicroControllerPinViewModel implements IMicroControllerPinViewModel {
    id!: number;
    microControllerId!: number;
    name!: string;
    count!: number;
    gpio?: number | undefined;
    microControllerPinType!: MicroControllerPinType;
    pwm!: boolean;
    initialState!: MicroControllerPinInitialState;

    constructor(data?: IMicroControllerPinViewModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.microControllerId = _data["microControllerId"];
            this.name = _data["name"];
            this.count = _data["count"];
            this.gpio = _data["gpio"];
            this.microControllerPinType = _data["microControllerPinType"];
            this.pwm = _data["pwm"];
            this.initialState = _data["initialState"];
        }
    }

    static fromJS(data: any): MicroControllerPinViewModel {
        data = typeof data === 'object' ? data : {};
        let result = new MicroControllerPinViewModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["microControllerId"] = this.microControllerId;
        data["name"] = this.name;
        data["count"] = this.count;
        data["gpio"] = this.gpio;
        data["microControllerPinType"] = this.microControllerPinType;
        data["pwm"] = this.pwm;
        data["initialState"] = this.initialState;
        return data;
    }
}

export interface IMicroControllerPinViewModel {
    id: number;
    microControllerId: number;
    name: string;
    count: number;
    gpio?: number | undefined;
    microControllerPinType: MicroControllerPinType;
    pwm: boolean;
    initialState: MicroControllerPinInitialState;
}

export enum MicroControllerPinType {
    V33 = 1,
    V5 = 2,
    Ground = 3,
    UART = 4,
    I2C = 5,
    SPI = 6,
    GPIO = 7,
}

export enum MicroControllerPinInitialState {
    V0 = 0,
    V33 = 1,
}

export enum PinPullUpDown {
    PUD_OFF = 0,
    PUD_DOWN = 1,
    PUD_UP = 2,
}


export enum PinMode {
    INPUT = 1,
    OUTPUT = 2,
}

export class LogSettingViewModel implements ILogSettingViewModel {
    id!: number;
    logSettingType!: LogSettingType;
    parameter1?: number | undefined;

    constructor(data?: ILogSettingViewModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.logSettingType = _data["logSettingType"];
            this.parameter1 = _data["parameter1"];
        }
    }

    static fromJS(data: any): LogSettingViewModel {
        data = typeof data === 'object' ? data : {};
        let result = new LogSettingViewModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["logSettingType"] = this.logSettingType;
        data["parameter1"] = this.parameter1;
        return data;
    }
}

export interface ILogSettingViewModel {
    id: number;
    logSettingType: LogSettingType;
    parameter1?: number | undefined;
}

export class KeyEventModel implements IKeyEventModel {
    rigId!: number;
    componentInputId!: number;
    worldId!: number;
    type!: string;
    timeStamp!: number;
    repeat!: boolean;
    shiftKey!: boolean;

    constructor(data?: IKeyEventModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.rigId = _data["rigId"];
            this.componentInputId = _data["componentInputId"];
            this.worldId = _data["worldId"];
            this.type = _data["type"];
            this.timeStamp = _data["timeStamp"];
            this.repeat = _data["repeat"];
            this.shiftKey = _data["shiftKey"];
        }
    }

    static fromJS(data: any): KeyEventModel {
        data = typeof data === 'object' ? data : {};
        let result = new KeyEventModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["rigId"] = this.rigId;
        data["componentInputId"] = this.componentInputId;
        data["worldId"] = this.worldId;
        data["type"] = this.type;
        data["timeStamp"] = this.timeStamp;
        data["repeat"] = this.repeat;
        data["shiftKey"] = this.shiftKey;
        return data;
    }
}

export interface IKeyEventModel {
    rigId: number;
    componentInputId: number;
    worldId: number;
    type: string;
    timeStamp: number;
    repeat: boolean;
    shiftKey: boolean;
}

export class CodeBlockViewModel implements ICodeBlockViewModel {
    id!: number;
    name!: string;
    code!: string;
    type!: CodeBlockType;
    parameters!: CodeBlockParameterViewModel[];

    constructor(data?: ICodeBlockViewModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
        if (!data) {
            this.parameters = [];
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.name = _data["name"];
            this.code = _data["code"];
            this.type = _data["type"];
            if (Array.isArray(_data["parameters"])) {
                this.parameters = [] as any;
                for (let item of _data["parameters"])
                    this.parameters!.push(CodeBlockParameterViewModel.fromJS(item));
            }
        }
    }

    static fromJS(data: any): CodeBlockViewModel {
        data = typeof data === 'object' ? data : {};
        let result = new CodeBlockViewModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["name"] = this.name;
        data["code"] = this.code;
        data["type"] = this.type;
        if (Array.isArray(this.parameters)) {
            data["parameters"] = [];
            for (let item of this.parameters)
                data["parameters"].push(item ? item.toJSON() : undefined as any);
        }
        return data;
    }
}

export interface ICodeBlockViewModel {
    id: number;
    name: string;
    code: string;
    type: CodeBlockType;
    parameters: CodeBlockParameterViewModel[];
}

export enum CodeBlockType {
    OnAlert = 1,
    Init = 3,
    ProcessKeyEvent = 5,
    Function = 6,
    Shutdown = 10,
    ComponentViewHTML = 20,
    ComponentViewFunction = 21,
}

export class CodeBlockParameterViewModel implements ICodeBlockParameterViewModel {
    id!: number;
    name!: string;
    type!: CodeBlockParameterType;

    constructor(data?: ICodeBlockParameterViewModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (this as any)[property] = (data as any)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["id"];
            this.name = _data["name"];
            this.type = _data["type"];
        }
    }

    static fromJS(data: any): CodeBlockParameterViewModel {
        data = typeof data === 'object' ? data : {};
        let result = new CodeBlockParameterViewModel();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["name"] = this.name;
        data["type"] = this.type;
        return data;
    }
}

export interface ICodeBlockParameterViewModel {
    id: number;
    name: string;
    type: CodeBlockParameterType;
}

export enum CodeBlockParameterType {
    Number = 1,
    String = 2,
    Boolean = 3,
}