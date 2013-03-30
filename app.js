
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
	User.findOne(id, function(err, user){
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
			var query = User.findOne({'fbId': profile.id });
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
					var newUser = new User();
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
  app.use(express.session({ secret: 'asdfkkdkdkdkdasddnng'}));
  app.use(passport.initialize());
  app.use(passport.session());  
  app.use(express.bodyParser());
  // app.use(express.methodOverride());
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

var User = mongoose.model('User', userSchema);
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

	// Make the request to the facebook graph api
	request(friendsUrl, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log('Received friends list for ' + user.name);
			next(JSON.parse(body).data);
		}
	});
}


//Return the list of friends for the current user.
app.get('/api/friends', ensureAuthenticated, function (req, res){
	var countCalls = 0;
	var fbFriends = getFriendsFromFacebook(req.user, function(fbFriends) {
		console.log('getting friends')
		fbFriends.forEach(function(friend) {
			// Change id to fbId
			friend.fbId = friend.id;
			delete friend.id
			// Default no user
			friend.user = false;
			// Count the number of findOnes used.
			countCalls++;
			// Lookup whether the friend is in the database
			User.findOne({fbId: friend.fbId}, function(err, user){

				if(!err) {
					// If the friend is found, flag user as true.
					if(user) {
						console.log('Friend found in database: ' + user.name);
						friend.user = true;
					}
				} else {
					console.log('Friend not found in database:' + user.name);
						if (friend.name === 'Chris Dotson') {
							console.log('Chris is a friend..')
							friend.upfo = true;
							friend.user = true;
						}
					// No Error Handling yet :)
				}
				
				if (friend.name === 'Chris Dotson') {
					console.log('Chris is a friend..')
					friend.upfo = true;
					friend.user = true;
				}
				// Call finished, set calls one less
				countCalls--;
				// If there are no calls left, send to server (isn't this actually sending to client?)
				if(countCalls < 1) {
					console.log("Sending to server"); //isn't this actually sending to client?
					res.send(JSON.stringify(fbFriends));
				}
			});
		});
	});

}); 

app.get('/api', api);

app.get('/account', ensureAuthenticated, function(req, res){
    
	//res.render('loggedin', { user: req.user });
	console.log(req.user);  
	res.send({ user: req.user });
 });

app.get('/api/users', function (req, res){
  return User.find(function (err, users) {
    if (!err) {
	  //console.log(req.session);
      return res.send(users);
    } else {
      return console.log(err);
    }
  });
});

app.put('/api/users/:fbid', function (req, res){
  console.log('Trying to save user with fbId: ' + req.params.fbid);
  User.findOne({ fbId: req.params.fbid }, function (err, user) {
  	if(!err) {
	    if (req.body.upfo) {
			user.upfo = req.body.upfo;
			user.save(function (err) {
		     if (!err) {
		     	res.send('ok');
		        console.log("updated");
		     } else {
		     	res.send('error');
		     	console.log('error');
		     }
	    	});
	  	} else {
	  		res.send('error');
	  		console.log("The person isn't up for anything");
	  	};
	  } else {
	  	console.log('Error getting user.');
	  	res.send('error');
	  }

});
});

app.delete('/api/users/:id', function (req, res){
  return User.findById(req.params.id, function (err, user) {
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

//SERVER

// Creating the actual server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

//FUNCTIONS
