var passport = require('passport'), FacebookStrategy = require('passport-facebook').Strategy;
var config = require('../config');
var UserModel = require('../models/user').UserModel;
var geocode = require('../helpers/geocode');
//Authentication
module.exports = function(app) {
	app.get('/fbauth', passport.authenticate('facebook', { scope: ['user_location','friends_location']}));
	app.get('/fbauthed', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/'}));
	app.get('/logout', function(req, res){
		req.logOut();
		res.redirect('/');
		});
}

// Passport serialization and deserialization

passport.serializeUser(function(user, done){
	done(null, user.id)
});

passport.deserializeUser(function(id, done){
	console.log("Deserialize: " + id);
	UserModel.findById(id, function(err, user){
		done(err, user);
	});
});

//Setting up passport

passport.use(new FacebookStrategy({
	clientID: config.fb.appId,
	clientSecret: config.fb.appSecret,
	callbackURL: config.fb.url + 'fbauthed'
	},
	function(accessToken, refreshToken, profile, done) {
		process.nextTick( function(){
			// Look up in database whether user already exists
			// If not, create the new user and save him to the database
			var query = UserModel.findOne({'fbId': profile.id });
			query.exec(function(err, oldUser){
				if (oldUser) {
					console.log('Existing User: ' + oldUser.name + ' (fbid:' + oldUser.fbId +')found and logged in!');
					// This is maybe not needing, but for testing it prevents me from
					// cleaning the database everytime
					// Checks weather the access token from facebook (for the api)
					// is still the same like in the database
					if(oldUser.fbaccessToken !== accessToken) {
						oldUser.fbaccessToken = accessToken;
						oldUser.save(function(err) {
							if (err) throw err;
							console.log('Refreshed Facebook access Token for ' + oldUser.name);
							done(null, oldUser);
						});
					} else {
						done(null, oldUser);				
					}

				} else {
					console.log("new user, profile:" + JSON.stringify(profile));
					var newUser = new UserModel();
					newUser.fbId = profile.id;
					newUser.name = profile.displayName;
					newUser.fbaccessToken = accessToken;
					newUser.phoneNumber = "";
					newUser.upfo = false;
					newUser.upfoTime = 0;
					newUser.notUpfoTime = 0;

					// Right now the login does not wait for the geocoding
					// This way the first response would be faster
					// If needed it could be rearranged putting the done function in here
					// require('mapquest').geocode(newUser.city, function(err, location) {
					// 	if (!err) {
					// 		newUser.location = [location.latLng.lat, location.latLng.lng]; // Form {lat:,lng:} 
					// 	};
					// 	newUser.save(function(err) {
					// 		if (err) {throw err};
					// 		console.log('Set lng/lat');
					// 	})
					// })
						console.log("there is profile._json!");
					if (profile.hasOwnProperty('location.name')) {
						geocode.getLatLng(profile._json.location.name, function(err, location) {
							if (!err) {
								newUser.city = profile.location.name; // Only saving the city from facebook if geocodable
								newUser.location = location;
							};
						});
					};
					newUser.save(function(err){
							if (err) throw err;
							console.log('New user created: ' + newUser.name + ' and logged in...');
							done(null, newUser);
						});

					
				}
			});
		});
	}
));
