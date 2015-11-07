window.Idea = {
	updateInterval:undefined,
	cache:{
		track: {
			artist: undefined,
			name: undefined
		}
	},
	newGuid: function () {
	  function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
		  .toString(16)
		  .substring(1);
	  }
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
	},
	bus: {
		_subscriptions:[],
		_initialize: function(){
			chrome.runtime.onMessage.addListener(
			  function(request, sender, sendResponse) {				
				if (typeof request.type == "undefined")
				  return;
				Idea.bus._subscriptions.filter(function(s){ return s.type == request.type}).forEach(function(s){
					s.callback(request.message)
				})
			  });
		}(),
		on: function(type, callback){
			Idea.bus._subscriptions.push({ type: type, callback: callback});
		},
		send: function(type, message){
			Idea.bus._subscriptions.filter(function(s){ return s.type == type}).forEach(function(s){
					s.callback(message)
				})
			chrome.runtime.sendMessage({type: type, message:message}, function(response) {});
		}
	}
};


(function(undefined){ 

	chrome.commands.onCommand.addListener(function(cmd){
		switch(cmd){
			case "player-toggle":
			Idea.bus.send("idea.cmd.player.toggle");
			break;
			case "player-next":
			Idea.bus.send("idea.cmd.player.next");
			break;
			case "player-previous":
			Idea.bus.send("idea.cmd.player.previous");
			break;
			default:
			break;
		}
	})

	clearInterval(Idea.updateInterval);
	updateTrackInfo();
	Idea.updateInterval = setInterval(function(){
		updateTrackInfo();
	}, 700);
	
	 Idea.bus.on("idea.cmd.player.toggle", function(evt){
		execute([{code:"document.getElementById('app-player').contentWindow.document.getElementById('play-pause').click()"},
				 {code:"document.getElementById('main').contentWindow.document.getElementById('play').click()"}],function(){ }, function(){});
	 });
	 Idea.bus.on("idea.cmd.player.next", function(evt){
		execute([{code:"document.getElementById('app-player').contentWindow.document.getElementById('next').click()"},
				 {code:"document.getElementById('main').contentWindow.document.getElementById('next').click()"}],function(){ }, function(){});
	 });
	 Idea.bus.on("idea.cmd.player.previous", function(evt){
		execute([{code:"document.getElementById('app-player').contentWindow.document.getElementById('previous').click()"},
				 {code:"document.getElementById('main').contentWindow.document.getElementById('previous').click()"}],function(){ }, function(){});
	 });
	 Idea.bus.on("idea.cmd.player.shuffle", function(evt){
		execute([{code:"document.getElementById('app-player').contentWindow.document.getElementById('shuffle').click()"},
				 {code:"document.getElementById('main').contentWindow.document.getElementById('shuffle').click()"}],function(){ }, function(){});
	 });
	 Idea.bus.on("idea.cmd.player.repeat", function(evt){
		execute([{code:"document.getElementById('app-player').contentWindow.document.getElementById('repeat').click()"},
				 {code:"document.getElementById('main').contentWindow.document.getElementById('repeat').click()"}],function(){ }, function(){});
	 });
	
	 Idea.bus.on("idea.track.changed", function(evt){

		var options = { 
			type: "basic",
			iconUrl: evt.img,
			title: evt.artist,
			message: evt.name,
			contextMessage: "(click to skip)               Made by IdeaSoftware",
			// buttons: [{ title: "next", iconUrl: "/images/next.png"}, { title: "next", iconUrl: "/images/next.png"}],
			isClickable: true
		}
		chrome.notifications.create(Idea.newGuid(), options , function(notificationId){
			setTimeout(function(){chrome.notifications.clear(notificationId, function(wasCleared){})}, 5000);
		});
	 })

	chrome.notifications.onClicked.addListener(function(evt){
			Idea.bus.send("idea.cmd.player.next");
	})
	
	
	
	function updateTrackInfo()
	{
		
		execute([{file:'spotify.play.getTrackInfo.js'}, {file:'spotify.player.getTrackInfo.js'}]
		, function(track){
			var updateMsg = {
					progress: track[0][0].progress,
					current: track[0][0].track_current,
					shuffle: track[0][0].shuffle_state,
					repeat: track[0][0].repeat_state,
					artist: track[0][0].artist,
					name: track[0][0].name,
					length: track[0][0].track_length,
					img: track[0][0].art.slice(4, track[0][0].art.length-1 )
				}
				
				Idea.bus.send("idea.track.updated", updateMsg);
				
				
				if(Idea.cache.artist != track[0][0].artist || Idea.cache.name != track[0][0].name)
				{
					var changeMsg = {
						artist: track[0][0].artist,
						name: track[0][0].name,
						length: track[0][0].track_length,
						img: track[0][0].art.slice(4, track[0][0].art.length-1 )
					}
					
					Idea.cache.artist = track[0][0].artist;
					Idea.cache.name = track[0][0].name;
					
					
					Idea.bus.send("idea.track.changed", changeMsg);
				}
		}, function(){
			Idea.bus.send("idea.error.notab");
		})
	}
	
	
	function execute(scripts, callback, errorCallback)
	{
		
		chrome.tabs.query({url: "https://play.spotify.com/*"}, function(tabs) {
			if(tabs.length > 0) {
				var tabId = tabs[0].id;
				chrome.tabs.executeScript(tabId, scripts[0], function(data){
						callback(data);
				});
			}
			else{
				chrome.tabs.query({url: "https://player.spotify.com/*"}, function(tabs) {
					if(tabs.length < 1) {
						errorCallback();
						return;
					}
					var tabId = tabs[0].id;
					chrome.tabs.executeScript(tabId, scripts[1], function(data){
						callback(data);
					});
				});
			}
		});
	}
 }());