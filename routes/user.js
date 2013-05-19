var ensureAuthenticated = require('./routehelpers').ensureAuthenticated;
var UserModel = require('../models/user').UserModel;
var config = require('../config');
var request = require('request');
var sort_by = require('../helpers/sort').sort_by;
var geocode = require('../helpers/geocode');
var upfoFalse = require('./upfo').upfoFalse;

module.exports = function(app) {

	app.get('/', ensureAuthenticated, function(req, res){
		res.sendfile('views/app.html');
	});
	
	//Return the list of friends for the current user.
	app.get('/api/friends', ensureAuthenticated, function (req, res){
		if (req.user.city) {
			userCity = req.user.city;
			console.log('req.user.body.city: ' + userCity);
		};
		
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
								// Specify data that should be transferred to the client
								// Only give upfo/message info, when user itself is upfo
								if(user.upfo) {
									//If the user shouldn't be set to false according to timer
									if (Date.now() < user.notUpfoTime) {
										friend.upfo = user.upfo;
										friend.message = user.message;
									}
									else {
										friend.upfo = false;
										friend.message = "";
									}
									friend.city = user.city;
								} else {
									friend.upfo = false;
									friend.message = "";
									friend.city = user.city;
								}									
								if(user.phoneNumber) {
									friend.phoneNumber = user.phoneNumber;
								}								
							} else {
								//console.log('Friend not found in database: ' + friend.name);
								friend.user = false;
								friend.message = "";
								//friend.city = friend.location.name;
							}
						} else {
							// No Error Handling yet :)
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

	app.get('/api/nonuserfriends', ensureAuthenticated, function (req, res){
		if (req.user.city) {
			userCity = req.user.city;
			console.log('req.user.body.city: ' + userCity);
		};
		
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
								// Specify data that should be transferred to the client
								// Only give upfo/message info, when user itself is upfo
								if(user.upfo) {
									//If the user shouldn't be set to false according to timer
									if (Date.now() < user.notUpfoTime) {
										friend.upfo = user.upfo;
										friend.message = user.message;
									}
									else {
										friend.upfo = false;
										friend.message = "";
									}
									friend.city = user.city;
								} else {
									friend.upfo = false;
									friend.message = "";
									friend.city = user.city;
								}									
								if(user.phoneNumber) {
									friend.phoneNumber = user.phoneNumber;
								}								
							} else {
								//console.log('Friend not found in database: ' + friend.name);
								friend.user = false;
								friend.message = "";
								//friend.city = friend.location.name;
							}
						} else {
							// No Error Handling yet :)
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

	
	//Put request that makes changes to the user
	app.put( '/api/users/:fbId', ensureAuthenticated, function( req, res ) {
		// It works now correctly, I think it uses the request cookie.
		// The think is that the fbId in the url is actually not needed at all.
	    console.log( 'Updating user with fbid:' + req.user.fbId);
		return UserModel.findOne({ fbId: req.user.fbId }, function( err, user ) {
	        // Was the user found on the server?
	        if(user) {
		
				// if the user was not upfo and is now being set to upfo, set notUpfoTime to one hour
				// ,user to upfo and upfoTime to now.
				if (user.upfo === false && req.body.upfo === true ) {
					user.notUpfoTime = Date.now() + upfoHour;
					console.log("notupfo time set to:" + user.notUpfoTime);
					user.upfo = true;
					user.upfoTime = Date.now();
				}
				// if the user was upfo and is now being set to not upfo, check that upfoTime is over
				// 10 minutes ago, if yes, switch to not upfo, otherwise, set notUpfoTime to 10 min
				// from upfoTime
				if (user.upfo === true && req.body.upfo === false) {
					var diff = Date.now() - user.upfoTime;
					if (diff > upfoTen - upfoTen/10) {
						user.upfo = false;
					}
					else {
						user.notUpfoTime = user.upfoTime + upfoTen;
					}
				}
				
				user.message = req.body.message;
				user.phoneNumber = req.body.phoneNumber;
				// Look whether a geocode lookup has to be done 
				geocode.sync(user, req.body, function(err, user) {
					user.save( function( err ) {
					    if( !err ) {
					        console.log( 'user updated' );
					    } else {
					        console.log( err );
					    }
					    res.send( user ); 
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
				console.log('is user');
				if (user.upfo === true) {
					console.log("user is upfo in database.. user is:" + user);
					if (user.notUpfoTime) {
						console.log('checking user upfo time');
						if (user.notUpfoTime < Date.now()) { 
							console.log("notupfotime was less than date now.");
							user.upfo = false;
							user.save();
							}
						}
					}
				console.log('after checking if user is upfo in/api/users/:fbid, user is ' + user);
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

