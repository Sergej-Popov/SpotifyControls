import { Logger } from "./logger";
import { Storage } from "./storage";
import { delay, newGuid, getChromeVersion } from "./utils";

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
  private static _logger = new Logger("Notifications Process");

  public static clear(notificationId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      chrome.notifications.clear(notificationId, (isCleared) => {
        resolve(isCleared);
      });
    });
  }

  public static async create(prefix: string, options: chrome.notifications.NotificationOptions) {

    // if (getChromeVersion() >= 70) {
    //   options.silent = true;
    // }

    if (await Storage.Get<boolean>("notifications-disabled")) {
      this._logger.info("Notifications disabled - skipping");
      return;
    }
    this._logger.info("Notifications enabled - displaying");

    let notificationId = await new Promise<string>((resolve, reject) => {
      chrome.notifications.create(`${prefix}-${newGuid()}`, options, (id) => {
        resolve(id);
      });
    });

    await delay(5000);
    await Notifications.clear(notificationId);
  }
}
