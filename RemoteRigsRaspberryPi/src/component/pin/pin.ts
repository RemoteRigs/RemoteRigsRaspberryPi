import { Gpio } from 'pigpio';
import { ComponentMicroControllerPinViewModel, PinMode, PinPullUpDown } from '../../models/models.js';

import Debug from '../../common/debug.js';
import Component from '../component.js';

type CallbackType = () => void;

export default class Pin {
    private microcontrollerpin: ComponentMicroControllerPinViewModel;
    private pin: Gpio;
    private component: Component;

    constructor(component: Component, pin: ComponentMicroControllerPinViewModel) {
        this.component = component;
        this.microcontrollerpin = pin;

        if (this.microcontrollerpin.componentMicroControllerPin.gpio != undefined) {
            if (this.microcontrollerpin.pinMode == PinMode.INPUT) {
                var pinPullUpDown = PinPullUpDown.PUD_OFF;

                if (this.microcontrollerpin.pinPullUpDown == PinPullUpDown.PUD_UP) {
                    pinPullUpDown = Gpio.PUD_UP;
                } else if (this.microcontrollerpin.pinPullUpDown == PinPullUpDown.PUD_DOWN) {
                    pinPullUpDown = Gpio.PUD_DOWN;
                }

                this.pin = new Gpio(this.microcontrollerpin.componentMicroControllerPin.gpio, {
                    mode: Gpio.INPUT,
                    pullUpDown: pinPullUpDown,
                    alert: this.microcontrollerpin.codeBlock != undefined
                });

                if (this.microcontrollerpin.codeBlock != undefined) {
                    this.pin.enableAlert();

                    this.pin.on('alert', (level: number, tick: number) => {
                        if (this.microcontrollerpin.codeBlock != undefined) {
                            this.component.PinAlert(this.microcontrollerpin.codeBlock, level, tick);
                        }
                    });
                }
            } else {
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

    public servoWrite(value: number): void {
        this.pin.servoWrite(value);
    }

    public GetEnablePullUp(): boolean {
        return this.microcontrollerpin.pinPullUpDown == PinPullUpDown.PUD_UP;
    }

    public Read(): number {
        return this.pin.digitalRead();
    }

    public GetLogMessage(): string {

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

    private GetPinPullUpDownStr(): string {
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

    private GetPinMode(): string {
        switch (this.microcontrollerpin.pinMode) {
            case PinMode.INPUT:
                return "INPUT";
            case PinMode.OUTPUT:
                return "OUTPUT";
        }

        return "";
    }

    private GetName(): string {
        return "pin '" + this.microcontrollerpin.componentDefinitionMicroControllerPinName + "'";
    }
}