import { Notifications, Tabs } from "./asynchrome";
import { Logger } from "./logger";
import { Lyric } from "./lyric";
import { Bus } from "./message-bus";
import { Storage } from "./storage";
import { Track } from "./track";
import { delay, newGuid } from "./utils";

class Process {

  private _bus: Bus = new Bus();
  private _logger = new Logger("Backgroud Process");

  private heartBeatInterval: number = null;
  private tabId: number = null;

  private _cacheArtist: string = null;
  private _cacheTitle: string = null;
  private _heartBeatInterval: number;

  constructor() {
    this.registerHotKeys();
    this.subscribe();

    (async () => { await this.heartBeat(); })();
    this._heartBeatInterval = setInterval(() => {
      (async () => { await this.heartBeat(); })();
    }, 700);
  }

  public async plantAgent() {
    this._logger.info("Planting Agent");

    let tabs = await Tabs.query({ url: "https://open.spotify.com/*" });

    if (tabs.length < 1) tabs = await Tabs.query({ url: "https://play.spotify.com/*" });
    if (tabs.length < 1) tabs = await Tabs.query({ url: "https://player.spotify.com/*" });
    if (tabs.length < 1) {
      this._logger.error("Spotify tab not found");
      return;
    }

    this.tabId = tabs[0].id;
    this._logger.debug(`Tab ID ${this.tabId}`);
  }

  private registerHotKeys() {
    this._logger.info("Registering hotkeys");

    chrome.commands.onCommand.addListener((cmd) => {
      switch (cmd) {
        case "player-toggle":
          this._bus.send("idea.cmd.player.toggle");
          break;
        case "player-next":
          this._bus.send("idea.cmd.player.next");
          break;
        case "player-previous":
          this._bus.send("idea.cmd.player.previous");
          break;
        case "player-mute":
          this._bus.send("idea.cmd.player.mute");
          break;
        case "player-shuffle":
          this._bus.send("idea.cmd.player.shuffle");
          break;
        case "player-repeat":
          this._bus.send("idea.cmd.player.repeat");
          break;
        case "player-save":
          this._bus.send("idea.cmd.player.save");
          break;
        case "player-show":
          this._bus.send("idea.cmd.player.show");
          break;
        default:
          break;
      }
    });

    chrome.notifications.onClicked.addListener((evt: any) => {
      console.log(evt);
      this._bus.send("idea.cmd.player.next");
    });
  }

  private subscribe() {
    this._logger.info("Subscribing");

    this._bus.on("idea.cmd.player.toggle", async (evt: any) => {
      if (!this.tabId) return;
      await Tabs.executeScript(this.tabId, { code: "agent.Toggle()" });
    });
    this._bus.on("idea.cmd.player.next", async (evt: any) => {
      if (!this.tabId) return;
      await Tabs.executeScript(this.tabId, { code: "agent.Next()" });
    });
    this._bus.on("idea.cmd.player.previous", async (evt: any) => {
      if (!this.tabId) return;
      await Tabs.executeScript(this.tabId, { code: "agent.Previous()" });
    });
    this._bus.on("idea.cmd.player.shuffle", async (evt: any) => {
      if (!this.tabId) return;
      await Tabs.executeScript(this.tabId, { code: "agent.Shuffle()" });
    });
    this._bus.on("idea.cmd.player.repeat", async (evt: any) => {
      if (!this.tabId) return;
      await Tabs.executeScript(this.tabId, { code: "agent.Repeat()" });
    });
    this._bus.on("idea.cmd.player.mute", async (evt: any) => {
      if (!this.tabId) return;
      await Tabs.executeScript(this.tabId, { code: "agent.Mute()" });
    });
    this._bus.on("idea.cmd.player.save", async (evt: any) => {
      if (!this.tabId) return;
      await Tabs.executeScript(this.tabId, { code: "agent.Save()" });
    });

    this._bus.on("idea.cmd.player.show", async (evt: any) => {
      if (!this.tabId) return;
      let tracks = (await Tabs.executeScript(this.tabId, { code: "agent.GetTrackInfo()" })) as Track[];
      if (!tracks || tracks.length < 1 || !tracks[0]) return;

      let options = {
        type: "progress",
        iconUrl:  tracks[0].art,
        title: tracks[0].title,
        message: tracks[0].artist,
        contextMessage: "(click to skip)",
        isClickable: true,
        progress: Math.round(tracks[0].progress * 100)
      };
      this._logger.info("Getting lyrics", tracks[0]);

      await Notifications.create("next", options);
    });

    this._bus.on("idea.track.changed", async (evt: Track) => {
      let options = {
        type: "basic",
        iconUrl: evt.art,
        title: evt.title,
        message: evt.artist,
        contextMessage: "(click to skip)",
        isClickable: true
      };

      await Notifications.create("next", options);
    });

    this._bus.on("idea.track.changed", async (evt: any) => {

      await this.getLyrics(evt.artist, evt.title);
    });

    this._bus.on("idea.evt.player.saved", async (evt: any) => {
      let options = {
        type: "basic",
        iconUrl: evt.art,
        title: evt.feedback,
        message: evt.song,
        contextMessage: "(click to skip)",
        isClickable: true
      };
      Notifications.create("saved", options);
    });

  }

  private async getLyrics(artist: string, title: string) {
    this._logger.info("Getting lyrics");

    let response = await window.fetch("http://lyrics.wikia.com/api.php?action=lyrics&artist=" + artist + "&song=" + title + "&fmt=json");
    let data = await response.text();
    // tslint:disable-next-line:no-eval
    let song = eval(data);
    let lyric: Lyric = song;

    if (lyric.lyrics.toLowerCase() === "not found") {
      Storage.Remove("lyric");
      if (title.indexOf(" - ") > -1)
        await this.getLyrics(artist, title.substring(0, title.indexOf(" - ")));
    } else {
      let lines = lyric.lyrics
        .split(/\r\n|\r|\n/)
        .filter((line: any) => line.replace(/\s/g, "") === "" ? false : true)
        .splice(0, 4);

      let lyr = "";
      for (let i in lines) {
        if (lines.hasOwnProperty(i)) {
          if (lyr.length > 120) break;
          lyr += ("\r\n" + lines[i].replace("[...]", ""));
        }
      }
      lyric.lyrics = lyr + "..";

      Storage.Set<Lyric>("lyric", lyric);
    }
  }

  private async heartBeat() {
    this._logger.debug("Heartbeat");

    if (!this.tabId) {
      this._logger.warn("Tab ID not set");
      await this.plantAgent();
      return;
    }

    let tab = await Tabs.get(this.tabId);
    if (!tab) {
      this.tabId = null;
      this._logger.warn("Tab ID not found", { tabId: this.tabId });
      await this.plantAgent();
      return;
    }

    this._logger.debug("Tab ID found", { tabId: this.tabId });

    let tracks = (await Tabs.executeScript(this.tabId, { code: "agent.GetTrackInfo()" })) as Track[];

    if (!tracks || tracks.length < 1 || !tracks[0]) {
      this._logger.debug("Agent returned no track info", { tabId: this.tabId, tracks: tracks });
      await this.plantAgent();
      return;
    }

    let track = tracks[0];

    this._bus.send("idea.track.updated", track);

    if (this._cacheArtist !== track.artist || this._cacheTitle !== track.title) {
      this._cacheArtist = track.artist;
      this._cacheTitle = track.title;

      this._bus.send("idea.track.changed", track);
    }
  }
}

let process = new Process();

// (async () => { await process.plantAgent(); })();
