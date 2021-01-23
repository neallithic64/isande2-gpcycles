const db = require('../models/db');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');
const SalesOrder = require('../models/SalesOrder');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');

const bcrypt = require('bcrypt');
const saltRounds = 10;

function forceJSON(e) {
	return JSON.parse(JSON.stringify(e));
}

/* Index Functions
 */
const gpController = {
	getHome: function(req, res) {
		res.render('VIEW NAME', {
			
		});
	},
	
	getLogin: function(req, res) {
		
	},
	
	
	
	postLogin: async function(req, res) {
		let {username, password} = req.body;
		try {
			let user = await db.findOne(User, {username: username});
			req.session.user = user;
			res.status(200).send();
		} catch (e) {
			res.status(500).send('Server error.');
		}
	},
	
	postRegister: async function(req, res) {
		let {username, password, usertype, name} = req.body;
		// submitting here to db
	}
};

module.exports = gpController;
