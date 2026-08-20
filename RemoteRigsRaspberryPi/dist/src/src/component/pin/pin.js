import { Gpio } from 'pigpio';
import { PinMode, PinPullUpDown } from '../../models/models.js';
import Debug from '../../common/debug.js';
export default class Pin {
    constructor(component, pin) {
        this.component = component;
        this.microcontrollerpin = pin;
        if (this.microcontrollerpin.componentMicroControllerPin.gpio != undefined) {
            if (this.microcontrollerpin.pinMode == PinMode.INPUT) {
                var pinPullUpDown = PinPullUpDown.PUD_OFF;
                if (this.microcontrollerpin.pinPullUpDown == PinPullUpDown.PUD_UP) {
                    pinPullUpDown = Gpio.PUD_UP;
                }
                else if (this.microcontrollerpin.pinPullUpDown == PinPullUpDown.PUD_DOWN) {
                    pinPullUpDown = Gpio.PUD_DOWN;
                }
                this.pin = new Gpio(this.microcontrollerpin.componentMicroControllerPin.gpio, {
                    mode: Gpio.INPUT,
                    pullUpDown: pinPullUpDown,
                    alert: this.microcontrollerpin.codeBlock != undefined
                });
                if (this.microcontrollerpin.codeBlock != undefined) {
                    this.pin.enableAlert();
                    this.pin.on('alert', (level, tick) => {
                        if (this.microcontrollerpin.codeBlock != undefined) {
                            this.component.PinAlert(this.microcontrollerpin.codeBlock, level, tick);
                        }
                    });
                }
            }
            else {
                this.pin = new Gpio(this.microcontrollerpin.componentMicroControllerPin.gpio, {
                    mode: Gpio.OUTPUT
                });
            }
        }
        else {
            Debug.Error(this.GetName(), "invalid pin");
            this.pin = new Gpio(1, {
                mode: Gpio.INPUT,
                pullUpDown: Gpio.PUD_DOWN,
                alert: true
            });
        }
    }
    servoWrite(value) {
        this.pin.servoWrite(value);
    }
    GetEnablePullUp() {
        return this.microcontrollerpin.pinPullUpDown == PinPullUpDown.PUD_UP;
    }
    Read() {
        return this.pin.digitalRead();
    }
    GetLogMessage() {
        //codeBlock ?: CodeBlockViewModel | undefined;
        var tMessage = this.GetName();
        tMessage += " - PinMode: '" + this.GetPinMode() + "'";
        tMessage += " - PinPullUpDown: '" + this.GetPinPullUpDownStr() + "'";
        if (this.microcontrollerpin.componentMicroControllerPin.gpio != undefined) {
            tMessage += " - GPIO: '" + this.microcontrollerpin.componentMicroControllerPin.gpio + "'";
        }
        //if (this.microcontrollerpin.codeBlock != undefined) {
        //    tMessage += " - AlertCode: '" + this.microcontrollerpin.componentMicroControllerPin.gpio + "'";
        //}
        return tMessage;
    }
    GetPinPullUpDownStr() {
        switch (this.microcontrollerpin.pinPullUpDown) {
            case PinPullUpDown.PUD_DOWN:
                return "PUD_DOWN";
            case PinPullUpDown.PUD_OFF:
                return "PUD_OFF";
            case PinPullUpDown.PUD_UP:
                return "PUD_UP";
        }
        return "";
    }
    GetPinMode() {
        switch (this.microcontrollerpin.pinMode) {
            case PinMode.INPUT:
                return "INPUT";
            case PinMode.OUTPUT:
                return "OUTPUT";
        }
        return "";
    }
    GetName() {
        return "pin '" + this.microcontrollerpin.componentDefinitionMicroControllerPinName + "'";
    }
}
//# sourceMappingURL=pin.js.map