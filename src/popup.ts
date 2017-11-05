import { Logger } from "./logger";
import { Lyric } from "./lyric";
import { Bus } from "./message-bus";
import { Resources } from "./resources";
import { Storage } from "./storage";
import { Track } from "./track";
import { delay } from "./utils";

class Main {
    private _bus: Bus;
    private _logger: Logger = new Logger("Main");

    constructor() {
        this._logger.debug("ctor");
        this._bus = new Bus();
    }

    public async initialize() {
        this._logger.debug("init");

        this._bus.on("idea.track.updated", async (evt: Track) => { await this.updateTrackInfo(evt); });
        this._bus.on("idea.track.changed", async (evt: Track) => { await this.updateTrack(evt); });

        await this.hideActions();
        this.registerClicks();
        this.printConsoleGreetings();
    }

    private async updateTrackInfo(track: Track) {
        this._logger.debug("updating tack info", track);

        document.querySelector("#main").classList.remove("no-player");
        (document.querySelector("#track-progress") as HTMLElement).style.width =
            (document.querySelector("#track-bar").clientWidth * track.progress) + "px";
        (document.querySelector("#volume-level") as HTMLElement).style.width =
            (document.querySelector("#volume-bar").clientWidth * track.volume) + "px";
        document.querySelector("#track-elapsed").innerHTML = track.elapsed;
        track.shuffle_on ? document.querySelector("#shuffle").classList.add("active") : document.querySelector("#shuffle").classList.remove("active");
        track.repeat_on ? document.querySelector("#repeat").classList.add("active") : document.querySelector("#repeat").classList.remove("active");

        if (track.mute_on) {
            document.querySelector("#mute").classList.add("fa-volume-off");
            document.querySelector("#mute").classList.remove("fa-volume-up");
        } else {
            document.querySelector("#mute").classList.add("fa-volume-up");
            document.querySelector("#mute").classList.remove("fa-volume-off");
        }
        if (track.is_playing) {
            document.querySelector("#toggle").classList.add("fa-pause-circle-o");
            document.querySelector("#toggle").classList.remove("fa-play-circle-o");
        } else {
            document.querySelector("#toggle").classList.add("fa-play-circle-o");
            document.querySelector("#toggle").classList.remove("fa-pause-circle-o");
        }
        if (track.is_saved) {
            document.querySelector("#save").classList.add("fa-check");
            document.querySelector("#save").classList.remove("fa-plus");
        } else {
            document.querySelector("#save").classList.add("fa-plus");
            document.querySelector("#save").classList.remove("fa-check");
        }

        document.querySelector("#track-artist").innerHTML = track.artist;
        document.querySelector("#track-title").innerHTML = track.title;
        if (!!track.art)
            document.querySelector("#track-art").setAttribute("src", track.art);
        document.querySelector("#track-length").innerHTML = track.length;

        let lyric = await Storage.Get<Lyric>("lyric");
        if (lyric) {
            document.querySelector("#lyrics-link").setAttribute("href", lyric.url);
            document.querySelector("#lyrics-text").innerHTML = lyric.lyrics;
            document.querySelector("#lyrics").classList.remove("hidden");
        } else {
            document.querySelector("#lyrics").classList.add("hidden");
        }
    }

    private updateTrack(track: Track) {
        this._logger.info("updating tack", track);

        document.querySelector("#main").classList.remove("no-player");
        document.querySelector("#track-artist").innerHTML = track.artist;
        document.querySelector("#track-title").innerHTML = track.title;
        document.querySelector("#track-art").setAttribute("src", track.art);
        document.querySelector("#lyrics").classList.add("hidden");
    }

    private async hideActions() {
        if (await Storage.Get<boolean>("rated")) (document.querySelector("#rate-outer") as HTMLElement).style.display = "none";
        if (await Storage.Get<boolean>("donated")) (document.querySelector("#donation") as HTMLElement).style.display = "none";
        (document.querySelector("#settings-notification") as HTMLInputElement).checked = !(await Storage.Get<boolean>("notifications-disabled"));
    }

    private async registerClicks() {
        let controls = document.getElementsByClassName("control");

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < controls.length; i++) {
            controls[i].addEventListener("click", (evt) => {
                this._logger.debug(`click: ${evt.srcElement.id}`);
                this._bus.send("idea.cmd.player." + evt.srcElement.id);
            });
        }

        document.querySelector("#notification a").addEventListener("click", (evt: MouseEvent) => {
            this._logger.debug("click: notification");
            chrome.tabs.create({ url: Resources.urlSpotify });
            evt.preventDefault();
        });

        document.querySelector("#settings-btn").addEventListener("click", (evt: MouseEvent) => {
            this._logger.debug("click: settings");
            document.querySelector("#settings").classList.toggle("open");
            evt.preventDefault();
        });

        document.querySelector("#hotkeys-lnk").addEventListener("click", (evt: MouseEvent) => {
            this._logger.debug("click: hotkeys");
            chrome.tabs.create({ url: Resources.urlChromeCommands });
            evt.preventDefault();
        });

        document.querySelector("#contribute").addEventListener("click", (evt: MouseEvent) => {
            this._logger.debug("click: contribute");
            chrome.tabs.create({ url: Resources.urlOss });
            evt.preventDefault();
        });

        document.querySelector("#paypal").addEventListener("click", (evt: MouseEvent) => {
            this._logger.debug("click: paypal");
            chrome.tabs.create({ url: Resources.urlPayPal });
            Storage.Set("donated", true);
            evt.preventDefault();
        });

        document.querySelector("#rate").addEventListener("click", (evt: MouseEvent) => {
            this._logger.debug("click: rate");
            chrome.tabs.create({ url: Resources.urlReviews });
            Storage.Set("rated", true);
            evt.preventDefault();
        });

        document.querySelector("#settings-notification").addEventListener("change", (evt: MouseEvent) => {
            let enabled = (evt.target as HTMLInputElement).checked;
            this._logger.info(`change: notifications enabled: ${enabled}`);
            Storage.Set("notifications-disabled", !enabled);
            evt.preventDefault();
        });
    }

    private printConsoleGreetings() {
        this._logger.info(Resources.msgDontHack);
        this._logger.info(Resources.msgBuyBeer);
        this._logger.info(Resources.msgRate);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    let main = new Main();
    await main.initialize();
});
