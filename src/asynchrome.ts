export class Tabs {
    public static get(tabId: number): Promise<chrome.tabs.Tab> {
        return new Promise((resolve, reject) => {
            chrome.tabs.get(tabId, (tab) => {
                resolve(tab);
            });
        });
    }
    public static query(queryInfo: chrome.tabs.QueryInfo): Promise<chrome.tabs.Tab[]> {
        return new Promise((resolve, reject) => {
            chrome.tabs.query(queryInfo, (tabs) => {
                resolve(tabs);
            });
        });
    }
    public static executeScript(tabId: number, details: chrome.tabs.InjectDetails): Promise<any[]> {
        return new Promise((resolve, reject) => {
            chrome.tabs.executeScript(tabId, details, (tabs) => {
                resolve(tabs);
            });
        });
    }
}

export class Notifications {
    public static clear(notificationId: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            chrome.notifications.clear(notificationId, (isCleared) => {
                resolve(isCleared);
            });
        });
    }
    public static create(notificationId: string, options: chrome.notifications.NotificationOptions): Promise<string> {
        return new Promise((resolve, reject) => {
            chrome.notifications.create(notificationId, options, (id) => {
                resolve(id);
            });
        });
    }
}
