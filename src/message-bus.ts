export class Bus {
    private _subscriptions: Subscription[];

    constructor() {
        this._subscriptions = [];
        chrome.runtime.onMessage.addListener(
            (request, sender, sendResponse) => {
                if (typeof request.type === "undefined")
                    return;
                this._subscriptions
                    .filter((s: Subscription) => {
                        return s.type === request.type;
                    })
                    .forEach((s: Subscription) => {
                        s.callback(request.message);
                    });
            });
    }

    public on(type: string, callback: callbackType) {
        this._subscriptions.push({ type: type, callback: callback });
    }

    public send(type: string, message?: any) {
        this._subscriptions
            .filter((s) => s.type === type)
            .forEach((s) => {
                s.callback(message);
            });
        // tslint:disable-next-line:no-empty
        chrome.runtime.sendMessage({ type: type, message: message }, (response) => { });
    }
}

interface Subscription {
    type: string;
    callback: callbackType;
}

type callbackType = (message?: any) => void;
