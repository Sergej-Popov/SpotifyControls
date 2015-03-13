window.SpotifyControls = {
	updateInterval:undefined
};


(function($, undefined){ 


	document.addEventListener('DOMContentLoaded', function() {
		var controls = document.getElementsByClassName('control');
		
		for(var i = 0; i < controls.length; i++){
			controls[i].addEventListener('click', function(evt) {
				activateControl(evt.srcElement.id)
			});
		}
		
		console.log("setting interval");
		clearInterval(SpotifyControls.updateInterval);
		updateTrackInfo();
		SpotifyControls.updateInterval = setInterval(function(){
			updateTrackInfo();
		}, 1000);
		
		
	});

	function updateTrackInfo()
	{
		var queryInfo = {
			url: "https://play.spotify.com/*"
		};
		chrome.tabs.query(queryInfo, function(tabs) {
			if(tabs.length < 1)
				return;
			
			var tabId = tabs[0].id;
			chrome.tabs.executeScript(tabId, {file:'spotify.getTrackInfo.js'}, function(track){
				console.log(track)
				$('#track-artist').html(track[0][0].artist);
				$('#track-name').html(track[0][0].name);
				$('#track-art').attr('src', track[0][0].art.slice(4, track[0][0].art.length-1 ));
				$('#track-progress').width(track[0][0].progress);
				$('#track-current').html(track[0][0].track_current);
				$('#track-length').html(track[0][0].track_length);
			});
			
		});
	}
	  
	function activateControl(control)
	{
		var queryInfo = {
			url: "https://play.spotify.com/*"
		};

		chrome.tabs.query(queryInfo, function(tabs) {
			if(tabs.length < 1)
				return;
			
			var tabId = tabs[0].id;
			var script = "document.getElementById('app-player').contentWindow.document.getElementById('" + control + "').click()";
			
			chrome.tabs.executeScript(tabId, {code:script});
			
		});
	}
 }(jQuery));