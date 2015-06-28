[{ 
	artist: document.getElementById('main').contentWindow.document.querySelector('#view-now-playing .artist a').text,
	name: document.getElementById('main').contentWindow.document.querySelector('#view-now-playing .track a').text,
	art: document.getElementById('main').contentWindow.document.querySelector('#view-now-playing .cover-image').style.backgroundImage,
	progress: 1 - parseFloat(document.getElementById('main').contentWindow.document.querySelector('#progressbar .progress-bar .inner').style.right.substring(0, 
				document.getElementById('main').contentWindow.document.querySelector('#progressbar .progress-bar .inner').style.right.length -1))/100,
	track_current: document.getElementById('main').contentWindow.document.querySelector('.player-controls-container #elapsed').innerHTML,
	track_length: document.getElementById('main').contentWindow.document.querySelector('.player-controls-container #remaining').innerHTML,
	shuffle_state: document.getElementById('main').contentWindow.document.querySelector('#extra-buttons #shuffle').className.indexOf("active") == -1 ? "" : "active",
	repeat_state: document.getElementById('main').contentWindow.document.querySelector('#extra-buttons #repeat').className.indexOf("active") == -1 ? "" : "active"
 }]