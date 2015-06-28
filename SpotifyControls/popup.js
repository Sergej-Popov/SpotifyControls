window.Idea = {
	updateInterval:undefined,
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


(function($, undefined){ 
	
	console.image("http://i.memecaptain.com/gend_images/iwQJDA.jpg");
	setTimeout(function(){
		console.log("Just kidding. This stuff is open source: https://github.com/Idea-Software/SpotifyControls");
		console.log("Learned a thing or two? Buy me a beer: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=TRUHY87YGGRLY (PayPal donation)");
		console.log("And don't forget to rate! https://chrome.google.com/webstore/detail/spotify-web-app-playback/goikghbjckploljhlfmjjfggccmlnbea/reviews")
	}, 2000)
	
	
	Idea.bus.on("idea.track.updated", function(evt){
		
		$('#notification').addClass('hidden');
		$('#track-art').removeClass('hidden');
		
		$('#track-progress').width($('#track-bar').width() * evt.progress);
		$('#track-current').html(evt.current);
		$('#shuffle').removeClass('active').addClass(evt.shuffle);
		$('#repeat').removeClass('active').addClass(evt.repeat);
		$('#track-artist').html(evt.artist);
		$('#track-name').html(evt.name);
		$('#track-art').attr('src', evt.img);
		$('#track-length').html(evt.length);
	});
	
	
	document.addEventListener('DOMContentLoaded', function() {
		
		var controls = document.getElementsByClassName('control');
		
		chrome.storage.local.get('rated', function(flag){
			if(flag.rated)
				$('#rate-outer').hide();
		});
		chrome.storage.local.get('donated', function(flag){
			if(flag.donated)
				$('#donations').hide();
		});
				
		for(var i = 0; i < controls.length; i++){
			controls[i].addEventListener('click', function(evt) {
				Idea.bus.send("idea.cmd.player." + evt.srcElement.id);
			});
		}
		
	});
	
	$(document).on('click', '#notification a', function(evt){
		chrome.tabs.create({ url: "http://play.spotify.com" });
		evt.preventDefault();
	});
	$(document).on('click', '#hotkeys-link', function(evt){
		chrome.tabs.create({ url: "chrome://extensions/configureCommands" });
		evt.preventDefault();
	});
	$(document).on('click', '#paypal', function(evt){
		chrome.tabs.create({ url: "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=TRUHY87YGGRLY" });
		chrome.storage.local.set({'donated': true});
		evt.preventDefault();
	});
	$(document).on('click', '#rate', function(evt){
		chrome.tabs.create({ url: "https://chrome.google.com/webstore/detail/spotify-web-app-playback/goikghbjckploljhlfmjjfggccmlnbea/reviews" });
		chrome.storage.local.set({'rated': true});
		evt.preventDefault();
	});
	

 }(jQuery));