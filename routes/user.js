var ensureAuthenticated = require('./routehelpers').ensureAuthenticated;
var UserModel = require('../models/user').UserModel;
var config = require('../config');
var request = require('request');
var sort_by = require('../helpers/sort').sort_by;
var geocode = require('../helpers/geocode');
var upfoFalse = require('./upfo').upfoFalse;
var expressValidator = require('express-validator');

module.exports = function(app) {

	app.get('/', ensureAuthenticated, function(req, res){
		res.sendfile('views/app.html');
	});
	
	app.get('/tos', function(req, res){
		res.sendfile('views/tos.html');
	});
	
	//Return the list of friends for the current user.
	app.get('/api/friends', ensureAuthenticated, function (req, res){
		
		//Get the users city
		if (req.user.city) {
			userCity = req.user.city;
			console.log('req.user.body.city: ' + userCity);
		};
		
		//set counter for amount of facebook friends
		var countCalls = 0;
		var fbFriends = getFriendsFromFacebook(req.user, function(err, fbFriends) {
			if(!err) {
				console.log('Received friends from facebook.')
				fbFriends.forEach(function(friend) {
					// Change id to fbId
					friend.fbId = friend.id;
					delete friend.id
					//Make city the city that was fetched (overridden later if it's a user)
					if (friend.location) {
						friend.city = friend.location.name;
					};
					//friend.city = friend.location.name;
					// Count the number of findOnes used.
					countCalls++;
					// Lookup whether the friend is in the database
					UserModel.findOne({fbId: friend.fbId}, function(err, user){

						if(!err) {
							// If the friend is found, flag user as true.
							if(user) {
								//console.log('Friend found in database: ' + friend.name);
								friend.user = true;
								friend.city = user.city
								friend.phoneNumber = user.phoneNumber;
								// Specify data that should be transferred to the client
								// Only give upfo/message info, when user itself is upfo
								if(Date.now() < user.notUpfoTime) {
									friend.upfo = true;
									friend.message = user.message;
								} else {
									friend.upfo = false;
									friend.message = "";
								}							
							} else {
								//console.log('Friend not found in database: ' + friend.name);
								friend.user = false;
								friend.message = "";
								//friend.city = friend.location.name;
							}
						} else {
							console.log("Error: Database error");
						}
						// Call finished, set calls one less
						countCalls--;
						// If there are no calls left, send to client
						if(countCalls < 1) {
							console.log("Sending to client.");
							//console.log("fbFriends is" + JSON.stringify(fbFriends));
							//Check if the city of the friend is same as the users.
							//fbFriends.sort(sort_by('city', false, function(a){return a.toUpperCase()}));
							
							// fbFriends.sort(function(a, b) { if(a.name > b.name) return 1; if(a.name < b.name) return -1; })
							
							fbFriends = fbFriends.sort(sort_by('name', true, function(a){
								if (a) {
									return a.toUpperCase()
								};
							}))
							
							res.send(JSON.stringify(fbFriends));
							
						}
					});
				}); 
			} else {
				res.send(500, "{error: 'Facebookproblem'}");
			}
		});

	});
	
	
	
	// NEW NONUSERFRIENDS
	//Return the list of friends for the current user, only sends back the ones with the same city...
	
	app.get('/api/nonuserfriends', ensureAuthenticated, function (req, res){
		
		//Get the users city
		if (req.user.city) {
			console.log('req.user.body.city: ' + userCity);
			var splitUser = req.user.city.split(',');
			var userCity = splitUser[0];
		};
		
		//set counter for amount of facebook friends
		var countCalls = 0;
		var sentFriends = [];
		var fbFriends = getFriendsFromFacebook(req.user, function(err, fbFriends) {
			if(!err) {
				console.log('Received friends from facebook.')
				fbFriends.forEach(function(friend) {
					// Change id to fbId
					friend.fbId = friend.id;
					delete friend.id
					//Make city the city that was fetched (overridden later if it's a user)
					if (friend.location) {
						friend.city = friend.location.name;
						var split = friend.city.split(',');
						var friendcityName = split[0];
					};
					//friend.city = friend.location.name;
					// Count the number of findOnes used.
					countCalls++;
					// Lookup whether the friend is in the database
					UserModel.findOne({fbId: friend.fbId}, function(err, user){

						if(!err) {
							// If the friend is found, flag user as true.
							if(user) {
								//console.log('Friend found in database: ' + friend.name);
								friend.user = true;
								friend.city = user.city
								friend.phoneNumber = user.phoneNumber;
								// Specify data that should be transferred to the client
								// Only give upfo/message info, when user itself is upfo
								if(Date.now() < user.notUpfoTime) {
									friend.upfo = true;
									friend.message = user.message;
								} else {
									friend.upfo = false;
									friend.message = "";
								}							
							} else {
								//console.log('Friend not found in database: ' + friend.name);
								friend.user = false;
								friend.message = "";
								//friend.city = friend.location.name;
							}
						
						if (friendcityName == userCity) {
							sentFriends.push(friend);
							
						}
							
						} else {
							console.log("Error: Database error");
						}
						// Call finished, set calls one less
						countCalls--;
						// If there are no calls left, send to client
						if(countCalls < 1) {
							console.log("Sending to client in nonuserfriends.");
							//console.log("fbFriends is" + JSON.stringify(fbFriends));
							//Check if the city of the friend is same as the users.
							//fbFriends.sort(sort_by('city', false, function(a){return a.toUpperCase()}));
							
							// fbFriends.sort(function(a, b) { if(a.name > b.name) return 1; if(a.name < b.name) return -1; })
							
						
							
							sortedFriends = sentFriends.sort(sort_by('name', true, function(a){
								if (a) {
									return a.toUpperCase()
								};
							}))
							
							res.send(JSON.stringify(sortedFriends));
							
						}
					});
				}); 
			} else {
				res.send(500, "{error: 'Facebookproblem'}");
			}
		});

	});

	//Put request that makes changes to the user
	app.put( '/api/users/:fbId', ensureAuthenticated, function( req, res ) {
		
		req.sanitize('message').xss();
		req.sanitize('message').escape();
		req.sanitize('city').xss();
		req.sanitize('city').escape();
		req.sanitize('phoneNumber').xss();
		req.sanitize('phoneNumber').escape();
		
		var errors = req.validationErrors();
		  if (errors) {
		    res.send('There have been validation errors.', 500);
		    return;
		  }
		
		// It works now correctly, I think it uses the request cookie.
		// The think is that the fbId in the url is actually not needed at all.
	    console.log( 'Updating user with fbid:' + req.user.fbId);
		console.log( 'This is the request user: ' + req.user);
		console.log('this is the request body: ' + JSON.stringify(req.body));
		return UserModel.findOne({ fbId: req.user.fbId }, function( err, user ) {
	        // Was the user found on the server?

	        if(user) {
		
				console.log("user found");
				var httpStatus = 200; // Now error yet;
				var error = {}; // Used to save the errors, if they occur
				// if the user was not upfo and is now being set to upfo, set notUpfoTime to one hour
				// ,user to upfo and upfoTime to now.
				if (Date.now() > user.notUpfoTime && req.body.upfo === true ) {
					console.log("Going upfo");
					user.upfoTime = Date.now();
					user.notUpfoTime = Date.now() + upfoHour;
				} else if (Date.now() < user.notUpfoTime && req.body.upfo === false) {
				// if the user was upfo and is now being set to not upfo
				// set to notupfo only when it is after the notupfo time
					console.log("Going not upfo.");
					user.notUpfoTime = parseInt(user.upfoTime) + upfoTen;
				}
				
				user.message = req.body.message;
				if(user.phoneNumber !== req.body.phoneNumber) {
					// The test for the phone number only tests wether it generelly looks like
					// a phone number, for more reliable testing something like https://code.google.com/p/libphonenumber/ 
					// would help. However this is good enough to ensure that the field is not misused.
					// Remove all whitespaces and hypens from the phone number
					req.body.phoneNumber = req.body.phoneNumber.replace(/[\s|\-]*/g, '');
					if(req.body.phoneNumber) {
						// Test the resulting number (quite lazy) and only save it
						// if it fits in the pattern.
						if(/^(\+)?\d{7,16}$/.test(req.body.phoneNumber)) {
							user.phoneNumber = req.body.phoneNumber;
						} else {
							httpStatus = 406; // "Not acceptable"
							error.phoneNumber = "Phone number is not valid.";
						}
					} else {
						// phone number was taken out
						user.phoneNumber = "";
					}

				}
				// Look whether a geocode lookup has to be done 
				geocode.sync(user, req.body, function(err, user) {
					if(err) {
						error.city = err;
				    	httpStatus = 406;
				    }
					user.save( function( err ) {
					    if( !err ) {
					        console.log( 'user updated' );
					    } else {
					        console.log( err );
					    }
					    // Send the upfo status to the client
					    user.upfo = Date.now() < user.notUpfoTime;

					    // If an error occurred only send back the error
					    if(httpStatus != 200) {
					    	res.send(httpStatus, error);
					    } else {
					    	res.send(200, user); 
					    }
					});
				});
	        } else {
	        	// No user found respond with some kind of error
	        	console.log("The user was not found.");
	        	res.send("{'error': 'no user found'}");
	        }
	    });
	});

	app.get('/api/users/:fbId', ensureAuthenticated, function(req, res) {
		console.log("Getting user " + req.user.fbId);
		UserModel.findOne({fbId: req.user.fbId }, function(err, user) {
			console.log('Got user');
			if(user) {
				if (typeof user.upfo === 'undefined') {
					user.upfo = false;
				}
				if (typeof user.upfoTime === 'undefined') {
					user.upfoTime = 0;
				}
				if (typeof user.notupfoTime === 'undefined') {
					user.notupfoTime = 0;
				}
				
				console.log('is user');
				user.upfo = Date.now() < user.notUpfoTime; // upfo as long as notUpfoTime is later than now
				console.log("GET: Upfo status is " + user.upfo);
				res.send( user); // Change: Don't send everything (sensitive stuff)
			} else {
				res.send ("{error: true}");
			}
		});
	});
	
	//Helper function to get friends from facebook
	var getFriendsFromFacebook = function(user, next) {
		// Build url for the facebook endpoint 
		var friendsUrl = config.FBURL;
		friendsUrl += user.fbId // facebook user id
		friendsUrl += '/friends';
		friendsUrl += '?fields=location,name';
		friendsUrl += '&access_token=' + user.fbaccessToken; 
		
		// Make the request to the facebook graph api
		request(friendsUrl, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log('Received friends list for ' + user.name);
				//console.log('friends: ' + body);
				next(false, JSON.parse(body).data);
			} else {
				// Error with the facebook request
				next(true, null);
			}
		});
	}
}

