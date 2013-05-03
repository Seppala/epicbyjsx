var mapquest = require('mapquest');

exports.geocodeUserCity = function(userModel, next) {
	// Takes a userModel with a cityand geocodes the city to the database
	if(userModel.city) {
		mapquest.geocode(userModel.city, function(err, location) {
			if (!err) {
				userModel.location = [location.latLng.lat, location.latLng.lng]; // Form {lat:,lng:} 
				userModel.save(function(err) {
					if (err) {throw err};
					console.log('Set lng/lat');
					next(null, userModel.location);
				});
			};
			next(true); // Error..
		});
	} else {
		next({message: "No City."});
	}
};

exports.saveCityFromLatLng = function(userModel) {
	if(userModel.location && userModel.location.length === 2) {
		// adminArea5 = city
		var coordinates = {
			latitude: userModel.location[0],
			longitude: userModel.location[1]
		}
		mapquest.reverse(coordinates, function(err, location) {
			if (!err) {
				userModel.city = location.adminArea5 + ', ' + location.adminArea1;
				userModel.save(function(err) {
					console.log('City saved: ' + userModel.city);
				})
			};
		})
	}
}