var dbUrl = process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/test';

var appId;
var appSecret;
var fbUrl;
var FBURL = 'https://graph.facebook.com/';

if (process.env.NODE_ENV == 'production') 
	{
		appId = '513729218671638';
		appSecret = '7e5317d985ebb4a9222b21477ffaf9f3';
		fbUrl = 'http://piazzo.co/';
	}
else 
	{
		appId = "217545681715200";
		appSecret = "713d928ae56d98762a74ea61e096252d";
		fbUrl = 'http://localhost:5000/';
	}

console.log('appId: ' + appId + ' appSecret: ' + appSecret);

module.exports = {
	fb: {
		appId: appId,
		appSecret: appSecret,
		url: fbUrl 
	},
	dbUrl: dbUrl,
	FBURL: FBURL
}