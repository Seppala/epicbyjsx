// This helper is for the generation of firebase tokens
// and uses the npm install firebase-token-generator
// It's something that could be done by a worker, too
var FirebaseTokenGenerator = require("firebase-token-generator");
// The firebase secret has to be taken from the firebase options..
var firebaseSecret = "9t3FGyDIizHM9TttNSkVhZfutFqAWZcT3hy37FzY"; 
var tokenGenerator = new FirebaseTokenGenerator(firebaseSecret);
exports.getToken = function(fbId) {
	return tokenGenerator.createToken({fbId: fbId});
}