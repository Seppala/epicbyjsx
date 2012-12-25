var dbUrl = process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/test';

module.exports = {
	development: {
		fb: {
			appId: "217545681715200",
			appSecret: "713d928ae56d98762a74ea61e096252d",
			url: "http://localhost:5000/" 
		},
		dbUrl: dbUrl
	}
}