var config = require('../config'),
request = require('request');

var FbTestUrl = 'https://graph.facebook.com/' + config.fb.appId +'/accounts/test-users?';

var token = config.fb.appId + '|' + config.fb.appSecret;

exports.createFbUsers = function() {
	// Build url for the facebook endpoint 
	console.log('in createFbUsers');
	var url = FbTestUrl;
	FbTestUrl += 'installed=true'; // facebook user id
	FbTestUrl += '&name=JeppeJarvi&method=post';
	FbTestUrl += '&access_token=' + token; 
	
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

// just call by going: createFbUsers();

//Could be useful, you could create FBusers in the same way?

app.get('/api-test/friends', function(req, res){
	res.send({name: "Juha", location: "Sydney", upfo: true, user: false},
	{name: "Jonne", location: "Stockholm", upfo: false, user: false},
	{name: "Jarkko", location: "Turku", upfo: false, user: true},
	{name: "Jesse", location: "London", upfo: true, user: false},
	{name: "Janina", location: "Tallinn", upfo: true, user: true})
});
