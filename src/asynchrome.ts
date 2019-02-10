import { Logger } from "./logger";
import { Storage } from "./storage";
import { delay, newGuid } from "./utils";
import { IConfig } from "config";

declare const __CONFIG__: IConfig;

export class Tabs {
  public static get(tabId: number): Promise<chrome.tabs.Tab> {
    return new Promise((resolve, reject) => {
      chrome.tabs.get(tabId, (tab) => {
        resolve(tab);
      });
    });
  }
  public static find(): Promise<chrome.tabs.Tab[]> {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({}, (tabs) => {
        resolve(tabs.filter(t => __CONFIG__.tabUrlRegEx.test(t.url)));
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
  public static executeScript<T>(tabId: number, details: chrome.tabs.InjectDetails): Promise<T[]> {
    return new Promise((resolve, reject) => {
      chrome.tabs.executeScript(tabId, details, (tabs) => {
        resolve(tabs);
      });
    });
  }

  public static update(tabId: number, updateProperties: chrome.tabs.UpdateProperties): Promise<chrome.tabs.Tab> {
    return new Promise((resolve, reject) => {
      chrome.tabs.update(tabId, updateProperties, (tab) => {
        resolve(tab);
      });
    });
  }
  public static getCurrent(): Promise<chrome.tabs.Tab> {
    return new Promise((resolve, reject) => {
      chrome.tabs.getCurrent((tab) => {
        resolve(tab);
      });
    });
  }

  public static async toggleMute(tabId: number): Promise<boolean> {
    let info = await Tabs.get(tabId);
    let newState = !info.mutedInfo.muted;
    await this.update(tabId, { muted: newState });
    return newState;
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

    this._logger.info("Notifications enabled - displaying", options);

    let notificationId = await new Promise<string>((resolve, reject) => {
      chrome.notifications.create(`${prefix}-${newGuid()}`, options, (id) => {
        resolve(id);
      });
    });

    let duration = await Storage.Get<number>("notifications-duration");
    await delay((duration || 3) * 1000);

    await Notifications.clear(notificationId);
  }
}
