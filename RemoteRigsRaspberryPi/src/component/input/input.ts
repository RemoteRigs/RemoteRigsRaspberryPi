import { ComponentInputViewModel } from '../../models/models.js';

export default class Input {
    private componentInput: ComponentInputViewModel;

    public componentInputId: number;

    constructor(componentInput: ComponentInputViewModel) {
        this.componentInput = componentInput;
        this.componentInputId = this.componentInput.componentInputId;
    }

    public GetLogMessage(): string {

        //codeBlock ?: CodeBlockViewModel | undefined;
        var tMessage = this.GetName();

        tMessage += " - Input category: '" + this.componentInput.input.categoryName + "'";
        tMessage += " - Input name: '" + this.componentInput.input.name + "'";
        tMessage += " - Input componentDefinitionInputId: '" + this.componentInput.componentDefinitionInputId + "'";
        //tMessage += " - Input componentDefinitionInputId: '" + this.input.componentDefinitionInputId + "'";
        //tMessage += " - Input componentDefinitionInputName: '" + this.input.componentDefinitionInputName + "'";
        

        //if (this.microcontrollerpin.componentMicroControllerPin.gpio != undefined) {
        //    tMessage += " - GPIO: '" + this.microcontrollerpin.componentMicroControllerPin.gpio + "'";
        //}

        //if (this.microcontrollerpin.codeBlock != undefined) {
        //    tMessage += " - AlertCode: '" + this.microcontrollerpin.componentMicroControllerPin.gpio + "'";
        //}

        return tMessage;
    }

    private GetName(): string {
        return "input '" + this.componentInput.componentDefinitionInputName + "'";
    }
}