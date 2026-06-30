export var StatusType;
(function (StatusType) {
    StatusType[StatusType["RigComponentNumber"] = 1] = "RigComponentNumber";
    StatusType[StatusType["RigComponentStates"] = 2] = "RigComponentStates";
    StatusType[StatusType["RigOnline"] = 3] = "RigOnline";
    StatusType[StatusType["RigModelLoaded"] = 4] = "RigModelLoaded";
    StatusType[StatusType["RigLog"] = 5] = "RigLog";
    StatusType[StatusType["RigOperator"] = 6] = "RigOperator";
    StatusType[StatusType["RigComponentCamera"] = 7] = "RigComponentCamera";
    StatusType[StatusType["WorldStatus"] = 100] = "WorldStatus";
    StatusType[StatusType["WorldQueuePositions"] = 101] = "WorldQueuePositions";
    StatusType[StatusType["WorldActiveSession"] = 102] = "WorldActiveSession";
})(StatusType || (StatusType = {}));
export class ComponentStatusViewModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
        if (!data) {
            this.states = [];
        }
    }
    init(_data) {
        if (_data) {
            this.id = _data["id"];
            this.componentId = _data["componentId"];
            this.name = _data["name"];
            this.type = _data["type"];
            if (Array.isArray(_data["states"])) {
                this.states = [];
                for (let item of _data["states"])
                    this.states.push(ComponentStatusStateViewModel.fromJS(item));
            }
        }
    }
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new ComponentStatusViewModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["componentId"] = this.componentId;
        data["name"] = this.name;
        data["type"] = this.type;
        if (Array.isArray(this.states)) {
            data["states"] = [];
            for (let item of this.states)
                data["states"].push(item ? item.toJSON() : undefined);
        }
        return data;
    }
}
export class ComponentStatusStateViewModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
    }
    init(_data) {
        if (_data) {
            this.id = _data["id"];
            this.name = _data["name"];
        }
    }
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new ComponentStatusStateViewModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["name"] = this.name;
        return data;
    }
}
export class ClientRTCConfigurationViewModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
    }
    init(_data) {
        if (_data) {
            this.stunServer = _data["stunServer"];
            this.turnServer = _data["turnServer"];
        }
    }
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new ClientRTCConfigurationViewModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
        data = typeof data === 'object' ? data : {};
        data["stunServer"] = this.stunServer;
        data["turnServer"] = this.turnServer;
        return data;
    }
}
export class StatusModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
    }
    init(_data) {
        if (_data) {
            this.value = _data["value"];
            this.type = _data["type"];
        }
    }
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new StatusModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
        data = typeof data === 'object' ? data : {};
        data["value"] = this.value;
        data["type"] = this.type;
        return data;
    }
}
export class RigComponentStatusModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
    }
    init(_data) {
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
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new RigComponentStatusModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
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
export class RigModelLoadedModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
    }
    init(_data) {
        if (_data) {
            this.rigId = _data["rigId"];
            this.rigModelVersion = _data["rigModelVersion"];
        }
    }
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new RigModelLoadedModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
        data = typeof data === 'object' ? data : {};
        data["rigId"] = this.rigId;
        data["rigModelVersion"] = this.rigModelVersion;
        return data;
    }
}
export class WebRTCMessage {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
    }
    init(_data) {
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
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new WebRTCMessage();
        result.init(data);
        return result;
    }
    toJSON(data) {
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
export var WebRTCConnectionType;
(function (WebRTCConnectionType) {
    WebRTCConnectionType[WebRTCConnectionType["Direct"] = 0] = "Direct";
    WebRTCConnectionType[WebRTCConnectionType["Relay"] = 1] = "Relay";
    WebRTCConnectionType[WebRTCConnectionType["File"] = 2] = "File";
})(WebRTCConnectionType || (WebRTCConnectionType = {}));
export class KeyEventClientModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
    }
    init(_data) {
        if (_data) {
            this.componentInputId = _data["componentInputId"];
            this.type = _data["type"];
            this.timeStamp = _data["timeStamp"];
            this.keyUp = _data["keyUp"];
            this.keyDown = _data["keyDown"];
        }
    }
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new KeyEventClientModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
        data = typeof data === 'object' ? data : {};
        data["componentInputId"] = this.componentInputId;
        data["type"] = this.type;
        data["timeStamp"] = this.timeStamp;
        data["keyUp"] = this.keyUp;
        data["keyDown"] = this.keyDown;
        return data;
    }
}
export var LogSettingType;
(function (LogSettingType) {
    LogSettingType[LogSettingType["None"] = 0] = "None";
    LogSettingType[LogSettingType["KeyEvents"] = 8] = "KeyEvents";
    LogSettingType[LogSettingType["Commands"] = 9] = "Commands";
    LogSettingType[LogSettingType["BLESensor"] = 10] = "BLESensor";
    LogSettingType[LogSettingType["Component"] = 13] = "Component";
    LogSettingType[LogSettingType["SignalR"] = 14] = "SignalR";
})(LogSettingType || (LogSettingType = {}));
export class RigClientViewModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
        if (!data) {
            this.rigModelViewModel = new RigModelViewModel();
            this.logSettings = [];
        }
    }
    init(_data) {
        if (_data) {
            this.id = _data["id"];
            this.name = _data["name"];
            this.uniqueCode = _data["uniqueCode"];
            this.videoType = _data["videoType"];
            this.rigModelViewModel = _data["rigModelViewModel"] ? RigModelViewModel.fromJS(_data["rigModelViewModel"]) : new RigModelViewModel();
            this.clientRTCConfigurationViewModel = _data["clientRTCConfigurationViewModel"] ? ClientRTCConfigurationViewModel.fromJS(_data["clientRTCConfigurationViewModel"]) : undefined;
            if (Array.isArray(_data["logSettings"])) {
                this.logSettings = [];
                for (let item of _data["logSettings"])
                    this.logSettings.push(LogSettingViewModel.fromJS(item));
            }
        }
    }
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new RigClientViewModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["name"] = this.name;
        data["uniqueCode"] = this.uniqueCode;
        data["videoType"] = this.videoType;
        data["rigModelViewModel"] = this.rigModelViewModel ? this.rigModelViewModel.toJSON() : undefined;
        data["clientRTCConfigurationViewModel"] = this.clientRTCConfigurationViewModel ? this.clientRTCConfigurationViewModel.toJSON() : undefined;
        if (Array.isArray(this.logSettings)) {
            data["logSettings"] = [];
            for (let item of this.logSettings)
                data["logSettings"].push(item ? item.toJSON() : undefined);
        }
        return data;
    }
}
export var VideoType;
(function (VideoType) {
    VideoType[VideoType["VP8"] = 0] = "VP8";
    VideoType[VideoType["H264"] = 1] = "H264";
})(VideoType || (VideoType = {}));
export class RigModelViewModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
        if (!data) {
            this.components = [];
        }
    }
    init(_data) {
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
                this.components = [];
                for (let item of _data["components"])
                    this.components.push(ComponentViewModel.fromJS(item));
            }
        }
    }
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new RigModelViewModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
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
                data["components"].push(item ? item.toJSON() : undefined);
        }
        return data;
    }
}
export class ComponentViewModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
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
    init(_data) {
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
                this.children = [];
                for (let item of _data["children"])
                    this.children.push(ComponentViewModel.fromJS(item));
            }
            if (Array.isArray(_data["properties"])) {
                this.properties = [];
                for (let item of _data["properties"])
                    this.properties.push(ComponentPropertyViewModel.fromJS(item));
            }
            if (Array.isArray(_data["inputs"])) {
                this.inputs = [];
                for (let item of _data["inputs"])
                    this.inputs.push(ComponentInputViewModel.fromJS(item));
            }
            if (Array.isArray(_data["pins"])) {
                this.pins = [];
                for (let item of _data["pins"])
                    this.pins.push(ComponentMicroControllerPinViewModel.fromJS(item));
            }
            if (Array.isArray(_data["status"])) {
                this.status = [];
                for (let item of _data["status"])
                    this.status.push(ComponentStatusViewModel.fromJS(item));
            }
            if (Array.isArray(_data["codeBlocks"])) {
                this.codeBlocks = [];
                for (let item of _data["codeBlocks"])
                    this.codeBlocks.push(CodeBlockViewModel.fromJS(item));
            }
        }
    }
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new ComponentViewModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
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
                data["children"].push(item ? item.toJSON() : undefined);
        }
        if (Array.isArray(this.properties)) {
            data["properties"] = [];
            for (let item of this.properties)
                data["properties"].push(item ? item.toJSON() : undefined);
        }
        if (Array.isArray(this.inputs)) {
            data["inputs"] = [];
            for (let item of this.inputs)
                data["inputs"].push(item ? item.toJSON() : undefined);
        }
        if (Array.isArray(this.pins)) {
            data["pins"] = [];
            for (let item of this.pins)
                data["pins"].push(item ? item.toJSON() : undefined);
        }
        if (Array.isArray(this.status)) {
            data["status"] = [];
            for (let item of this.status)
                data["status"].push(item ? item.toJSON() : undefined);
        }
        if (Array.isArray(this.codeBlocks)) {
            data["codeBlocks"] = [];
            for (let item of this.codeBlocks)
                data["codeBlocks"].push(item ? item.toJSON() : undefined);
        }
        return data;
    }
}
export var ComponentType;
(function (ComponentType) {
    ComponentType[ComponentType["General"] = 1] = "General";
    ComponentType[ComponentType["Camera"] = 2] = "Camera";
    ComponentType[ComponentType["CameraContainer"] = 3] = "CameraContainer";
})(ComponentType || (ComponentType = {}));
export var ComponentDisplay;
(function (ComponentDisplay) {
    ComponentDisplay[ComponentDisplay["Default"] = 0] = "Default";
    ComponentDisplay[ComponentDisplay["TwoInputsAndOneStatus"] = 1] = "TwoInputsAndOneStatus";
    ComponentDisplay[ComponentDisplay["Movement"] = 2] = "Movement";
    ComponentDisplay[ComponentDisplay["Actuator"] = 3] = "Actuator";
    ComponentDisplay[ComponentDisplay["Camera"] = 4] = "Camera";
})(ComponentDisplay || (ComponentDisplay = {}));
export class HighScoreModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
    }
    init(_data) {
        if (_data) {
            this.points = _data["points"];
        }
    }
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new HighScoreModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
        data = typeof data === 'object' ? data : {};
        data["points"] = this.points;
        return data;
    }
}
export class LogModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
    }
    init(_data) {
        if (_data) {
            this.dateTime = _data["dateTime"] ? new Date(_data["dateTime"].toString()) : undefined;
            this.name = _data["name"];
            this.message = _data["message"];
            this.storedInFile = _data["storedInFile"];
        }
    }
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new LogModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
        data = typeof data === 'object' ? data : {};
        data["dateTime"] = this.dateTime ? this.dateTime.toISOString() : undefined;
        data["name"] = this.name;
        data["message"] = this.message;
        data["storedInFile"] = this.storedInFile;
        return data;
    }
}
export class CommandMessage {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
    }
    init(_data) {
        if (_data) {
            this.type = _data["type"];
            this.value = _data["value"];
        }
    }
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new CommandMessage();
        result.init(data);
        return result;
    }
    toJSON(data) {
        data = typeof data === 'object' ? data : {};
        data["type"] = this.type;
        data["value"] = this.value;
        return data;
    }
}
export var CommandType;
(function (CommandType) {
    CommandType[CommandType["RigReloadRigModel"] = 1] = "RigReloadRigModel";
    CommandType[CommandType["RigShutdown"] = 2] = "RigShutdown";
    CommandType[CommandType["RigBecomeOperator"] = 3] = "RigBecomeOperator";
    CommandType[CommandType["RigStopBeingOperator"] = 4] = "RigStopBeingOperator";
    CommandType[CommandType["RigStartWebRTCConnection"] = 5] = "RigStartWebRTCConnection";
    CommandType[CommandType["WorldStart"] = 101] = "WorldStart";
    CommandType[CommandType["WorldStop"] = 102] = "WorldStop";
    CommandType[CommandType["ExploreWorldJoinQueue"] = 201] = "ExploreWorldJoinQueue";
    CommandType[CommandType["ExploreWorldLeaveQueue"] = 202] = "ExploreWorldLeaveQueue";
    CommandType[CommandType["ExploreWorldStartSession"] = 203] = "ExploreWorldStartSession";
    CommandType[CommandType["ExploreWorldStopSession"] = 204] = "ExploreWorldStopSession";
    CommandType[CommandType["VideoSetTime"] = 301] = "VideoSetTime";
    CommandType[CommandType["VideoSetPlayPause"] = 302] = "VideoSetPlayPause";
})(CommandType || (CommandType = {}));
export class ComponentPropertyViewModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
    }
    init(_data) {
        if (_data) {
            this.componentPropertyId = _data["componentPropertyId"];
            this.componentPropertyValue = _data["componentPropertyValue"];
            this.componentDefinitionPropertyId = _data["componentDefinitionPropertyId"];
            this.componentDefinitionPropertyName = _data["componentDefinitionPropertyName"];
            this.componentDefinitionPropertyDefault = _data["componentDefinitionPropertyDefault"];
            this.componentDefinitionPropertyType = _data["componentDefinitionPropertyType"];
        }
    }
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new ComponentPropertyViewModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
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
export var ComponentDefinitionPropertyType;
(function (ComponentDefinitionPropertyType) {
    ComponentDefinitionPropertyType[ComponentDefinitionPropertyType["String"] = 0] = "String";
    ComponentDefinitionPropertyType[ComponentDefinitionPropertyType["Integer"] = 1] = "Integer";
    ComponentDefinitionPropertyType[ComponentDefinitionPropertyType["Float"] = 2] = "Float";
    ComponentDefinitionPropertyType[ComponentDefinitionPropertyType["Boolean"] = 3] = "Boolean";
})(ComponentDefinitionPropertyType || (ComponentDefinitionPropertyType = {}));
export class ComponentInputViewModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
        if (!data) {
            this.input = new InputViewModel();
            this.componentDefinitionInput = new InputViewModel();
        }
    }
    init(_data) {
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
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new ComponentInputViewModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
        data = typeof data === 'object' ? data : {};
        data["position"] = this.position;
        data["componentInputId"] = this.componentInputId;
        data["componentInputName"] = this.componentInputName;
        data["input"] = this.input ? this.input.toJSON() : undefined;
        data["componentDefinitionInputId"] = this.componentDefinitionInputId;
        data["componentDefinitionInputName"] = this.componentDefinitionInputName;
        data["componentDefinitionInputParentName"] = this.componentDefinitionInputParentName;
        data["componentDefinitionInput"] = this.componentDefinitionInput ? this.componentDefinitionInput.toJSON() : undefined;
        return data;
    }
}
export class InputViewModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
    }
    init(_data) {
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
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new InputViewModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
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
export class ComponentMicroControllerPinViewModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
        if (!data) {
            this.componentMicroControllerPin = new MicroControllerPinViewModel();
        }
    }
    init(_data) {
        if (_data) {
            this.componentMicroControllerPinId = _data["componentMicroControllerPinId"];
            this.componentMicroControllerPin = _data["componentMicroControllerPin"] ? MicroControllerPinViewModel.fromJS(_data["componentMicroControllerPin"]) : new MicroControllerPinViewModel();
            this.rigModelId = _data["rigModelId"];
            this.componentDefinitionMicroControllerPinId = _data["componentDefinitionMicroControllerPinId"];
            this.componentDefinitionMicroControllerPinName = _data["componentDefinitionMicroControllerPinName"];
            this.pinMode = _data["pinMode"];
            this.pinPullUpDown = _data["pinPullUpDown"];
            this.codeBlock = _data["codeBlock"] ? CodeBlockViewModel.fromJS(_data["codeBlock"]) : undefined;
        }
    }
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new ComponentMicroControllerPinViewModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
        data = typeof data === 'object' ? data : {};
        data["componentMicroControllerPinId"] = this.componentMicroControllerPinId;
        data["componentMicroControllerPin"] = this.componentMicroControllerPin ? this.componentMicroControllerPin.toJSON() : undefined;
        data["rigModelId"] = this.rigModelId;
        data["componentDefinitionMicroControllerPinId"] = this.componentDefinitionMicroControllerPinId;
        data["componentDefinitionMicroControllerPinName"] = this.componentDefinitionMicroControllerPinName;
        data["pinMode"] = this.pinMode;
        data["pinPullUpDown"] = this.pinPullUpDown;
        data["codeBlock"] = this.codeBlock ? this.codeBlock.toJSON() : undefined;
        return data;
    }
}
export class MicroControllerPinViewModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
    }
    init(_data) {
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
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new MicroControllerPinViewModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
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
export var MicroControllerPinType;
(function (MicroControllerPinType) {
    MicroControllerPinType[MicroControllerPinType["V33"] = 1] = "V33";
    MicroControllerPinType[MicroControllerPinType["V5"] = 2] = "V5";
    MicroControllerPinType[MicroControllerPinType["Ground"] = 3] = "Ground";
    MicroControllerPinType[MicroControllerPinType["UART"] = 4] = "UART";
    MicroControllerPinType[MicroControllerPinType["I2C"] = 5] = "I2C";
    MicroControllerPinType[MicroControllerPinType["SPI"] = 6] = "SPI";
    MicroControllerPinType[MicroControllerPinType["GPIO"] = 7] = "GPIO";
})(MicroControllerPinType || (MicroControllerPinType = {}));
export var MicroControllerPinInitialState;
(function (MicroControllerPinInitialState) {
    MicroControllerPinInitialState[MicroControllerPinInitialState["V0"] = 0] = "V0";
    MicroControllerPinInitialState[MicroControllerPinInitialState["V33"] = 1] = "V33";
})(MicroControllerPinInitialState || (MicroControllerPinInitialState = {}));
export var PinPullUpDown;
(function (PinPullUpDown) {
    PinPullUpDown[PinPullUpDown["PUD_OFF"] = 0] = "PUD_OFF";
    PinPullUpDown[PinPullUpDown["PUD_DOWN"] = 1] = "PUD_DOWN";
    PinPullUpDown[PinPullUpDown["PUD_UP"] = 2] = "PUD_UP";
})(PinPullUpDown || (PinPullUpDown = {}));
export var PinMode;
(function (PinMode) {
    PinMode[PinMode["INPUT"] = 1] = "INPUT";
    PinMode[PinMode["OUTPUT"] = 2] = "OUTPUT";
})(PinMode || (PinMode = {}));
export class LogSettingViewModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
    }
    init(_data) {
        if (_data) {
            this.id = _data["id"];
            this.logSettingType = _data["logSettingType"];
            this.parameter1 = _data["parameter1"];
        }
    }
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new LogSettingViewModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["logSettingType"] = this.logSettingType;
        data["parameter1"] = this.parameter1;
        return data;
    }
}
export class KeyEventModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
    }
    init(_data) {
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
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new KeyEventModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
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
export class CodeBlockViewModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
        if (!data) {
            this.parameters = [];
        }
    }
    init(_data) {
        if (_data) {
            this.id = _data["id"];
            this.name = _data["name"];
            this.code = _data["code"];
            this.type = _data["type"];
            if (Array.isArray(_data["parameters"])) {
                this.parameters = [];
                for (let item of _data["parameters"])
                    this.parameters.push(CodeBlockParameterViewModel.fromJS(item));
            }
        }
    }
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new CodeBlockViewModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["name"] = this.name;
        data["code"] = this.code;
        data["type"] = this.type;
        if (Array.isArray(this.parameters)) {
            data["parameters"] = [];
            for (let item of this.parameters)
                data["parameters"].push(item ? item.toJSON() : undefined);
        }
        return data;
    }
}
export var CodeBlockType;
(function (CodeBlockType) {
    CodeBlockType[CodeBlockType["OnAlert"] = 1] = "OnAlert";
    CodeBlockType[CodeBlockType["Init"] = 3] = "Init";
    CodeBlockType[CodeBlockType["ProcessKeyEvent"] = 5] = "ProcessKeyEvent";
    CodeBlockType[CodeBlockType["Function"] = 6] = "Function";
    CodeBlockType[CodeBlockType["Shutdown"] = 10] = "Shutdown";
    CodeBlockType[CodeBlockType["ComponentViewHTML"] = 20] = "ComponentViewHTML";
    CodeBlockType[CodeBlockType["ComponentViewFunction"] = 21] = "ComponentViewFunction";
})(CodeBlockType || (CodeBlockType = {}));
export class CodeBlockParameterViewModel {
    constructor(data) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    this[property] = data[property];
            }
        }
    }
    init(_data) {
        if (_data) {
            this.id = _data["id"];
            this.name = _data["name"];
            this.type = _data["type"];
        }
    }
    static fromJS(data) {
        data = typeof data === 'object' ? data : {};
        let result = new CodeBlockParameterViewModel();
        result.init(data);
        return result;
    }
    toJSON(data) {
        data = typeof data === 'object' ? data : {};
        data["id"] = this.id;
        data["name"] = this.name;
        data["type"] = this.type;
        return data;
    }
}
export var CodeBlockParameterType;
(function (CodeBlockParameterType) {
    CodeBlockParameterType[CodeBlockParameterType["Number"] = 1] = "Number";
    CodeBlockParameterType[CodeBlockParameterType["String"] = 2] = "String";
    CodeBlockParameterType[CodeBlockParameterType["Boolean"] = 3] = "Boolean";
})(CodeBlockParameterType || (CodeBlockParameterType = {}));
//# sourceMappingURL=models.js.map