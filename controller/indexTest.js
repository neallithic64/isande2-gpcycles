const db = require('../models/db');
const Test = require('../models/Test');
const CancelReason = require('../models/CancelReason');
const Category = require('../models/Category');
const CustomerCart = require('../models/CustomerCart');
const CustomerOrder = require('../models/CustomerOrder');
const PaymentProof = require('../models/PaymentProof');
const PageView = require('../models/PageView');
const ProdCategory = require('../models/ProdCategory');
const ProdPhoto = require('../models/ProdPhoto');
const Product = require('../models/Product');
const SupplierCart = require('../models/SupplierCart');
const SupplierOrder = require('../models/SupplierOrder');
const Threshold = require('../models/Threshold');

const algo = require('./algoSet');

function forceJSON(e) {
	return JSON.parse(JSON.stringify(e));
}

function genDate() {
	return new Date((new Date()) - Math.round(Math.random()*1000000000));
}

function incDate(date) {
	var d = new Date(date);
	return d.setDate(d.getDate()+1);
}

/* Index Functions
 */
const indexTest = {
	getHome: function(req, res) {
		res.render('testpage', {
			layout: false,
			title: 'Test Test Test',
			picker: () => 'filters'
		});
	},
	
	getLookup: async function(req, res) {
		var arr = await db.aggregate(Test, [{'$match': {a: req.query.a}}, {'$lookup':
				{'from': 'Test', 'localField': 'a', 'foreignField': 'a', 'as': 'palibhasa'}}]);
		arr.forEach(e => console.table(e.palibhasa));		
		var a = await db.findMany(Test, {});
		a.forEach(e => console.log(e));
		res.redirect('/');
	},
	
	getHomeQuery: async function(req, res) {
		// querying
		var kek = {
			start: req.query.start,
			end: req.query.end,
			numstart: req.query.numstart,
			numend: req.query.numend
		};
		var queys = await db.findMany(Test, {mainVal: {$gte: kek.start, $lte: incDate(kek.end)}});
//		var queys = await db.findMany(Test, {otherVal: {$gte: kek.numstart, $lte: kek.numend}});
		console.table(forceJSON(queys));
		res.redirect('/');
	},
	
	postDoublePK: async function(req, res) {
		// insert the document
		var obj = {
			mainVal: req.body.a,
			refID1: '1',
			refID2: '2'
		};
//		var result = await db.insertOne(Test, obj);
//		console.log(result ? 'inserted' : 'failed');
		
		// make the query
//		var a = await db.findOne(Test, {refID1: '1', refID2: '2'});
//		
//		if (a) {
//			// ID generation system
//			var str = (a._id+"");
//			// making use of _id (ObjectId)
//			a.refID1 = str.substr(0, 12);
//			a.refID2 = str.substr(12);
//			
//			// save the update/s and redirect
//			await a.save();
//		}
		res.redirect('/');
	},
	
	postGenDocs: async function(req, res) {
		// generating docs
//		var docs = [];
//		for (var i = 0; i < 20; i++) docs.push({mainVal: genDate(), otherVal: Math.round(Math.random()*1000)});
//		await db.insertMany(Test, docs);
		
		res.redirect('/');
	},
	
	postDoubles: async function(req, res) {
//		let {a} = req.body;
//		await db.insertOne(Test, {mainVal: new Date(), otherVal: Number.parseFloat(a)});
		res.redirect('/test');
	},
	
	postMkFirstProds: async function(req, res) {
//		let arr = [
//			{productID: 'TOP00000', name: 'TOP', price: 0.0, size: 'SIZE', color: 'COLOUR'},
//			{productID: 'BOT00000', name: 'BOT', price: 0.0, size: 'SIZE', color: 'COLOUR'},
//			{productID: 'SET00000', name: 'SET', price: 0.0, size: 'SIZE', color: 'COLOUR'},
//			{productID: 'ACC00000', name: 'ACC', price: 0.0, size: 'SIZE', color: 'COLOUR'}
//		];
		await db.insertMany(Category, [
			{categName: 'Tops'},
			{categName: 'Bottoms'},
			{categName: 'Sets'},
			{categName: 'Accessories'}
		]);
		await db.insertMany(ProdCategory, [
			{productID: 'TOP00000', categName: 'Tops'},
			{productID: 'BOT00000', categName: 'Bottoms'},
			{productID: 'SET00000', categName: 'Sets'},
			{productID: 'ACC00000', categName: 'Accessories'}
		]);
		res.redirect('/test');
	}
};

module.exports = indexTest;
