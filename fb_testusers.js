var config = require('./config'),
request = require('request');

var FbTestUrl = 'https://graph.facebook.com/' + config.fb.appId +'/accounts/test-users?';

var token = config.fb.appId + '|' + config.fb.appSecret;

var createFbUsers = function() {
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

createFbUsers();
