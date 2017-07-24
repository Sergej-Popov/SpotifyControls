import { newGuid } from "./utils";
import { Bus } from "./message-bus"
import { Track } from "./track";


let bus = new Bus();
let heartBeatInterval = null;
let tabId: number = null;

let cache_artist: string = null;
let cache_title: string = null;

plantAgent();

chrome.commands.onCommand.addListener(function (cmd) {
	switch (cmd) {
		case "player-toggle":
			bus.send("idea.cmd.player.toggle");
			break;
		case "player-next":
			bus.send("idea.cmd.player.next");
			break;
		case "player-previous":
			bus.send("idea.cmd.player.previous");
			break;
		default:
			break;
	}
})

clearInterval(heartBeatInterval);
heartBeat();
heartBeatInterval = setInterval(function () {
	heartBeat();
}, 700);

bus.on("idea.agent.planted", function (evt: any) {
	tabId = evt.tabId;
});
bus.on("idea.agent.lost", function (evt: any) {
});


bus.on("idea.cmd.player.toggle", function (evt: any) {
	if (!tabId) return;
	chrome.tabs.executeScript(tabId, { code: "agent.Toggle()" }, function () { })
});
bus.on("idea.cmd.player.next", function (evt: any) {
	if (!tabId) return;
	chrome.tabs.executeScript(tabId, { code: "agent.Next()" }, function () { })
});
bus.on("idea.cmd.player.previous", function (evt: any) {
	if (!tabId) return;
	chrome.tabs.executeScript(tabId, { code: "agent.Previous()" }, function () { })
});
bus.on("idea.cmd.player.shuffle", function (evt: any) {
	if (!tabId) return;
	chrome.tabs.executeScript(tabId, { code: "agent.Shuffle()" }, function () { })
});
bus.on("idea.cmd.player.repeat", function (evt: any) {
	if (!tabId) return;
	chrome.tabs.executeScript(tabId, { code: "agent.Repeat()" }, function () { })
});

bus.on("idea.track.changed", function (evt: any) {

	var options = {
		type: "basic",
		iconUrl: evt.art,
		title: evt.artist,
		message: evt.title,
		contextMessage: "                                 (click to skip)",
		// buttons: [{ title: "next", iconUrl: "/images/next.png"}, { title: "next", iconUrl: "/images/next.png"}],
		isClickable: true
	}
	chrome.notifications.create(newGuid(), options, function (notificationId) {
		setTimeout(function () { chrome.notifications.clear(notificationId, function (wasCleared) { }) }, 5000);
	});
})

bus.on("idea.track.changed", function (evt: any) {

	getLyrics(evt.artist, evt.title);
});

function getLyrics(artist: string, title: string) {

	window.fetch("http://lyrics.wikia.com/api.php?action=lyrics&artist=" + artist + "&song=" + title + "&fmt=json")
		.then(function (response) {
			return response.text();
		})
		.then(function (data) {
			var lyrics = eval(data)
			if (lyrics.lyrics.toLowerCase() == "not found") {
				chrome.storage.local.remove('lyrics');
				if (title.indexOf(" - ") > -1)
					getLyrics(artist, title.substring(0, title.indexOf(" - ")));
			}
			else {
				var lines = lyrics.lyrics.split(/\r\n|\r|\n/).filter(function (line: any) { return line.replace(/\s/g, "") == "" ? false : true }).splice(0, 4);
				var lyr = "";
				for (var i in lines) {
					if (lyr.length > 120) break;
					lyr += ("\r\n" + lines[i].replace("[...]", ""));
				}
				lyrics.lyrics = lyr + "..";
				chrome.storage.local.set({ 'lyrics': lyrics });
			}
		}).catch(function (err) {
			chrome.storage.local.remove('lyrics');
		})
}

chrome.notifications.onClicked.addListener(function (evt: any) {
	bus.send("idea.cmd.player.next");
})

function heartBeat() {


	if (!tabId) {
		plantAgent();
		return;
	};

	chrome.tabs.get(tabId, function (tab) {
		if (!tab) {
			tabId = undefined;
		}
	})

	if (!tabId) return;

	chrome.tabs.executeScript(tabId, { code: 'agent.GetTrackInfo()' }, function (data) {

		if (!data || !data[0]) return;

		var track = data[0] as Track;
		bus.send("idea.track.updated", track);

		if (cache_artist != track.artist || cache_title != track.title) {
			cache_artist = track.artist;
			cache_title = track.title;

			bus.send("idea.track.changed", track);
		}
	});
}


function plantAgent() {
	chrome.tabs.query({ url: "https://player.spotify.com/*" }, function (tabs) {
		if (tabs.length > 0) {
			chrome.tabs.executeScript(tabs[0].id, { file: "agent.js" }, function () {
				bus.send("idea.agent.planted", { tabId: tabs[0].id });
			});
		}
		else {
			chrome.tabs.query({ url: "https://play.spotify.com/*" }, function (tabs) {
				if (tabs.length > 0) {
					chrome.tabs.executeScript(tabs[0].id, { file: "agent.js" }, function () {
						bus.send("idea.agent.planted", { tabId: tabs[0].id });
					});
				}
				else {
					chrome.tabs.query({ url: "https://open.spotify.com/*" }, function (tabs) {
						if (tabs.length > 0) {
							chrome.tabs.executeScript(tabs[0].id, { file: "agent.js" }, function () {
								bus.send("idea.agent.planted", { tabId: tabs[0].id });
							});
						}
						else
							bus.send("idea.agent.lost");
					});
				}
			});
		}
	});
}
