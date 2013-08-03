// This helper is for the generation of firebase tokens
// and uses the npm install firebase-token-generator
// It's something that could be done by a worker, too
var FirebaseTokenGenerator = require("firebase-token-generator");
// The firebase secret has to be taken from the firebase options..
var firebaseSecret = "9t3FGyDIizHM9TttNSkVhZfutFqAWZcT3hy37FzY"; 
var tokenGenerator = new FirebaseTokenGenerator(firebaseSecret);
exports.getToken = function(fbId, fbFriends) {
	// The fbfriendsStr is a workaround for firebase
	// It should be an array instead, but firebase does not
	// seem to have array methods for rule testing
	var fbFriendsStr = fbId;
	for(var key in fbFriends) {
		fbFriendsStr += "." + fbFriends[key].id;
	}
	return tokenGenerator.createToken({fbId: fbId, fbFriends: fbFriendsStr, role: "piazzouser"});
}

/*
Firebase rules
{
  "rules": {
    ".read": false,
    ".write": false,
    "$roomid": {
      ".read": "auth.fbFriends.contains($roomid)",
      ".write": "auth.fbFriends.contains($roomid)"
    }
  }
}
*/