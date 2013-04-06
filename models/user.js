var mongoose = require('mongoose');

// MODELS

var userSchema = new mongoose.Schema({
	fbId: String,
	name: String,
	friends_list: [Number],
	location: {type: [Number], index: '2d'},
	upfo: Boolean,
	message: String,
	fbaccessToken: String,
	phoneNumber: String
});

exports.UserModel = mongoose.model('User', userSchema);
// export this model if done form another file: module.exports = mongoose.model('User', userSchema);
