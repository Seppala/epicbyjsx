
var getLocation = function(next) {
	// Callback: next(error, lat, lng);
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