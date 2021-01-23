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
	incomingQty: Number,
	outgoingQty: Number,
	reorderPoint: Number,
	adjustmentHistory: [{
		date: Date,
		before: Number,
		quantity: Number,
		after: Number,
		remarks: String
	}]
}, {collection: "Product"});

module.exports = mongoose.model("Product", productSchema);
