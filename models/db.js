const mongoose = require('mongoose');
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@gpcycles.fvmjs.mongodb.net/GPCycles?retryWrites=true&w=majority`;

const options = {
	useUnifiedTopology: true,
	useNewUrlParser: true
};
mongoose.set('useCreateIndex', true);

const database = {
	connect: async function() {
		try {
			await mongoose.connect(url, options);
			console.log('Connected to db');
		} catch (e) {
			throw e;
		}
	},
	
	insertOne: async function(model, doc) {
		try {
			let result = await model.create(doc);
			console.log('Added ' + result);
			return true;
		} catch (e) {
			return false;
		}
	},
	
	insertMany: async function(model, docs) {
		try {
			let result = await model.insertMany(docs);
			console.log('Added ' + result);
			return true;
		} catch (e) {
			return false;
		}
	},
	
	findOne: async function(model, query, projection) {
		try {
			let result = await model.findOne(query, projection);
			return result;
		} catch (e) {
			return false;
		}
	},
	
	findMany: async function(model, query, projection) {
		try {
			let result = await model.find(query, projection);
			return result;
		} catch (e) {
			return false;
		}
	},
	
	updateOne: async function(model, filter, update) {
		try {
			let result = await model.updateOne(filter, update);
			console.log('Document modified: ' + result.nModified);
			return true;
		} catch (e) {
			return false;
		}
	},
	
	updateMany: async function(model, filter, update) {
		try {
			let result = await model.updateMany(filter, update);
			console.log('Document modified: ' + result.nModified);
			return true;
		} catch (e) {
			return false;
		}
	},
	
	deleteOne: async function(model, conditions) {
		try {
			let result = await model.deleteOne(conditions);
			console.log('Document deleted: ' + result.deletedCount);
			return true;
		} catch (e) {
			return false;
		}
	},
	
	deleteMany: async function(model, conditions) {
		try {
			let result = await model.deleteMany(conditions);
			console.log('Document deleted: ' + result.deletedCount);
			return true;
		} catch (e) {
			return false;
		}
	},
	
	aggregate: async function(model, pipelines) {
		try {
			let result = await model.aggregate(pipelines);
			return result;
		} catch (e) {
			return false;
		}
	}
};

module.exports = database;
