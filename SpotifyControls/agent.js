function Agent(){
	
	var _newPlayer = document.getElementById('main') != undefined;
	var _player = (document.getElementById('app-player') || document.getElementById('main'))
	var self = this;
	
	var _track = {
		artist: undefined,
		title: undefined,
		art: undefined,
		progress: undefined,
		elapsed: undefined,
		length: undefined,
		shuffle_state: undefined,
		repeat_state: undefined,
	}
	
	self.isReady = function() {
		
		if(!_player) return false;
		
		if(!_player.contentWindow.document.querySelector( _newPlayer ? '#view-now-playing .artist a' : '#track-artist a')) return false;
		if(!_player.contentWindow.document.querySelector( _newPlayer ? '#view-now-playing .track a' : '#track-name a')) return false;
		if(!_player.contentWindow.document.querySelector( _newPlayer ? '#view-now-playing .cover-image' : '#cover-art .sp-image-img')) return false;
		if(!_player.contentWindow.document.querySelector( _newPlayer ? '#view-now-playing .cover-image' : '#cover-art .sp-image-img')) return false;
		
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
		_track.shuffle_state = self.GetShuffleState();
		_track.repeat_state = self.GetRepeatState();
		
		return _track;
	}

	self.Toggle = function(){
		_newPlayer ?
			_player.contentWindow.document.getElementById('play').click()
			:
			_player.contentWindow.document.getElementById('play-pause').click();
	};
	self.Next = function(){
		_player.contentWindow.document.getElementById('next').click();
	};
	self.Previous = function(){
		_player.contentWindow.document.getElementById('previous').click();
	};
	self.Repeat = function(){
		_player.contentWindow.document.getElementById('repeat').click();
	};
	self.Shuffle = function(){
		_player.contentWindow.document.getElementById('shuffle').click();
	};
	
	self.GetArtist = function(){
		try {
			return _player.contentWindow.document.querySelector(_newPlayer ? '#view-now-playing .artist a' : '#track-artist a').text;
		} catch (error) {
			return undefined;
		}
	};
	self.GetTitle = function(){
		try {
			return _player.contentWindow.document.querySelector(_newPlayer ? '#view-now-playing .track a' : '#track-name a').text;
		} catch (error) {
			return undefined;
		}
	};
	self.GetArt = function(){
		try {
			var art = _player.contentWindow.document.querySelector(_newPlayer ? '#view-now-playing .cover-image' : '#cover-art .sp-image-img').style.backgroundImage;
			return art.slice(4, art.length-1 );
		} catch (error) {
			return undefined;
		}
	};
	self.GetProgress = function(){
		try {
			return _newPlayer ? 1 - parseFloat(_player.contentWindow.document.querySelector('#progressbar .progress-bar .inner').style.right
								.substring(0, _player.contentWindow.document.querySelector('#progressbar .progress-bar .inner').style.right.length -1))/100
						  : _player.contentWindow.document.querySelector('#bar-inner').offsetWidth / _player.contentWindow.document.querySelector('#bar-outer').offsetWidth;
		} catch (error) {
			return undefined;
		}
	};
	self.GetElapsed = function(){
		try {
			return  _player.contentWindow.document.querySelector(_newPlayer ? '.player-controls-container #elapsed' : '#track-current').innerHTML;
		} catch (error) {
			return undefined;
		}
	};
	self.GetLength = function(){
		try {
			return  _player.contentWindow.document.querySelector(_newPlayer ? '.player-controls-container #remaining' : '#track-length').innerHTML;
		} catch (error) {
			return undefined;
		}
	};
	self.GetShuffleState = function(){
		try {
			return _newPlayer ? _player.contentWindow.document.querySelector('#extra-buttons #shuffle').className.indexOf("active") == -1 ? "" : "active"
							  : _player.contentWindow.document.querySelector('#shuffle').className;
		} catch (error) {
			return undefined;
		}
	};
	self.GetRepeatState = function(){
		try {
			return _newPlayer ? _player.contentWindow.document.querySelector('#extra-buttons #repeat').className.indexOf("active") == -1 ? "" : "active"
							  : _player.contentWindow.document.querySelector('#repeat').className;
		} catch (error) {
			return undefined;
		}
	};
};
window.agent = new Agent();