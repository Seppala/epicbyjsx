var dbUrl = process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/test';

var appId;
var appSecret;
var fbUrl;

if (typeof(NODE_ENV) !== 'undefined') 
	{
		appId = '513729218671638';
		appSecret = '7e5317d985ebb4a9222b21477ffaf9f3';
		fbUrl = 'http://agile-plateau-5423.herokuapp.com/';
	}
else 
	{
		appId = "217545681715200";
		appSecret = "713d928ae56d98762a74ea61e096252d";
		fbUrl = 'http://localhost:5000/';
	}

module.exports = {
	development: {
		fb: {
			appId: appId,
			appSecret: appSecret,
			url: fbUrl 
		},
		dbUrl: dbUrl
	}
}