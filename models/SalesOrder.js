const mongoose = require('mongoose');

const saleOrdSchema = new mongoose.Schema({
	orderNum: String,
	items: [{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product"
		},
		qty: Number,
		unitPrice: Number,
		netPrice: Number
	}],
	penalty: Number,
	conditions: String,
	adjustment: Number,
	remarks: String,
	status: String,
	customer: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Customer"
	},
	dateOrdered: Date,
	paymentTerms: String,
	paymentDue: Date,
	deliveryMode: String,
	expectedDelivery: Date
}, {collection: "SalesOrder"});

module.exports = mongoose.model("SalesOrder", saleOrdSchema);
