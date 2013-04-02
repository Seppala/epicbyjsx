

/**
 * Module dependencies.
 */

var express = require('express')
  //, routes = require('./routes')
  , http = require('http')
  , path = require('path');
  //, api = require('./routes/api');
var request = require('request');

var app = express();

var config = require('./config');

var User = require('./models/user');

var mongoose = require('mongoose');
var FBURL = 'https://graph.facebook.com/'

//DB CONNECTION

mongoose.connect(config.dbUrl);

//PASSPORT STUFF

var passport = require('passport'),
  	FacebookStrategy = require('passport-facebook').Strategy;

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
					var newUser = new UserModel();
					newUser.fbId = profile.id;
					newUser.name = profile.displayName;
					newUser.fbaccessToken = accessToken;
					
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

// Configuration of the app

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //app.use
  //app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'asdfkkdkdkdkdasddnng' }));
  app.use(passport.initialize());
  app.use(passport.session());  
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// MODELS

var userSchema = new mongoose.Schema({
	fbId: String,
	name: String,
	friends_list: [Number],
	location: {type: [Number], index: '2d'},
	upfo: Boolean,
	message: String,
	fbaccessToken: String
});

var UserModel = mongoose.model('User', userSchema);
// export this model if done form another file: module.exports = mongoose.model('User', userSchema);

//ROUTES

var api = function (req, res) {
	var upfo = req.params.fbId;
	console.log(req);
	console.log(req.params);
	res.send({ upfo: 'upfo', success: "YesOrNo"});
}

//FUNCTIONS


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
var ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}

//URLs

//Authenication
app.get('/fbauth', passport.authenticate('facebook'));
app.get('/fbauthed', passport.authenticate('facebook', { successRedirect: '/app.html', failureRedirect: '/'}));
app.get('/logout', function(req, res){
	req.logOut();
	res.redirect('/');
});

//Facebook
var getFriendsFromFacebook = function(user, next) {
	// Build url for the facebook endpoint 
	var friendsUrl = FBURL;
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

//Return the list of friends for the current user.
app.get('/api/friends', ensureAuthenticated, function (req, res){
	console.log('Request to api/friends.');
	console.log('req.user = ' + req.user);
	var countCalls = 0;
	var fbFriends = getFriendsFromFacebook(req.user, function(fbFriends) {
		console.log('getting friends')
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
						console.log('Friend found in database: ' + friend.name);
						friend.user = true;
						// Specify data that should be transferred to the client
						friend.upfo = friend.upfo;
					} else {
						friend.user = false;
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

app.get('/account', ensureAuthenticated, function(req, res){
    var newUser = createFbUsers(req.user);
	//console.log('data' + data);
	//res.render('loggedin', { user: req.user });
	console.log(req.user + newUser);  
	res.send({ user: req.user, newUser: newUser });
 });

app.get('/api/users', function (req, res){
  return UserModel.find(function (err, users) {
    if (!err) {
	  //console.log(req.session);
      return res.send(users);
    } else {
      return console.log(err);
    }
  });
});

//OK, now this put request works.
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

app.delete('/api/users/:id', function (req, res){
  return UserModel.findById(req.params.id, function (err, user) {
    return user.remove(function (err) {
      if (!err) {
        console.log("removed");
        return res.send('');
      } else {
        console.log(err);
      }
    });
  });
});

app.post('/api/upfo', function (req, res){
  var user;
  console.log("POST: " + req);
  console.log(req.body); 
  return res.send(product);         
});
// app.get('/users', user.list);

//Create fake fbusers



var FbTestUrl = 'https://graph.facebook.com/' + config.fb.appId +'/accounts/test-users?'

/*
var url
https://graph.facebook.com/APP_ID/accounts/test-users?
  installed=true
  &name=FULL_NAME
  &locale=en_US
  &permissions=read_stream
  &method=post
  &access_token=APP_ACCESS_TOKEN
*/

var createFbUsers = function(user) {
	// Build url for the facebook endpoint 
	console.log('in createFbUsers');
	var url = FbTestUrl;
	FbTestUrl += 'installed=true'; // facebook user id
	FbTestUrl += '&name="Jeppe Jarvi"&method=post';
	FbTestUrl += '&access_token=' + config.fb.appSecret; 
	
	console.log('fbtesturl' + FbTestUrl);
	// Make the request to the facebook graph api
	request(FbTestUrl, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log('Response:' + response.data);
			return JSON.parse(body).data;
		}
		else {
			console.log(error + 'response' + response.statusCode);
		}
	});
}


//SERVER

// Creating the actual server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

//FUNCTIONS
