const db = require('../models/db');
const Test = require('../models/Test');
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
	
	addItemGroups: async function(req, res) {
		try {
			let array = [];
			await db.insertMany(ItemGroup, array);
			res.send('yay inserted stuff');
		} catch (e) {
			res.send('oof');
		}
	}
};

module.exports = indexTest;
