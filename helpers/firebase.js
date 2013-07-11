// This helper is for the generation of firebase tokens
// and uses the npm install firebase-token-generator
// It's something that could be done by a worker, too
var FirebaseTokenGenerator = require("firebase-token-generator");
var tokenGenerator = new FirebaseTokenGenerator("J4]TdQHy%NTSGRq!3J9v*__super_secret_#1/LB32jidlL+uF)%qROPqJk@jm-");
exports.getToken = function(fbId) {
	return tokenGenerator.createToken({fbId: fbId});
}