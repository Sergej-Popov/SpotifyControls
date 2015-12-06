/* global Idea */
/* global chrome */
window.Idea = {
	heartBeatInterval: undefined,
	cache: {
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
		_subscriptions: [],
		_initialize: function () {
			chrome.runtime.onMessage.addListener(
				function (request, sender, sendResponse) {
					if (typeof request.type == "undefined")
						return;
					Idea.bus._subscriptions.filter(function (s) { return s.type == request.type }).forEach(function (s) {
						s.callback(request.message)
					})
				});
		} (),
		on: function (type, callback) {
			Idea.bus._subscriptions.push({ type: type, callback: callback });
		},
		send: function (type, message) {
			Idea.bus._subscriptions.filter(function (s) { return s.type == type }).forEach(function (s) {
				s.callback(message)
			})
			chrome.runtime.sendMessage({ type: type, message: message }, function (response) { });
		}
	}
};


(function (undefined) {

	plantAgent();

	chrome.commands.onCommand.addListener(function (cmd) {
		switch (cmd) {
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

	clearInterval(Idea.heartBeatInterval);
	heartBeat();
	Idea.heartBeatInterval = setInterval(function () {
		heartBeat();
	}, 700);

	Idea.bus.on("idea.agent.planted", function (evt) {
		Idea.tabId = evt.tabId;
	});


	Idea.bus.on("idea.cmd.player.toggle", function (evt) {
		if(!Idea.tabId) return;
		chrome.tabs.executeScript(Idea.tabId, { code: "agent.Toggle()" }, function () { })
	});
	Idea.bus.on("idea.cmd.player.next", function (evt) {
		if(!Idea.tabId) return;
		chrome.tabs.executeScript(Idea.tabId, { code: "agent.Next()" }, function () { })
	});
	Idea.bus.on("idea.cmd.player.previous", function (evt) {
		if(!Idea.tabId) return;
		chrome.tabs.executeScript(Idea.tabId, { code: "agent.Previous()" }, function () { })
	});
	Idea.bus.on("idea.cmd.player.shuffle", function (evt) {
		if(!Idea.tabId) return;
		chrome.tabs.executeScript(Idea.tabId, { code: "agent.Shuffle()" }, function () { })
	});
	Idea.bus.on("idea.cmd.player.repeat", function (evt) {
		if(!Idea.tabId) return;
		chrome.tabs.executeScript(Idea.tabId, { code: "agent.Repeat()" }, function () { })
	});

	Idea.bus.on("idea.track.changed", function (evt) {

		var options = {
			type: "basic",
			iconUrl: evt.art,
			title: evt.artist,
			message: evt.title,
			contextMessage: "(click to skip)               Made by IdeaSoftware",
			// buttons: [{ title: "next", iconUrl: "/images/next.png"}, { title: "next", iconUrl: "/images/next.png"}],
			isClickable: true
		}
		chrome.notifications.create(Idea.newGuid(), options, function (notificationId) {
			setTimeout(function () { chrome.notifications.clear(notificationId, function (wasCleared) { }) }, 5000);
		});
	})
	
	Idea.bus.on("idea.track.changed", function(evt){
				
		getLyrics(evt.artist, evt.title);
	});
	
	function getLyrics(artist, title)
	{
		
		window.fetch("http://lyrics.wikia.com/api.php?action=lyrics&artist="+artist+"&song="+title+"&fmt=json")
		.then(function(response){
			return response.text();
		})
		.then(function(data){
			var lyrics = eval(data)
			if(lyrics.lyrics.toLowerCase() == "not found"){
				chrome.storage.local.remove('lyrics');
				if(title.indexOf(" - ") > -1)
					getLyrics(artist, title.substring(0, title.indexOf(" - ")));
			}
			else
				chrome.storage.local.set({'lyrics': lyrics});
		}).catch(function(err){
			chrome.storage.local.remove('lyrics');
		})
	}

	chrome.notifications.onClicked.addListener(function (evt) {
		Idea.bus.send("idea.cmd.player.next");
	})
	
	function heartBeat() {
		
		
		if(!Idea.tabId) {
			plantAgent();
			return;
		};
		
		chrome.tabs.get(Idea.tabId, function (tab) {
			if (!tab) {
				Idea.tabId = undefined;
			}
		})

		if(!Idea.tabId) return;

		chrome.tabs.executeScript(Idea.tabId, { code: 'agent.GetTrackInfo()' }, function (data) {
			
			if(!data || !data[0]) return;
			
			var track = data[0];
			Idea.bus.send("idea.track.updated", track);

			if (Idea.cache.artist != track.artist || Idea.cache.title != track.title) {
				Idea.cache.artist = track.artist;
				Idea.cache.title = track.title;

				Idea.bus.send("idea.track.changed", track);
			}
		});
	}


	function plantAgent() {
		chrome.tabs.query({ url: "https://player.spotify.com/*" }, function (tabs) {
			if (tabs.length > 0) {
				chrome.tabs.executeScript(tabs[0].id, { file: "agent.js" }, function () {
					Idea.bus.send("idea.agent.planted", { tabId: tabs[0].id });
				});
			}
			else {
				chrome.tabs.query({ url: "https://play.spotify.com/*" }, function (tabs) {
					if (tabs.length > 0) {
						chrome.tabs.executeScript(tabs[0].id, { file: "agent.js" }, function () {
							Idea.bus.send("idea.agent.planted", { tabId: tabs[0].id });
						});
					}
					else
						Idea.bus.send("idea.agent.lost");
				});
			}
		});
	}
} ());