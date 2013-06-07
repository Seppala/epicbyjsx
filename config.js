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
		upfoTen = 600000;
		upfoHour = 3600000;
	}
else if (process.env.NODE_ENV == 'productioneu')
	{
		appID = '607217585963588';
		appSecret = 'cbbc35fe7ba759e270c45118e8799d3a';
		fbURL = 'http://piazzoeu.herokuapp.com';
		upfoTen = 600000;
		upfoHour = 3600000;
	}
else if (typeof process.env.NODE_ENV == 'undefined')
	{
		appId = "217545681715200";
		appSecret = "713d928ae56d98762a74ea61e096252d";
		fbUrl = 'http://localhost:5000/';
		upfoTen = 10000;
		upfoHour = 60000;
		
	}

console.log('process.env: ' + process.env.NODE_ENV);
console.log('appId: ' + appId + ' appSecret: ' + appSecret);

module.exports = {
	fb: {
		appId: appId,
		appSecret: appSecret,
		url: fbUrl 
	},
	dbUrl: dbUrl,
	FBURL: FBURL,
	upfoTen: upfoTen,
	upfoHour: upfoHour
}