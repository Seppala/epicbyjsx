var mongoose = require('mongoose');
var config = require('../config');

mongoose.connect(config.development.dbUrl);

var userSchema = new mongoose.Schema({
	fbId: String,
	name: String,
	friends_list: [Number],
	geo: {type: [Number], index: '2d'}
});

module.exports = mongoose.model('User', userSchema);