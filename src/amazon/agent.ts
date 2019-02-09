import { Logger } from "logger";
import { Track } from "track";
import { Bus } from "message-bus";
import { Tabs } from "asynchrome";

class Agent {
  private _player: Element = document.querySelector(".now-playing-bar");
  private _logger = new Logger("Agent");
  private _bus = new Bus();

  constructor() {
    this._logger.info("Agent planted");
  }

  public isReady() {
    if (!this._player) this._player = document.querySelector(".playbackControlsView");
    if (!this._player) return false;
    return true;
  }

  public GetTrackInfo(): Track {
    if (!this.isReady())
      return undefined;

    return {
      artist: this.GetArtist(),
      title: this.GetTitle(),
      art: this.GetArt(),
      progress: this.GetProgress(),
      elapsed: this.GetElapsed(),
      length: this.GetLength(),
      volume: this.GetVolume(),
      shuffle_on: this.GetShuffleState(),
      repeat_on: this.GetRepeatState(),
      mute_on: this.GetMuteState(),
      is_paused: this.GetPauseState(),
      is_saved: this.GetSavedState()
    };
  }

  public Toggle() {
    let playButton = (this._player.querySelector(".playButton") as HTMLElement);
    playButton.click();

    if (!this.GetPauseState()) {
      this._bus.send("idea.evt.player.playing");
    }
  }

  public Next() {
    (this._player.querySelector(".nextButton") as HTMLElement).click();
  }

  public Previous() {
    (this._player.querySelector(".previousButton") as HTMLElement).click();
  }

  public Repeat() {
    (this._player.querySelector(".repeatButton") as HTMLElement).click();
  }

  public Shuffle() {
    (this._player.querySelector(".playerIconShuffle") as HTMLElement).click();
  }

  public Mute() { }

  public Save() {
    let saveButton = (this._player.querySelector(".libraryButton .stroke.add") as HTMLElement);
    let unsaveButton = (this._player.querySelector(".libraryButton .stroke.added") as HTMLElement);
    (saveButton || unsaveButton).click();

    this._bus.send("idea.evt.player.saved", {
      feedback: saveButton ? "Added to your Favorite Songs" : "Removed from your Favorite Songs",
      song: `${this.GetArtist()} - ${this.GetTitle()}`,
      art: this.GetArt()
    });
  }

  public Forward() {
    var current = this.GetProgress();
    this._logger.info("forward", { current });
    this.Rewind(current >= 0.9 ? 0.99 : current + 0.1);
  }
  public Backward() {
    var current = this.GetProgress();
    this._logger.info("backward", { current });
    this.Rewind(current <= 0.1 ? 0.01 : current - 0.1);
  }

  public Rewind(target: number) {
    let elem = (this._player.querySelector(".sliderTrack") as HTMLElement);
    this._logger.info("rewinding", { target });
    this._clickAt(elem, elem.offsetWidth * target);
  }

  public GetArtist() {
    try {
      return (this._player.querySelector(".trackArtist a") as HTMLAnchorElement).text;
    } catch (error) {
      return undefined;
    }
  }

  public GetTitle() {
    try {
      return (this._player.querySelector(".trackTitle a") as HTMLAnchorElement).text;
    } catch (error) {
      return undefined;
    }
  }

  public GetArt() {
    try {
      let elem = (this._player.querySelector(".renderImage") as HTMLImageElement);
      let art = elem.src || elem.getAttribute("data-src");
      return art;
    } catch (error) {
      return undefined;
    }
  }

  public GetProgress() {
    try {
      let t1 = this.GetElapsed().split(":").map((t) => ~~t);
      let elapsed = t1[0] * 60 + t1[1];

      let t2 = this.GetLength().split(":").map((t) => ~~t);
      let total = t2[0] > 0 ? t2[0] * 60 + t2[1] : t2[0] * 60 * -1 + t2[1] + elapsed;

      return elapsed / total;
    } catch (error) {
      return undefined;
    }
  }

  public GetElapsed() {
    try {
      let duration = this.GetDuration();
      let remainder = this.GetRemainder();
      let seconds = duration - remainder;
      return `${Math.floor(seconds / 60)}:${Math.round(seconds % 60)}`;
    } catch (error) {
      return undefined;
    }
  }
  public GetRemainder() {
    try {
      let remainderTimeParts = this._player.querySelector(".listViewDuration").innerHTML.split("-")[1].split(":");
      return ~~remainderTimeParts[0] * 60 + ~~remainderTimeParts[1];
    } catch (error) {
      return undefined;
    }
  }

  public GetDuration() {
    try {
      let remainder = this.GetRemainder();
      let remainderPercent = parseFloat((this._player.querySelector(".sliderTrackRemainder") as HTMLElement).style.width.split("%")[0]);
      return remainder / remainderPercent * 100;

    } catch (error) {
      return undefined;
    }
  }

  public GetLength() {
    try {
      let remainder = this.GetRemainder();
      let remainderPercent = parseFloat((this._player.querySelector(".sliderTrackRemainder") as HTMLElement).style.width.split("%")[0]);
      let seconds = remainder / remainderPercent * 100;
      return `${Math.floor(seconds / 60)}:${Math.round(seconds % 60)}`;

    } catch (error) {
      return undefined;
    }
  }

  public GetVolume() {
    try {
      return ~~((this._player.querySelector(".volume-bar .progress-bar__slider") as HTMLElement).style.left.replace("%", "")) / 100;
    } catch (error) {
      return undefined;
    }
  }

  public GetShuffleState() {
    try {
      let shuffleButton = this._player.querySelector(".shuffleButton");
      return shuffleButton.classList.contains("on");
    } catch (error) {
      return undefined;
    }
  }

  public GetRepeatState() {
    try {
      let repeatButton = this._player.querySelector(".repeatButton");
      return repeatButton.classList.contains("on");
    } catch (error) {
      return undefined;
    }
  }

  public GetMuteState() {
    return false;
  }

  public GetPauseState() {
    try {
      return !!this._player.querySelector(".playerIconPause");
    } catch (error) {
      return undefined;
    }
  }

  public GetSavedState() {
    try {
      return !!this._player.querySelector(".listViewStatusButtonInLibrary .added");
    } catch (error) {
      return undefined;
    }
  }

  private _clickAt = (elem: HTMLElement, x: number) => {
    let box = elem.getBoundingClientRect() as DOMRect;
    this._logger.info("click at", { x, offset: (box.x + x) });
    let down = document.createEvent("MouseEvents");
    let up = document.createEvent("MouseEvents");
    down.initMouseEvent("mousedown", true, true, window, null, 0, 0, box.x + x, box.y, false, false, false, false, 0, undefined);
    up.initMouseEvent("mouseup", true, true, window, null, 0, 0, box.x + x, box.y, false, false, false, false, 0, undefined);
    elem.dispatchEvent(down);
    elem.dispatchEvent(up);
  }
}

(window as any).agent = new Agent();
