import { Bus } from "./message-bus"
import { Lyric } from "./lyric";
import { Storage } from "./storage";
import { Track } from "./track";

let bus = new Bus();

setTimeout(function () {
	console.log("No need to hack around.. This app is open source: https://github.com/Sergej-Popov/SpotifyControls");
	console.log("Learned a thing or two? Buy me a beer: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=TRUHY87YGGRLY (PayPal donation)");
	console.log("And don't forget to rate! https://chrome.google.com/webstore/detail/spotify-web-app-playback/goikghbjckploljhlfmjjfggccmlnbea/reviews")
}, 2000);

bus.on("idea.track.updated", async (evt: Track) => {
	document.querySelector('#main').classList.remove('no-player');
	(document.querySelector('#track-progress') as HTMLElement).style.width = (document.querySelector('#track-bar').clientWidth * evt.progress) + "px";
	(document.querySelector('#volume-level') as HTMLElement).style.width = (document.querySelector('#volume-bar').clientWidth * evt.volume) + "px";
	document.querySelector('#track-elapsed').innerHTML = evt.elapsed;
	evt.shuffle_on ? document.querySelector('#shuffle').classList.add('active') : document.querySelector('#shuffle').classList.remove('active')
	evt.repeat_on ? document.querySelector('#repeat').classList.add('active') : document.querySelector('#repeat').classList.remove('active')
	if (evt.mute_on) {
		document.querySelector('#mute').classList.add('fa-volume-off');
		document.querySelector('#mute').classList.remove('fa-volume-up');
	}
	else {
		document.querySelector('#mute').classList.add('fa-volume-up');
		document.querySelector('#mute').classList.remove('fa-volume-off');
	}
	if (evt.is_playing) {
		document.querySelector('#toggle').classList.add('fa-pause-circle-o');
		document.querySelector('#toggle').classList.remove('fa-play-circle-o');
	}
	else {
		document.querySelector('#toggle').classList.add('fa-play-circle-o');
		document.querySelector('#toggle').classList.remove('fa-pause-circle-o');
	}
	if (evt.is_saved) {
		document.querySelector('#save').classList.add('fa-check');
		document.querySelector('#save').classList.remove('fa-plus');
	}
	else {
		document.querySelector('#save').classList.add('fa-plus');
		document.querySelector('#save').classList.remove('fa-check');
	}

	document.querySelector('#track-artist').innerHTML = evt.artist;
	document.querySelector('#track-title').innerHTML = evt.title;
	if (!!evt.art)
		document.querySelector('#track-art').setAttribute('src', evt.art);
	document.querySelector('#track-length').innerHTML = evt.length;

	let lyric = await Storage.Get<Lyric>("lyric");
	if (lyric) {
		document.querySelector('#lyrics-link').setAttribute('href', lyric.url);
		document.querySelector('#lyrics-text').innerHTML = lyric.lyrics;
		document.querySelector('#lyrics').classList.remove('hidden');
	}
	else {
		document.querySelector('#lyrics').classList.add('hidden');
	}
});

bus.on("idea.track.changed", function (evt: Track) {

	document.querySelector('#main').classList.remove('no-player');

	document.querySelector('#track-artist').innerHTML = evt.artist;
	document.querySelector('#track-title').innerHTML = evt.title;
	document.querySelector('#track-art').setAttribute('src', evt.art);
	document.querySelector('#lyrics').classList.add('hidden');

});


document.addEventListener('DOMContentLoaded', async () => {

	var controls = document.getElementsByClassName('control');

	if (await Storage.Get<Boolean>("rated")) (document.querySelector('#rate-outer') as HTMLElement).style.display = "none";

	if (await Storage.Get<Boolean>("donated")) (document.querySelector('#donation') as HTMLElement).style.display = "none";

	for (var i = 0; i < controls.length; i++) {
		controls[i].addEventListener('click', function (evt) {
			bus.send("idea.cmd.player." + evt.srcElement.id);
		});
	}

	// document.querySelector('#track-bar').addEventListener("click", (evt: MouseEvent) => {
	// 	var target = Math.round(evt.offsetX / 210 * 100) / 100;
	// 	console.log(target);
	// 	chrome.tabs.executeScript(Idea.tabId, { code: "agent.Rewind("+target+")" }, function () { })
	// });


	document.querySelector('#notification a').addEventListener("click", (evt: MouseEvent) => {
		chrome.tabs.create({ url: "http://play.spotify.com" });
		evt.preventDefault();
	});

	document.querySelector('#settings').addEventListener("click", (evt: MouseEvent) => {
		chrome.tabs.create({ url: "chrome://extensions/configureCommands" });
		evt.preventDefault();
	});

	document.querySelector('#contribute').addEventListener("click", (evt: MouseEvent) => {
		chrome.tabs.create({ url: "https://github.com/Sergej-Popov/SpotifyControls" });
		evt.preventDefault();
	});

	document.querySelector('#paypal').addEventListener("click", (evt: MouseEvent) => {
		chrome.tabs.create({ url: "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=TRUHY87YGGRLY" });
		Storage.Set("donated", true);
		evt.preventDefault();
	});

	document.querySelector('#rate').addEventListener("click", (evt: MouseEvent) => {
		chrome.tabs.create({ url: "https://chrome.google.com/webstore/detail/spotify-web-app-playback/goikghbjckploljhlfmjjfggccmlnbea/reviews" });
		Storage.Set("rated", true);
		evt.preventDefault();
	});
});
