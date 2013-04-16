
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.sendfile('views/index.html');
}

