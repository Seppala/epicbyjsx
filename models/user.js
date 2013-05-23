var mongoose = require('mongoose');

// MODELS

var userSchema = new mongoose.Schema({
	fbId: String,
	name: String,
	friends_list: [Number],
	location: {type: [Number], index: '2d'}, // lat, lng
	upfo: Boolean,
	message: String,
	fbaccessToken: String,
	phoneNumber: String,
	upfoTime: Number,
	notUpfoTime: Number,
	city: String,
});

exports.UserModel = mongoose.model('User', userSchema);
// export this model if done form another file: module.exports = mongoose.model('User', userSchema);

var alert = new mongoose.Schema({
	msg: String,
});