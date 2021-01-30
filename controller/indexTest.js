const db = require('../models/db');
const Test = require('../models/Test');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');
const SalesOrder = require('../models/SalesOrder');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const ItemGroup = require('../models/ItemGroup');

function forceJSON(e) {
	return JSON.parse(JSON.stringify(e));
}

function incDate(date) {
	let d = new Date(date);
	return d.setDate(d.getDate()+1);
}

/* Index Functions
 */
const indexTest = {
	getHome: function(req, res) {
		res.render('###testpage###', {
			layout: false,
			title: 'Test Test Test',
			picker: () => 'filters'
		});
	},
	
	getHomeQuery: async function(req, res) {
		let kek = {
			start: req.query.start,
			end: req.query.end,
			numstart: req.query.numstart,
			numend: req.query.numend
		};
		let queys = await db.findMany(Test, {mainVal: {$gte: kek.start, $lte: incDate(kek.end)}});
//		let queys = await db.findMany(Test, {otherVal: {$gte: kek.numstart, $lte: kek.numend}});
		console.table(forceJSON(queys));
		res.redirect('/');
	},
	
	postGenDocs: async function(req, res) {
		let docs = [];
		for (let i = 0; i < 20; i++) docs.push({mainVal: genDate(), otherVal: Math.round(Math.random()*1000)});
		await db.insertMany(Test, docs);
		res.redirect('/');
	},
	
	editItemGroups: async function(req, res) {
		let grps = await db.findMany(ItemGroup, {});
		forceJSON(grps);
//		grps.sort((a, b) => {
//			if (a.itemGroup < b.itemGroup) return -1;
//			if (a.itemGroup > b.itemGroup) return 1;
//			return 0;
//		});
//		let arr = [];
//		grps.forEach((e, i) => arr.push({itemGroup: e.itemGroup, index: i}));
//		await db.deleteMany(ItemGroup, {});
//		await db.insertMany(ItemGroup, arr);
		res.send('done');
	},
	
	populateCollection: async function(req, res) {
		try {
let array =
[]
;
			await db.insertMany(/* COLLECTION, */ array);
			res.send('yay inserted stuff');
		} catch (e) {
			res.send('oof');
		}
	}
};

module.exports = indexTest;
