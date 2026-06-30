import { ComponentDefinitionPropertyType } from '../../models/models.js';
export default class Property {
    constructor(property) {
        this.property = property;
        if (this.property.componentPropertyValue != undefined) {
            this.value = this.property.componentPropertyValue;
        }
        else {
            this.value = this.property.componentDefinitionPropertyDefault;
        }
    }
    GetLogMessage() {
        return this.GetName() + " - type: '" + this.GetType() + "' - value: '" + this.property.componentPropertyValue + "'";
    }
    GetType() {
        switch (this.property.componentDefinitionPropertyType) {
            case ComponentDefinitionPropertyType.String:
                return "String";
            case ComponentDefinitionPropertyType.Integer:
                return "Integer";
            case ComponentDefinitionPropertyType.Float:
                return "Float";
            case ComponentDefinitionPropertyType.Boolean:
                return "Boolean";
        }
        return "";
    }
    GetName() {
        return "property '" + this.property.componentDefinitionPropertyName + "'";
    }
}
//# sourceMappingURL=property.js.map