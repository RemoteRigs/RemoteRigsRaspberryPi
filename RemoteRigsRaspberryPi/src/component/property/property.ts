import { ComponentPropertyViewModel, ComponentDefinitionPropertyType } from '../../models/models.js';

type CallbackType = () => void;

export default class Property {

    private property: ComponentPropertyViewModel;

    public value: string;

    constructor(property: ComponentPropertyViewModel) {
        this.property = property;

        if (this.property.componentPropertyValue != undefined) {
            this.value = this.property.componentPropertyValue;
        } else {
            this.value = this.property.componentDefinitionPropertyDefault;
        }
    }

    public GetLogMessage(): string {
        return this.GetName() + " - type: '" + this.GetType() + "' - value: '" + this.property.componentPropertyValue + "'";
    }

    private GetType(): string {
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

    private GetName(): string {
        return "property '" + this.property.componentDefinitionPropertyName + "'";
    }
}