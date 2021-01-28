const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	username: String,
	password: String,
	usertype: String,
	name: String,
	lastLogged: Date
}, {collection: "User"});

module.exports = mongoose.model("User", userSchema);
