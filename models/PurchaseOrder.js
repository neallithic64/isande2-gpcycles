const mongoose = require('mongoose');

var purchOrdSchema = new mongoose.Schema({
	orderNum: String,
	items: [{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product"
		},
		qty: Number,
		unitPrice: Number,
		discount: Number
	}],
	penalty: Number,
	conditions: String,
	remarks: String,
	status: String,
	supplier: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Supplier"
	},
	dateOrdered: Date,
	paymentTerms: String,
	paymentDue:  Date,
	deliveryMode: String,
	expectedDelivery: Date
}, {collection: "PurchaseOrder"});

module.exports = mongoose.model("PurchaseOrder", purchOrdSchema);
