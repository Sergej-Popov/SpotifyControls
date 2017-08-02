import { newGuid, delay } from "./utils";
import { Bus } from "./message-bus"
import { Track } from "./track";
import { Lyric } from "./lyric";
import { Storage } from "./storage";
import { asynchrome } from "./asynchrome";


let bus = new Bus();
let heartBeatInterval = null;
let tabId: number = null;

let cache_artist: string = null;
let cache_title: string = null;


(async () => { await plantAgent() })();

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
		case "player-mute":
			bus.send("idea.cmd.player.mute");
			break;
		case "player-shuffle":
			bus.send("idea.cmd.player.shuffle");
			break;
		case "player-repeat":
			bus.send("idea.cmd.player.repeat");
			break;
		default:
			break;
	}
})

clearInterval(heartBeatInterval);
(async () => { await heartBeat() })();

heartBeatInterval = setInterval(function () {
	(async () => { await heartBeat() })();
}, 700);

bus.on("idea.agent.planted", function (evt: any) {
	tabId = evt.tabId;
});


bus.on("idea.cmd.player.toggle", async (evt: any) => {
	if (!tabId) return;
	await asynchrome.tabs.executeScript(tabId, { code: "agent.Toggle()" });
});
bus.on("idea.cmd.player.next", async (evt: any) => {
	if (!tabId) return;
	await asynchrome.tabs.executeScript(tabId, { code: "agent.Next()" });
});
bus.on("idea.cmd.player.previous", async (evt: any) => {
	if (!tabId) return;
	await asynchrome.tabs.executeScript(tabId, { code: "agent.Previous()" });
});
bus.on("idea.cmd.player.shuffle", async (evt: any) => {
	if (!tabId) return;
	await asynchrome.tabs.executeScript(tabId, { code: "agent.Shuffle()" });
});
bus.on("idea.cmd.player.repeat", async (evt: any) => {
	if (!tabId) return;
	await asynchrome.tabs.executeScript(tabId, { code: "agent.Repeat()" });
});
bus.on("idea.cmd.player.mute", async (evt: any) => {
	if (!tabId) return;
	await asynchrome.tabs.executeScript(tabId, { code: "agent.Mute()" });
});

bus.on("idea.track.changed", async (evt: any) => {

	var options = {
		type: "basic",
		iconUrl: evt.art,
		title: evt.artist,
		message: evt.title,
		contextMessage: "                                 (click to skip)",
		// buttons: [{ title: "next", iconUrl: "/images/next.png"}, { title: "next", iconUrl: "/images/next.png"}],
		isClickable: true
	}

	var notificationId = await asynchrome.notifications.create(newGuid(), options);
	await delay(5000);
	await asynchrome.notifications.clear(notificationId);

})

bus.on("idea.track.changed", async (evt: any) => {

	await getLyrics(evt.artist, evt.title);
});

async function getLyrics(artist: string, title: string) {
	var response = await window.fetch("http://lyrics.wikia.com/api.php?action=lyrics&artist=" + artist + "&song=" + title + "&fmt=json");
	var data = await response.text();
	let song = eval(data);
	let lyric: Lyric = song;

	if (lyric.lyrics.toLowerCase() == "not found") {
		Storage.Remove("lyric");
		if (title.indexOf(" - ") > -1)
			await getLyrics(artist, title.substring(0, title.indexOf(" - ")));
	}
	else {
		var lines = lyric.lyrics
			.split(/\r\n|\r|\n/)
			.filter(function (line: any) { return line.replace(/\s/g, "") == "" ? false : true })
			.splice(0, 4);
			
		var lyr = "";
		for (var i in lines) {
			if (lyr.length > 120) break;
			lyr += ("\r\n" + lines[i].replace("[...]", ""));
		}
		lyric.lyrics = lyr + "..";

		Storage.Set<Lyric>("lyric", lyric);
	}
}

chrome.notifications.onClicked.addListener(function (evt: any) {
	bus.send("idea.cmd.player.next");
})

async function heartBeat() {
	if (!tabId) {
		await plantAgent();
		return;
	};

	let tab = await asynchrome.tabs.get(tabId);
	if (!tab) {
		await plantAgent();
		return;
	};

	let tracks = await asynchrome.tabs.executeScript(tabId, { code: 'agent.GetTrackInfo()' }) as Track[];

	if(!tracks || tracks.length < 1 || !tracks[0]) {
		await plantAgent();
		return;
	}

	let track = tracks[0];

	bus.send("idea.track.updated", track);

	if (cache_artist != track.artist || cache_title != track.title) {
		cache_artist = track.artist;
		cache_title = track.title;

		bus.send("idea.track.changed", track);
	}
}


async function plantAgent() {
	let tabs = await asynchrome.tabs.query({ url: "https://player.spotify.com/*" });

	if (tabs.length < 1) tabs = await asynchrome.tabs.query({ url: "https://play.spotify.com/*" });
	if (tabs.length < 1) tabs = await asynchrome.tabs.query({ url: "https://open.spotify.com/*" });
	if (tabs.length < 1) {
		bus.send("idea.agent.lost");
		return;
	}

	await asynchrome.tabs.executeScript(tabs[0].id, { file: "agent.js" });
	bus.send("idea.agent.planted", { tabId: tabs[0].id });
}
