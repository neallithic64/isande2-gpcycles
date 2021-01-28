const mongoose = require('mongoose');

const itemGroupSchema = new mongoose.Schema({
	itemGroup: String
}, {collection: "ItemGroup"});

module.exports = mongoose.model("ItemGroup", itemGroupSchema);
