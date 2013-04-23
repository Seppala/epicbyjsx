var ensureAuthenticated = require('./routehelpers').ensureAuthenticated;
var UserModel = require('../models/user').UserModel;
var config = require('../config');
var request = require('request');

module.exports = function(app) {
	app.post('/api/timeupfo/', ensureAuthenticated, function(req, res) {
	
	//take the time given in the request and set upfo to false then.
	UserModel.findOne({fbId: req.user.fbId }, function(err, user) {
			if(user) {
				console.log('setting timer for ' + req.body.time );
				var timeUpfo = req.body.time;
				var timer = setTimeout(upfoFalse, timeUpfo, user);
				console.log('timer is: ' + timer);
				user.timeToFalse = timer;
				return user.save( function( err ) {
				    if( !err ) {
				        console.log( 'user updated in /timeupfo/' );
				    } else {
				        console.log( err );
				    }
				    return res.send( user );
				});
			}
		});	
		
	});
	
	//turns the user not upfo
	function upfoFalse(user) {
		user.upfo = false;
		return user.save( function( err ) {
		    if( !err ) {
		        console.log( 'user updated' );
		    } else {
		        console.log( err );
		    }
		    console.log('set to false from timer');
		});
	}
}


