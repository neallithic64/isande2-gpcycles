const db = require('../models/db');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Customer = require('../models/Customer');
const SalesOrder = require('../models/SalesOrder');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const ItemGroup = require('../models/ItemGroup');

const bcrypt = require('bcrypt');
const saltRounds = 10;

function forceJSON(e) {
	return JSON.parse(JSON.stringify(e));
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
const gpController = {
	getHome: function(req, res) {
		if (req.session.user) {
			if (req.session.user.usertype === "Admin" || req.session.user.usertype === "Secretary") {
				res.render('dashboard', {
					topNav: true,
					sideNav: true,
					title: 'Dashboard',
					name: req.session.user.name,
					isAdmin: req.session.user.usertype === "Admin"
				});
			} else res.redirect('/addSO');
		} else res.redirect('/login');
	},
	
	getLogin: function(req, res) {
		if (req.session.user) res.redirect('/');
		else res.render('login', {
			title: 'Login'
		});
	},
	
	getAllCustomers: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			let customers = await db.findMany(Customer, {});
			res.render('allcustomers', {
				topNav: true,
				sideNav: true,
				title: 'All Customers',
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				customers: forceJSON(customers)
			});
		}
	},
	
	getAllSuppliers: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			let suppliers = await db.findMany(Supplier, {});
			res.render('allsuppliers', {
				topNav: true,
				sideNav: true,
				title: 'All Suppliers',
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				suppliers: forceJSON(suppliers)
			});
		}
	},
	
	getAllUsers: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			let users = await db.findMany(User, {}, 'username usertype name lastLogged');
			res.render('allusers', {
				topNav: true,
				sideNav: true,
				title: 'All Users',
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				users: forceJSON(users)
			});
		}
	},
	
	getAllSalesOrders: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			let sos = await db.findMany(SalesOrder, {});
			res.render('viewallsopo', {
				topNav: true,
				sideNav: true,
				isSO: true,
				title: 'All Sales Orders',
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				sos: forceJSON(sos)
			});
		}
	},
	
	getSalesOrder: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			let salesorder = await SalesOrder.find({}).populate("items");
			res.render('viewso', {
				topNav: true,
				sideNav: true,
				title: 'Sales Order',
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				salesorder: salesorder
			});
		}
	},

	getAllPurchOrders: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			let pos = await db.findMany(PurchaseOrder, {});
			res.render('viewallsopo', {
				topNav: true,
				sideNav: true,
				isSO: false,
				title: 'All Purch Orders',
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				pos: forceJSON(pos)
			});
		}
	},

	getPurchaseOrder: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			let purchaseorder = await PurchaseOrder.find({}).populate("items");
			res.render('viewpo', {
				topNav: true,
				sideNav: true,
				title: 'Purchase Order',
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				purchaseorder: purchaseorder
			});
		}
	},
	
	getProductPage: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			let product = await db.findOne(Product, {itemCode: req.params.code});
			// additional joining from SO and PO collections
			// unsure about this:
			let sales = await db.findMany(SalesOrder, {items: {'product._id': product._id}});
			let purch = await db.findMany(PurchaseOrder, {items: {'product._id': product._id}});
			console.log(sales);
			console.log(purch);
			res.render('viewproduct', {
				topNav: true,
				sideNav: true,
				title: 'Inventory',
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				product: forceJSON(product)
			});
		}
	},
	
	getInventory: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			let products = await Product.find({}).populate("itemGroup");
			res.render('allproducts', {
				topNav: true,
				sideNav: true,
				title: 'Inventory',
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				products: products
			});
		}
	},

	getGroups: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			let groups = await db.aggregate(ItemGroup, [
				{"$lookup": {
					from: "Product",
					localField: "_id",
					foreignField: "itemGroup",
					as: "Products"
				}}
			]), modGroups = [], lowQty, i;
			groups.forEach(e => {
				lowQty = 0;
				for (i = 0; i < e.Products.length; i++) {
					if (e.Products[i].quantity < e.Products[i].reorderPoint) lowQty++;
				}
				modGroups.push({
					Name: e.itemGroup,
					Index: e.index,
					Items: e.Products.length,
					Qty: e.Products.reduce((acc, e) => acc + e.quantity, 0),
					LowQty: lowQty
				});
			});
			res.render('allgroups', {
				topNav: true,
				sideNav: true,
				title: 'Inventory Groups',
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				groups: modGroups
			});
		}
	},

	getGroupInventory: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			let groupproducts = await Product.find({}).populate("itemGroup"),
				pass = groupproducts.filter(e => e.itemGroup.index === Number.parseInt(req.params.index)),
				groupName = await db.findOne(ItemGroup, {index: req.params.index});
			res.render('allgroupproducts', {
				topNav: true,
				sideNav: true,
				title: 'Group Inventory',
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				groupName: groupName.itemGroup,
				products: pass
			});
		}
	},
	
	getAddUser: function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else if (req.session.user !== "Admin") res.render('error', {
				title: 'Unauthorised Access',
				code: 403,
				message: 'Admins only'
			});
		else res.render('addaccount', {
			topNav: true,
			sideNav: true,
			title: 'Add Account',
			name: req.session.user.name,
			isAdmin: req.session.user.usertype === "Admin"
		});
	},
	
	
	getAddCustomer: function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else res.render('addcustomer', {
			topNav: true,
			sideNav: true,
			title: 'Add Customer',
			name: req.session.user.name,
			isAdmin: req.session.user.usertype === "Admin"
		});
	},
	
	getAddSupplier: function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else res.render('addsupplier', {
			topNav: true,
			sideNav: true,
			title: 'Add Supplier',
			name: req.session.user.name,
			isAdmin: req.session.user.usertype === "Admin"
		});
	},
	
	getAddProduct: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			try {
				let itemgroups = await db.findMany(ItemGroup, {});
				let suppliers = await db.findMany(Supplier, {});
				res.render('addproduct', {
					topNav: true,
					sideNav: true,
					title: 'Add Product',
					name: req.session.user.name,
					isAdmin: req.session.user.usertype === "Admin",
					itemgroups: forceJSON(itemgroups).sort(),
					suppliers: forceJSON(suppliers)
				});
			} catch (e) {
				res.send('error!');
			}

		}
	},

	getConfirmPO: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			try {
				res.render('confirmpo', {
					topNav: true,
					sideNav: true,
					title: 'Confirm PO',
					name: req.session.user.name,
					isAdmin: req.session.user.usertype === "Admin"
				});
			} catch (e) {
				res.send('error!');
			}

		}
	},

	getConfirmSO: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			try {
				res.render('confirmso', {
					topNav: true,
					sideNav: true,
					title: 'Confirm SO',
					name: req.session.user.name,
					isSecretary: req.session.user.usertype === "Secretary"
				});
			} catch (e) {
				res.send('error!');
			}

		}
	},
	
	
	
	
	
	postLogin: async function(req, res) {
		let {username} = req.body;
		try {
			let user = await db.findOne(User, {username: username});
			await db.updateOne(User, {username: username}, {lastLogged: new Date()});
			req.session.user = user;
			res.redirect('/');
		} catch (e) {
			res.status(500).send('Server error.');
		}
	},
	
	postLogout: function(req, res) {
		req.session.destroy();
		res.redirect('/login');
	},
	
	postAddUser: async function(req, res) {
		let {username, password, usertype, firstname, lastname} = req.body;
		try {
			let hash = await bcrypt.hash(password, saltRounds);
			let newUser = {
				username: username,
				password: hash,
				usertype: usertype,
				name: firstname + ' ' + lastname,
				lastLogged: new Date()
			};
			await db.insertOne(User, newUser);
			res.status(200).send();
		} catch (e) {
			res.status(500).send('Server error.');
		}
	},
	
	postAddItemGroup: async function(req, res) {
		let {itemgrp} = req.body;
		try {
			await db.insertOne(ItemGroup, {itemGroup: itemgrp});
			return res.status(200).send();
		} catch (e) {
			return res.status(500).send();
		}
	},
	
	
	postAddCustomer: async function(req, res) {
		let {firstname, lastname, email, contactNum, street, city, province} = req.body;
		let customer = {
			name: firstname + " " + lastname,
			email: email,
			contactNum: contactNum,
			street: street,
			city: city,
			province: province
		};
		try {
			await db.insertOne(Customer, customer);
			return res.status(200).send();
		} catch (e) {
			return res.status(500).send();
		}
	},
	
	postAddSupplier: async function(req, res) {
		let {name, email, contactPerson, contactNum, address} = req.body;
		let supplier = {
			name: name,
			dateAdded: new Date(),
			email: email,
			contactPerson: contactPerson,
			contactNum: contactNum,
			address: address
		};
		try {
			await db.insertOne(Supplier, supplier);
			return res.status(200).send();
		} catch (e) {
			return res.status(500).send();
		}
	},
	
	postAddProduct: async function(req, res) {
		let { prodName, unit, itemGroup, supplier, purchasePrice, sellingPrice,
				description, quantity, reorderPoint, reorderQty, minDiscQty,
				percentage } = req.body;
		let product = {
			prodName: prodName,
			itemCode: String,
			itemGroup: db.toObjId(itemGroup),
			unit: unit,
			supplier: db.toObjId(supplier),
			purchasePrice: purchasePrice,
			sellingPrice: sellingPrice,
			quantity: quantity,
			description: description,
			discount: {
				qty: minDiscQty,
				percentage: percentage
			},
			incomingQty: 0,
			outgoingQty: 0,
			reorderPoint: reorderPoint,
			reorderQty: reorderQty,
			adjustmentHistory: []
		};
		try {
			await db.insertOne(Product, product);
			return res.status(200).send();
		} catch (e) {
			return res.status(500).send();
		}
	}
};

module.exports = gpController;
