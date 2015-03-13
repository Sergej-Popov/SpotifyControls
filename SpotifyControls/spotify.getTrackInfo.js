[{ 
	artist: document.getElementById('app-player').contentWindow.document.querySelector('#track-artist a').text,
	name: document.getElementById('app-player').contentWindow.document.querySelector('#track-name a').text,
	art: document.getElementById('app-player').contentWindow.document.querySelector('#cover-art .sp-image-img').style.backgroundImage,
	progress: document.getElementById('app-player').contentWindow.document.querySelector('#bar-inner').style.width,
	track_current: document.getElementById('app-player').contentWindow.document.querySelector('#track-current').innerHTML,
	track_length: document.getElementById('app-player').contentWindow.document.querySelector('#track-length').innerHTML,
	shuffle_state: document.getElementById('app-player').contentWindow.document.querySelector('#shuffle').className,
	repeat_state: document.getElementById('app-player').contentWindow.document.querySelector('#repeat').className
 }]