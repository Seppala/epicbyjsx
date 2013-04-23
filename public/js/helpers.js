/* serverSettimer is given a time, that sets a timer on the server to turn upfo off. It's also passed a success function*/

function serverSettimer(time) {

	$.post("/api/timeupfo/", {'time' : time});

};

function serverDestroytimer() {
	$.post("/api/destroytimer/");
};

var getLocation = function() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			next(false, position.coords.latitude, position.coords.longitude);
		}, 
		function(error) {
			next(typeof msg == 'string' ? msg : "Error with geolocation.");
		});
	} else {
		next('Geolocation is not supported by the browser');
	}
}