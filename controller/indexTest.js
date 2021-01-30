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

async function genItemCode(itGroup) {
	// format: XX-YYYYYY
	// XX: item group code (use index, pad 2 digits)
	let itemGrp = await db.findOne(ItemGroup, {_id: itGroup});
	// YY: sequential number
	let prodCount = await db.findMany(Product, {itemGroup: itGroup});
	return itemGrp.index.toString().padStart(2, '0') + '-' + prodCount.length.toString().padStart(6, '0');
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
	
	checkProducts: async function(req, res) {
		let prods = await db.findMany(Product, {}), i, supplier;
		for (i = 0; i < 0; i++) {
			supplier = await db.aggregate(Supplier, [{'$sample': {size: 1}}]);
			await db.updateOne(Product, {_id: prods[i]._id}, {
				supplier: supplier[0]._id
			});
		}
		res.send('done');
	},
	
	populateCollection: async function(req, res) {
		try {
			let array = [], objGroup, i;
			for (i = 0; i < 0; i++) {
				array[i].discount = {
					qty: array[i].qty,
					percentage: array[i].percentage
				};
				delete array[i].qty;
				delete array[i].percentage;
				objGroup = await db.findOne(ItemGroup, {itemGroup: array[i].itemGroup});
				array[i].itemGroup = db.toObjId(objGroup._id);
			};
			await db.insertMany(Product, array);
			res.send('yay inserted stuff');
		} catch (e) {
			res.send(e);
		}
	}
};

module.exports = indexTest;
