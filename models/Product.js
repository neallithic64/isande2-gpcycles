const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	prodName: String,
	itemCode: String,
	itemGroup: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "ItemGroup"
	},
	unit: String,
	supplier: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Supplier"
	},
	purchasePrice: Number,
	sellingPrice: Number,
	quantity: Number,
	description: String,
	discount: {
		qty: Number,
		percentage: Number
	},
	incomingQty: Number,
	outgoingQty: Number,
	reorderPoint: Number,
	reorderQty: Number,
	adjustmentHistory: [{
		date: Date,
		reference: String,
		before: Number,
		quantity: Number,
		after: Number,
		remarks: String
	}]
}, {collection: "Product"});

module.exports = mongoose.model("Product", productSchema);
