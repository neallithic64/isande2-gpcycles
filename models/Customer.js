const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
	name: String,
	email: String,
	contactNum: String,
	street: String,
	city: String,
	province: String
}, {collection: "Customer"});

module.exports = mongoose.model("Customer", customerSchema);
