import { Logger } from "logger";
import { Track } from "track";
import { Bus } from "message-bus";

class Agent {
  private _player: Element = document.querySelector(".now-playing-bar");
  private _logger = new Logger("Agent");
  private _bus = new Bus();

  private _track: any = {
  };

  constructor() {
    this._logger.info("Agent planted");
  }

  public isReady() {
    if (!this._player) this._player = document.querySelector(".now-playing-bar");
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
    let playButton = (this._player.querySelector(".spoticon-pause-16") as HTMLElement);
    if (!playButton) playButton = (this._player.querySelector(".spoticon-play-16") as HTMLElement);
    playButton.click();

    if (!this.GetPauseState()) {
      this._bus.send("idea.evt.player.playing");
    }
  }

  public Next() {
    (this._player.querySelector(".spoticon-skip-forward-16") as HTMLElement).click();
  }

  public Previous() {
    (this._player.querySelector(".spoticon-skip-back-16") as HTMLElement).click();
  }

  public Repeat() {
    ((this._player.querySelector(".spoticon-repeat-16") as HTMLElement) || (this._player.querySelector(".spoticon-repeatonce-16") as HTMLElement)).click();
  }

  public Shuffle() {
    (this._player.querySelector(".spoticon-shuffle-16") as HTMLElement).click();
  }

  public Mute() {
    (this._player.querySelector(".volume-bar button") as HTMLElement).click();
  }

  public Save() {
    let saveButton = (this._player.querySelector(".spoticon-heart-16") as HTMLElement);
    let unsaveButton = (this._player.querySelector(".spoticon-heart-active-16") as HTMLElement);
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
    let elem = (this._player.querySelector(".playback-bar .progress-bar") as HTMLElement);
    this._logger.info("rewinding", { target });
    this._clickAt(elem, elem.offsetWidth * target);
  }

  public SetVolume(target: number) {
    let elem = (this._player.querySelector(".volume-bar .progress-bar") as HTMLElement);
    this._logger.info(elem);
    this._logger.info("rewinding to target" + target);
    this._clickAt(elem, elem.offsetWidth * target);
  }

  public GetArtist() {
    try {
      return (this._player.querySelector(".track-info__artists a") as HTMLAnchorElement).text;
    } catch (error) {
      return undefined;
    }
  }

  public GetTitle() {
    try {
      return (this._player.querySelector(".track-info__name a") as HTMLAnchorElement).text;
    } catch (error) {
      return undefined;
    }
  }

  public GetArt() {
    try {
      let art = (this._player.querySelector(".cover-art-image") as HTMLAnchorElement).style.backgroundImage;
      return art.slice(5, art.length - 2);
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
      return this._player.querySelector(".playback-bar__progress-time").innerHTML;
    } catch (error) {
      return undefined;
    }
  }

  public GetLength() {
    try {
      let all = this._player.querySelectorAll(".playback-bar__progress-time");
      return all[all.length - 1].innerHTML;
    } catch (error) {
      return undefined;
    }
  }

  public GetVolume() {
    try {
      var bar = this._player.querySelector(".volume-bar .progress-bar__fg_wrapper").getBoundingClientRect() as DOMRect;
      var prog = this._player.querySelector(".volume-bar .progress-bar__fg").getBoundingClientRect() as DOMRect;
      return 1 - (bar.x - prog.x) / bar.width
    } catch (error) {
      return undefined;
    }
  }

  public GetShuffleState() {
    try {
      let shuffleButton = this._player.querySelector(".spoticon-shuffle-16");
      return shuffleButton.classList.contains("control-button--active");
    } catch (error) {
      return undefined;
    }
  }

  public GetRepeatState() {
    try {
      let repeatButton = this._player.querySelector(".spoticon-repeat-16");
      if (!repeatButton) repeatButton = this._player.querySelector(".spoticon-repeatonce-16");
      return repeatButton.classList.contains("control-button--active");
    } catch (error) {
      return undefined;
    }
  }

  public GetMuteState() {
    try {
      let repeatButton = this._player.querySelector(".volume-bar button");
      return repeatButton.classList.contains("spoticon-volume-off-16");
    } catch (error) {
      return undefined;
    }
  }

  public GetPauseState() {
    try {
      return !!this._player.querySelector(".spoticon-pause-16");
    } catch (error) {
      return undefined;
    }
  }

  public GetSavedState() {
    try {
      return !!this._player.querySelector(".spoticon-heart-active-16");
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
