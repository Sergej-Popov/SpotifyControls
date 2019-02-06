type KeyLiteral = "lyric" | "track" | "rated" | "donated" | "notifications-disabled"| "notifications-duration" | "notifications-play-disabled";

export class Storage {
    public static async Get<T>(key: KeyLiteral): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            chrome.storage.local.get(key, (flag) => {
                resolve(flag[key] as T);
            });
        });
    }

    public static Set<T>(key: KeyLiteral, value: T) {
        chrome.storage.local.set({ [key]: value });
    }

    public static Remove(key: KeyLiteral) {
        chrome.storage.local.remove(key);
    }
}
