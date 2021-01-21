const mongoose = require('mongoose');

var supplierSchema = new mongoose.Schema({
	supplierType: String,
	name: String,
	dateAdded: Date,
	email: String,
	contactPerson: String,
	contactNum: String,
	address: String
}, {collection: "Supplier"});

module.exports = mongoose.model("Supplier", supplierSchema);
