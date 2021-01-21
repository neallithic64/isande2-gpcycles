const db = require('../models/db');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');
const SalesOrder = require('../models/SalesOrder');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');

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
		
	}
};

module.exports = gpController;
