var mapquest = require('mapquest');

var getLatLng = function(city, next) {
	// Takes a userModel and a city, it only saves the city if a lat/lng combination is found
	// If it is found it also saves the location
	mapquest.geocode(city, function(err, location) {
		if (!err) {
			if (typeof location === 'object' && 'lat' in location.latLng) {
				next(null,[location.latLng.lat, location.latLng.lng]); // Form {lat:,lng:} 
			} else {
				next({message: "City not found"});
			}
		} else {
			next(err); 
		}
	});
};

exports.getLatLng = getLatLng;

var getCity = function(location, next) { // location = [lat, lng]
	if(location instanceof Array && location.length === 2) {
		// adminArea5 = city
		var coordinates = {
			latitude: location[0],
			longitude: location[1]
		}
		mapquest.reverse(coordinates, function(err, location) {
			if (!err) {
				var city = location.adminArea5 + ', ' + location.adminArea1
				next(null, city);
			} else {
				next(err);
			}
		})
	} else {
		next("Wrong type"); //Error
	}
}

exports.sync = function(userServer, userClient, next) {
	// This functions checks whether something needs to be done
	if (userClient.city && userServer.city !== userClient.city) {
		console.log('Searching latlng for city');
		getLatLng(userClient.city, function(err, location) {
			if(!err) {
				// update if location is found
				userServer.location = location;
				userServer.city = userClient.city;
			} 
			next(err, userServer);
		});
	} else if (userServer.location[0] !== userClient.location[0]) {
		console.log('Search City for latlng');
		getCity(userClient.location, function(err, city) {
			if (!err) {
				userServer.city = city;
				userServer.location = userClient.location;
			}
			next(err, userServer); // err will be falsy if okay
		});
	} else {
		console.log('No geocoding needed');
		next(null, userServer);
	}
}