
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express();

var config = require('./config');

var User = require('./models/user');

var passport = require('passport'),
  	FacebookStrategy = require('passport-facebook').Strategy;

// Setting up passport
passport.serializeUser(function(user, done){
	done(null, user.id)
});

passport.deserializeUser(function(id, done){
	User.findOne(id, function(err, user){
		done(err, user);
	});
});

passport.use(new FacebookStrategy({
	clientID: config.development.fb.appId,
	clientSecret: config.development.fb.appSecret,
	callbackURL: config.development.fb.url + 'fbauthed'
	},
	function(accessToken, refreshToken, profile, done) {
		process.nextTick( function(){
			var query = User.findOne({'fbId': profile.id });
			query.exec(function(err, oldUser){
				if (oldUser) {
					console.log('Existing User: ' + oldUser.name + 'found and logged in!');
					done(null, oldUser);
				} else {
					var newUser = new User();
					newUser.fbId = profile.id;
					newUser.name = profile.displayName;
					
					newUser.save(function(err){
						if (err) throw err;
						console.log('new user created: ' + newUser.name + ' and logged in...');
						done(null, newUser);
					});
				}
			});
		});
	}
));

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'asdfkkdkdkdkdasddnng'}));
  app.use(passport.initialize());
  app.use(passport.session());  
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/fbauth', passport.authenticate('facebook'));
app.get('/fbauthed', passport.authenticate('facebook', { failureRedirect: '/'}), routes.loggedin);
app.get('/logout', function(req, res){
	req.logOut();
	res.redirect('/');
});
// app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
