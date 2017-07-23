function Agent(){
	var _player = document.getElementsByClassName("now-playing-bar")[0]
	var self = this;
	
	var _track = {
		artist: undefined,
		title: undefined,
		art: undefined,
		progress: 0,
		elapsed: 0,
		length: 0,
		shuffle_on: false,
		repeat_on: false,
	}
	
	self.isReady = function() {
		if(!_player) return false;
		return true;
	}
	self.GetTrackInfo = function() {
		if(!self.isReady())
			return undefined;
		
		_track.artist = self.GetArtist();
		_track.title = self.GetTitle();
		_track.art = self.GetArt();
		_track.progress = self.GetProgress();
		_track.elapsed = self.GetElapsed();
		_track.length = self.GetLength();
		_track.shuffle_on = self.GetShuffleState();
		_track.repeat_on = self.GetRepeatState();
		
		return _track;
	}

	self.Toggle = function(){
			var playButton = _player.querySelector('.spoticon-pause-16');
			if(!playButton) playButton = _player.querySelector('.spoticon-play-16');
			playButton.click();
	};
	self.Next = function(){
		_player.querySelector(".spoticon-skip-forward-16").click();
	};
	self.Previous = function(){
		_player.querySelector(".spoticon-skip-back-16").click();
	};
	self.Repeat = function(){
		_player.querySelector(".spoticon-repeat-16").click();
	};
	self.Shuffle = function(){
		_player.querySelector(".spoticon-shuffle-16").click();
	};
	self.Rewind = function(target){
		var elem = _player.querySelector('.progress-bar');
		console.log(elem);
		console.log("rewinding to target" + target);
		_clickAt(elem, elem.offsetWidth * target);
	};
	
	var _clickAt = function(elem, x)
	{
		console.log("rewinding to width" + x);
		console.log("rewinding to offset" + (elem.offsetLeft + x));
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent("click", true, true, window, 0, elem.offsetLeft + x, 0, x, 6, false, false, false, false, 0, undefined);
		elem.dispatchEvent(evt);
	}
	
	self.GetArtist = function(){
		try {
			return _player.querySelector(".track-info__artists a").text;
		} catch (error) {
			return undefined;
		}
	};
	self.GetTitle = function(){
		try {
			return _player.querySelector(".track-info__name a").text;
		} catch (error) {
			return undefined;
		}
	};
	self.GetArt = function(){
		try {
			var art = _player.querySelector(".cover-art-image").style.backgroundImage;
			return art.slice(5, art.length-2 );
		} catch (error) {
			return undefined;
		}
	};
	self.GetProgress = function(){
		try {
			var t1 = self.GetElapsed().split(":").map((t) => parseInt(t));
			var elapsed = t1[0]*60 + t1[1];

			var t2 = self.GetLength().split(":").map((t) => parseInt(t));
			var total = t2[0] > 0 ? t2[0]*60 + t2[1] : t2[0]*60*-1 + t2[1] + elapsed;

			return elapsed / total;
;
		} catch (error) {
			return undefined;
		}
	};
	self.GetElapsed = function(){
		try {
			return  _player.querySelector(".playback-bar__progress-time").innerHTML;
		} catch (error) {
			return undefined;
		}
	};
	self.GetLength = function(){
		try {
			return  _player.querySelector(".progress-bar + .playback-bar__progress-time").innerHTML
		} catch (error) {
			return undefined;
		}
	};
	self.GetShuffleState = function(){
		try {
			var shuffleButton = _player.querySelector(".spoticon-shuffle-16");
			return shuffleButton.classList.contains("control-button--active")
		} catch (error) {
			return undefined;
		}
	};
	self.GetRepeatState = function(){
		try {
			var repeatButton = _player.querySelector(".spoticon-repeat-16");
			return repeatButton.classList.contains("control-button--active")
		} catch (error) {
			return undefined;
		}
	};
};
window.agent = new Agent();