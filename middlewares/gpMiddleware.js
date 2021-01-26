/* Accessing the models (db) of each class
 */
const db = require('../models/db');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');
const SalesOrder = require('../models/SalesOrder');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');

const bcrypt = require('bcrypt');

const gpMiddleware = {
	validateAddUser: async function (req, res, next) {
		// We check if the user is already existing in the database
		try {
			let {username} = req.body;
			let userMatch = await db.findOne(User, {username: username});
			if (userMatch) res.status(400).send();
			else return next();
		} catch (e) {
			res.status(500).send(e);
		}
	},
	
	validateLogin: async function (req, res, next) {
		// We check if the user exists in the database and if their password matches
		try {
			let {username, password} = req.body;
			let userMatch = await db.findOne(User, {username: username});
			if (!userMatch) res.status(400).send();
			else {
				let compare = await bcrypt.compare(password, userMatch.password);
				if (compare) return next();
				else res.status(400).send();
			}
		} catch (e) {
			console.log(e);
			res.status(500).send(e);
		}
	},
	
	validateProductExist: async function(req, res, next) {
		let prod = await db.findOne(Product, {productID: req.params.id});
		if (prod) return next();
		else res.render('error', {
			
		});
	}
};

module.exports = gpMiddleware;
