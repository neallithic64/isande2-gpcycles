const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
	supplierType: String,
	name: String,
	dateAdded: Date,
	email: String,
	contactPerson: String,
	contactNum: String,
	address: String
}, {collection: "Supplier"});

module.exports = mongoose.model("Supplier", supplierSchema);
