import vm from "vm";
import SignalR from "./signalr.js";
import Component from "../component/component.js";

export interface SandboxVars {
    [key: string]: any;
}

export default class Code {
    

    public static GetComponentContext(component: Component): SandboxVars {
        return {
            SetCallback: component.SetCallback,
            SetStatus: component.SetStatus,
            SetStatusState: component.SetStatusState,
            GetStatus: component.GetStatus,
            GetStatusState: component.GetStatusState,
            GetName: component.GetName,
            GetStorageName: component.GetStorageName,
            GetChild: component.GetChild,
            Log: component.Log,
            LogAlways: component.LogAlways,
            Error: component.Error,
            GetProperty: component.GetProperty,
            GetPropertyNumber: component.GetPropertyNumber,
            SetTimeOut: component.SetTimeOut,
            ResetTimeOut: component.ResetTimeOut,
            IsEventInput: component.IsEventInput,
            child: component.child,
            property: component.property,
            input: component.input,
            component: component.component,
            pin: component.pin,
            status: component.status,
            boolean: component.boolean,
            number: component.number,
            string: component.string,
            timeout: component.timeout,
            streamer: component.streamer,
            callback: component.callback
        }
    }

    /* (code: string, sandboxVars: SandboxVars): any {*/
    /**
    * Voert dynamische code uit in een veilige VM-sandbox.
    * Geeft nette foutmeldingen met regelnummers.
    *
    * @param code - De code die moet worden uitgevoerd.
    * @param contextVars - Variabelen die zichtbaar moeten zijn in de sandbox.
    */
    public static runSandboxed<T = unknown>(
        code: string,
        contextVars: SandboxVars = {}
    ): T {
        const sandbox: SandboxVars = {
            SignalR: SignalR,
            console,
            ...contextVars,
        };

        const context = vm.createContext(sandbox);

        try {
            return vm.runInContext(code, context, {
                filename: "dynamic.js",
                displayErrors: true,
            }) as T;
        } catch (err) {
            throw err; // laat native stacktrace intact
        }
    }
}

