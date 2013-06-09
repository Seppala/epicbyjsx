
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) 
	{ return next(); 
	}
  else {
	console.log('ensureAuthenticated failed');
	} 
  res.sendfile('views/index.html');
}

