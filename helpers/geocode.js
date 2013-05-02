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
