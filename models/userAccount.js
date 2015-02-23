/**
 * 
 */

var mongoose = require('mongoose');

var userAccountSchema = mongoose.Schema({
	ref						: {
		userId				: String
	},
	personal				: {
		profileImage		: String,
		profileImageName	: String,
		nickname			: String
	}
}); 

module.exports = mongoose.model('UserAccount', userAccountSchema);