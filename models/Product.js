const mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
	prodName: String,
	itemCode: String,
	itemGroup: String,
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
	reorderPoint: Number
}, {collection: "Product"});

module.exports = mongoose.model('Product', productSchema);
