var ensureAuthenticated = require('./routehelpers').ensureAuthenticated;
var UserModel = require('../models/user').UserModel;
var config = require('../config');
var request = require('request');

module.exports = function(app) {
	
	//Return the list of friends for the current user.
	app.get('/api/friends', ensureAuthenticated, function (req, res){
		console.log('Request to api/friends.');
		console.log('req.user = ' + req.user);
		var countCalls = 0;
		var fbFriends = getFriendsFromFacebook(req.user, function(err, fbFriends) {
			if(!err) {
				console.log('Received friends from facebook.')
				fbFriends.forEach(function(friend) {
					// Change id to fbId
					friend.fbId = friend.id;
					delete friend.id
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
									friend.upfo = user.upfo;
									friend.message = user.message;
								} else {
									friend.upfo = false;
									friend.message = "";
								}									
								if(user.phoneNumber) {
									friend.phoneNumber = user.phoneNumber;
								}								
							} else {
								//console.log('Friend not found in database: ' + friend.name);
								friend.user = false;
								friend.message = "";
							}
						} else {
							// No Error Handling yet :)
						}
						// Call finished, set calls one less
						countCalls--;
						// If there are no calls left, send to client
						if(countCalls < 1) {
							console.log("Sending to client.");
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
				//set users upfo status to what is given in the req
				user.upfo = req.body.upfo;
				user.message = req.body.message;
				user.phoneNumber = req.body.phoneNumber;
				//save user
				return user.save( function( err ) {
				    if( !err ) {
				        console.log( 'user updated' );
				    } else {
				        console.log( err );
				    }
				    return res.send( user );
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
			if(user) {
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
		friendsUrl += '?access_token=' + user.fbaccessToken; 

		console.log("Requesting facebook: " + friendsUrl);
		// Make the request to the facebook graph api
		request(friendsUrl, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log('Received friends list for ' + user.name);
				next(false, JSON.parse(body).data);
			} else {
				// Error with the facebook request
				next(true, null);
			}
		});
	}
}

