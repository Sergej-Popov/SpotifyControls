
import { Track } from "./track";

class Agent {
  private _player: Element = document.querySelector(".now-playing-bar");

  private _track: any = {

  }

  public isReady() {
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
      is_playing: this.GetPlayState(),
      is_saved: this.GetSavedState()
    };
  }

  public Toggle() {
    var playButton = (this._player.querySelector('.spoticon-pause-16') as HTMLElement);
    if (!playButton) playButton = (this._player.querySelector('.spoticon-play-16') as HTMLElement);
    playButton.click();
  };

  public Next() {
    (this._player.querySelector(".spoticon-skip-forward-16") as HTMLElement).click();
  };

  public Previous() {
    (this._player.querySelector(".spoticon-skip-back-16") as HTMLElement).click();
  };

  public Repeat() {
    (this._player.querySelector(".spoticon-repeat-16") as HTMLElement).click();
  };

  public Shuffle() {
    (this._player.querySelector(".spoticon-shuffle-16") as HTMLElement).click();
  };

  public Mute() {
    (this._player.querySelector(".volume-bar button") as HTMLElement).click();
  };

  public Save() {
    var playButton = (this._player.querySelector('.spoticon-add-16') as HTMLElement);
    if (!playButton) playButton = (this._player.querySelector('.spoticon-added-16') as HTMLElement);
    playButton.click();
  };

  public Rewind(target: number) {
    var elem = (this._player.querySelector('.progress-bar') as HTMLElement);
    console.log(elem);
    console.log("rewinding to target" + target);
    this._clickAt(elem, elem.offsetWidth * target);
  };

  public GetArtist() {
    try {
      return (this._player.querySelector(".track-info__artists a") as HTMLAnchorElement).text;
    } catch (error) {
      return undefined;
    }
  };

  public GetTitle() {
    try {
      return (this._player.querySelector(".track-info__name a") as HTMLAnchorElement).text;
    } catch (error) {
      return undefined;
    }
  };

  public GetArt() {
    try {
      var art = (this._player.querySelector(".cover-art-image") as HTMLAnchorElement).style.backgroundImage;
      return art.slice(5, art.length - 2);
    } catch (error) {
      return undefined;
    }
  };

  public GetProgress() {
    try {
      var t1 = this.GetElapsed().split(":").map((t) => parseInt(t));
      var elapsed = t1[0] * 60 + t1[1];

      var t2 = this.GetLength().split(":").map((t) => parseInt(t));
      var total = t2[0] > 0 ? t2[0] * 60 + t2[1] : t2[0] * 60 * -1 + t2[1] + elapsed;

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
      return this._player.querySelector(".progress-bar + .playback-bar__progress-time").innerHTML
    } catch (error) {
      return undefined;
    }
  }

  public GetVolume() {
    try {
      return parseInt((this._player.querySelector(".volume-bar .progress-bar__slider") as HTMLElement).style.left.replace("%", ""))/100
    } catch (error) {
      return undefined;
    }
  }

  public GetShuffleState() {
    try {
      var shuffleButton = this._player.querySelector(".spoticon-shuffle-16");
      return shuffleButton.classList.contains("control-button--active")
    } catch (error) {
      return undefined;
    }
  }

  public GetRepeatState() {
    try {
      var repeatButton = this._player.querySelector(".spoticon-repeat-16");
      return repeatButton.classList.contains("control-button--active")
    } catch (error) {
      return undefined;
    }
  }
  
  public GetMuteState() {
    try {
      var repeatButton = this._player.querySelector(".volume-bar button");
      return repeatButton.classList.contains("spoticon-volume-off-16")
    } catch (error) {
      return undefined;
    }
  }
  
  public GetPlayState() {
    try {
      return !!this._player.querySelector('.spoticon-pause-16');
    } catch (error) {
      return undefined;
    }
  }
  
  public GetSavedState() {
    try {
      return !!this._player.querySelector('.spoticon-added-16');
    } catch (error) {
      return undefined;
    }
  }

  private _clickAt = function (elem: HTMLElement, x: number) {
    console.log("rewinding to width" + x);
    console.log("rewinding to offset" + (elem.offsetLeft + x));
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 0, elem.offsetLeft + x, 0, x, 6, false, false, false, false, 0, undefined);
    elem.dispatchEvent(evt);
  }
}

(<any>window).agent = new Agent();
