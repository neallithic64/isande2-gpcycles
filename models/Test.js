const mongoose = require('mongoose');

var testSchema = new mongoose.Schema({
	mainVal: Date,
	otherVal: Number
}, {collection: "Test"});

//testSchema.index({
//	refID1: 1,
//	refID2: 1
//}, { unique: true });

module.exports = mongoose.model('Test', testSchema);
