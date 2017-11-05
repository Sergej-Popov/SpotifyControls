export class Logger {
    get _level(): LogLevel {
        return (window as any).logLevel || LogLevel.Warn;
    }

    private _name: string;

    constructor(name: string) {
        this._name = name;
    }

    public debug(message: any, ...params: any[]) {
        if (this._level > LogLevel.Debug) return;
        // tslint:disable-next-line:no-console
        console.log(message, `, component: "${this._name}".`, ...params);
    }

    public info(message: any, ...params: any[]) {
        if (this._level > LogLevel.Info) return;
        // tslint:disable-next-line:no-console
        console.info(message, `, component: "${this._name}".`, ...params);
    }

    public warn(message: any, ...params: any[]) {
        if (this._level > LogLevel.Warn) return;
        // tslint:disable-next-line:no-console
        console.warn(message, `, component: "${this._name}".`, ...params);
    }

    public error(message: any, ...params: any[]) {
        if (this._level > LogLevel.Error) return;
        // tslint:disable-next-line:no-console
        console.error(message, `, component: "${this._name}".`, ...params);
    }
}

export enum LogLevel {
    None,
    Debug,
    Info,
    Warn,
    Error
}
