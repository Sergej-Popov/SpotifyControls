export class Bus {
    private _subscriptions: Array<Subscription>;

    constructor() {
        this._subscriptions = [];
        chrome.runtime.onMessage.addListener(
            (request, sender, sendResponse) => {
                if (typeof request.type == "undefined")
                    return;
                this._subscriptions
                    .filter((s: Subscription) => {
                        return s.type == request.type
                    })
                    .forEach((s: Subscription) => {
                        s.callback(request.message)
                    })
            });
    }

    on(type: string, callback: Function) {
        this._subscriptions.push({ type: type, callback: callback });
    }

    send(type: string, message?: any) {
        this._subscriptions
            .filter((s) => { return s.type == type })
            .forEach((s) => {
                s.callback(message)
            })
        chrome.runtime.sendMessage({ type: type, message: message }, (response) => { });
    }
}

interface Subscription {
    type: string;
    callback: Function;
}