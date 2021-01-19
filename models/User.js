const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	usertype: String,
	name: String
}, {collection: "User"});

module.exports = mongoose.model("User", userSchema);
