export default class Input {
    constructor(componentInput) {
        this.componentInput = componentInput;
        this.componentInputId = this.componentInput.componentInputId;
    }
    GetLogMessage() {
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
    GetName() {
        return "input '" + this.componentInput.componentDefinitionInputName + "'";
    }
}
//# sourceMappingURL=input.js.map