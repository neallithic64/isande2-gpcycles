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

async function genOrderCode(ordType) {
	if (ordType === "PO") {
		let ords = await db.findMany(PurchaseOrder, {});
		return "PO-" + ords.length.toString().padStart(6, '0');
	} else {
		let ords = await db.findMany(SalesOrder, {});
		return "SO-" + ords.length.toString().padStart(6, '0');
	}
}

async function autoDraftPO(itemCode) {
	try {
		let prod = await db.findOne(Product, {itemCode: itemCode});
		let nextWeek = twoWeeks = new Date();
		nextWeek.setDate(new Date().getDate() + 7);
		twoWeeks.setDate(new Date().getDate() + 14);
		if (prod.quantity < prod.reorderPoint) {
			let ordNum = await genOrderCode("PO");
			let newPO = {
				orderNum: ordNum,
				items: [{
					product: prod._id,
					qty: prod.reorderQty,
					unitPrice: prod.purchasePrice,
					discount: 0,
					netPrice: prod.reorderQty * prod.purchasePrice
				}],
				penalty: 0,
				conditions: "N/A",
				remarks: "Automatic PO",
				status: "Draft",
				supplier: db.toObjId(prod.supplier),
				dateOrdered: new Date(),
				paymentTerms: "Bank",
				paymentDue: nextWeek,
				expectedDelivery: twoWeeks
			};
			await db.insertOne(PurchaseOrder, newPO);
			// update incoming qty of product
			await db.updateOne(Product, {_id: prod._id}, {'$inc': {incomingQty: (prod.reorderQty)}});
		}
	} catch (e) {
		console.log(e);
	}
}

/* Index Functions
 */
const gpController = {
	getHome: async function(req, res) {
		if (req.session.user) {
			let products = await db.findMany(Product, {});
			if (req.session.user.usertype === "Admin" || req.session.user.usertype === "Secretary") {
				res.render('dashboard', {
					topNav: true,
					sideNav: true,
					title: 'Dashboard',
					name: req.session.user.name,
					isAdmin: req.session.user.usertype === "Admin",
					salesNav: req.session.user.usertype === "Sales",
					products: products
				});
			} else res.redirect('/newSO');
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
			let customers = await db.aggregate(Customer, [
				{"$lookup": {
					from: "SalesOrder",
					localField: "_id",
					foreignField: "customer",
					as: "SalesOrders"
				}}
			]), modCustomers = [], lastTrxDate, i, k, total, sortedSalesOrders;

			console.log(customers);

			customers.forEach(e => {
				total = 0.0;
				if (e.SalesOrders.length > 0) {
					sortedSalesOrders = e.SalesOrders.sort((a, b) => (new Date(b.dateOrdered)) - (new Date(a.dateOrdered)));
					lastTrxDate = (new Date(sortedSalesOrders[0].dateOrdered)).toISOString().substr(0, 10);

					for (i = 0; i < sortedSalesOrders.length; i++) {
						for (k = 0; k < sortedSalesOrders[i].items.length; k++) {
							total += Number.parseFloat(sortedSalesOrders[i].items[k].netPrice);
						}
					}
				}
				else {
					lastTrxDate = '';
					total = 0;
				}
				modCustomers.push({
					name: e.name,
					contactNum: e.contactNum,
					city: e.city,
					lastTrx: lastTrxDate,
					totalSales: total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
				});
			});
			res.render('allcustomers', {
				topNav: true,
				sideNav: true,
				title: 'All Customers',
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				customers: forceJSON(modCustomers)
			});
		}
	},
	
	getAllSuppliers: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			let suppliers = await db.aggregate(Supplier, [
				{"$lookup": {
					from: "PurchaseOrder",
					localField: "_id",
					foreignField: "supplier",
					as: "PurchOrders"
				}}
			]), modSuppliers = [], lastTrxDate, i, k, total, sortedPurchOrders;

			console.log(suppliers);

			suppliers.forEach(e => {
				total = 0;
				if (e.PurchOrders.length > 0) {
					sortedPurchOrders = e.PurchOrders.sort((a, b) => (new Date(b.dateOrdered)) - (new Date(a.dateOrdered)));
					lastTrxDate = (new Date(sortedPurchOrders[0].dateOrdered)).toISOString().substr(0, 10);

					for (i = 0; i < sortedPurchOrders.length; i++) {
						for (k = 0; k < sortedPurchOrders[i].items.length; k++) {
							total += ((sortedPurchOrders[i].items[k].qty * sortedPurchOrders[i].items[k].unitPrice) * (1 - (sortedPurchOrders[i].items[k].discount / 100)));
						}
					}
				}
				else {
					lastTrxDate = '';
					total = 0;
				}
				modSuppliers.push({
					name: e.name,
					contactPerson: e.contactPerson,
					email: e.email,
					lastTrx: lastTrxDate,
					totalPurchase: total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
				});
			});
			res.render('allsuppliers', {
				topNav: true,
				sideNav: true,
				title: 'All Suppliers',
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				suppliers: forceJSON(modSuppliers)
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
			let salesorder = await SalesOrder.find({orderNum: req.params.ordNum}).populate("items.product customer");
			res.render('viewso', {
				topNav: true,
				sideNav: true,
				title: 'Sales Order',
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				isSales: req.session.user.usertype === "Sales",
				salesorder: salesorder[0]
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
			let purchaseorder = await PurchaseOrder.find({orderNum: req.params.ordNum}).populate("items.product supplier");
			console.log(purchaseorder[0]);
			res.render('viewpo', {
				topNav: true,
				sideNav: true,
				title: 'Purchase Order',
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				purchaseorder: purchaseorder[0]
			});
		}
	},
	
	getProductPage: async function(req, res) {
		try {
			if (!req.session.user) res.redirect('/login');
			else {
				let product = await Product.findOne({itemCode: req.params.code}).populate('supplier itemGroup');
				// additional joining from SO and PO collections
				// unsure about this:
				let sales = await db.findMany(SalesOrder, {items: {'product._id': product._id}});
				let purch = await db.findMany(PurchaseOrder, {items: {'product._id': product._id}});
				let adjustments = product.adjustmentHistory.sort( function(a,b) {
					return b.date - a.date;
				});
				res.render('viewproduct', {
					topNav: true,
					sideNav: true,
					title: 'Inventory',
					name: req.session.user.name,
					isAdmin: req.session.user.usertype === "Admin",
					salesNav: req.session.user.usertype === "Sales",
					product: forceJSON(product),
					adjustments: forceJSON(adjustments)
				});
			}
		} catch (e) {
			console.log(e);
			res.render('error', {
				title: "Error",
				code: 500,
				message: "Server error. Please try again later."
			});
		}
	},

	getEditProduct: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			let product = await Product.findOne({itemCode: req.params.code}).populate('supplier itemGroup');
			// additional joining from SO and PO collections
			// unsure about this:
			let sales = await db.findMany(SalesOrder, {items: {'product._id': product._id}});
			let purch = await db.findMany(PurchaseOrder, {items: {'product._id': product._id}});
			console.log(sales);
			console.log(purch);
			res.render('editproduct', {
				topNav: true,
				sideNav: true,
				title: 'Edit Product',
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				product: forceJSON(product)
			});
		}
	},

	getAdjustProduct: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			let product = await Product.findOne({itemCode: req.params.code}).populate('supplier itemGroup');
			// db.findOne(Product, {itemCode: req.params.code});
			// additional joining from SO and PO collections
			// unsure about this:
			let sales = await db.findMany(SalesOrder, {items: {'product._id': product._id}});
			let purch = await db.findMany(PurchaseOrder, {items: {'product._id': product._id}});
			console.log(sales);
			console.log(purch);
			res.render('adjustproduct', {
				topNav: true,
				sideNav: true,
				title: 'Adjust Product',
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
				salesNav: req.session.user.usertype === "Sales",
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
					LowQty: lowQty,
					IsLow: lowQty > 0
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

	getInventoryReport: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			let products = await Product.find({}).populate("itemGroup");
			res.render('inventoryreport', {
				topNav: true,
				sideNav: true,
				title: 'Inventory Report',
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				products: forceJSON(products)
			});
		}
	},

	getSalesReport: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			let products = await Product.find({}).populate("itemGroup");
			let sales = await db.findMany(SalesOrder, {});
			res.render('salesreport', {
				topNav: true,
				sideNav: true,
				title: 'Sales Report',
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				products: forceJSON(products),
				sales : forceJSON(sales)
			});
		}
	},
	
	getAddUser: function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else if (req.session.user.usertype !== "Admin")
			res.render('error', {
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
				console.log(e);
				res.render('error', {
					title: "Error",
					code: 500,
					message: "Server error. Please try again later."
				});
			}
		}
	},
	
	getViewAllSOPO: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			let orders;
			orders = req.query.ordertype === "SO"
					? await SalesOrder.find({}).populate('items.product customer')
					: await PurchaseOrder.find({}).populate('items.product supplier');
			orders.sort((a, b) => Date.parse(b.dateOrdered) - Date.parse(a.dateOrdered));
			res.render('viewallsopo', {
				topNav: true,
				sideNav: true,
				title: 'View All ' + req.query.ordertype,
				name: req.session.user.name,
				isAdmin: req.session.user.usertype === "Admin",
				isSO: req.query.ordertype === "SO",
				orders: forceJSON(orders)
			});
		}
	},
	
	getNewPO: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			try {
				let suppliers = await db.findMany(Supplier, {}, 'name');
				let POnum = (await db.findMany(PurchaseOrder, {})).length;
				res.render('newpo', {
					topNav: true,
					sideNav: true,
					title: 'New PO',
					name: req.session.user.name,
					isAdmin: req.session.user.usertype === "Admin",
					suppliers: suppliers,
					POnum: POnum.toString().padStart(6, '0')
				});
			} catch (e) {
				console.log(e);
				res.render('error');
			}
		}
	},
	
	getNewSO: async function(req, res) {
		if (!req.session.user) res.redirect('/login');
		else {
			try {
				let customers = await db.findMany(Customer, {}, 'name');
				let products = await db.findMany(Product, {}, 'prodName');
				let SOnum = (await db.findMany(SalesOrder, {})).length;
				res.render('newso', {
					topNav: true,
					sideNav: true,
					title: 'New SO',
					name: req.session.user.name,
					isAdmin: req.session.user.usertype === "Admin",
					isSecretary: req.session.user.usertype === "Secretary",
					isSales: req.session.user.usertype === "Sales",
					salesNav: req.session.user.usertype === "Sales",
					customers: customers,
					products: products,
					SOnum: SOnum.toString().padStart(6, '0')
				});
			} catch (e) {
				console.log(e);
				res.render('error');
			}
		}
	},

	getItemAJAX: async function(req, res) {
		try {
			let item = await db.findOne(Product, {_id: req.query.code});
			res.status(200).send(forceJSON(item));
		} catch (e) {
			res.status(500).send(e);
		}
	},
	
	getSupplOrds: async function(req, res) {
		try {
			let items = await db.findMany(Product, {supplier: req.query.supplier}, 'prodName');
			res.status(200).send(forceJSON(items));
		} catch (e) {
			res.status(500).send(e);
		}
	},

	getSalesOrderAJAX: async function(req, res) {
		try {
			let soPhysical = await db.findMany(SalesOrder, {paymentTerms: "Physical"});
			let soOnlineBank = await db.findMany(SalesOrder, {paymentTerms: "Bank"});
			let soOnlineCOD = await db.findMany(SalesOrder, {paymentTerms: "COD"});
			let soOrders = await db.findMany(SalesOrder, {});
			let soDates = await SalesOrder.distinct('dateOrdered');
			let poDates = await PurchaseOrder.distinct('dateOrdered');
			let poOrders = await db.findMany(PurchaseOrder, {});
			let item = {
				soPhysical: forceJSON(soPhysical),
				soOnlineBank: forceJSON(soOnlineBank),
				soOnlineCOD: forceJSON(soOnlineCOD),
				soOrders: forceJSON(soOrders),
				soDates: forceJSON(soDates).sort(),
				poDates: forceJSON(poDates).sort(),
				poOrders: forceJSON(poOrders)
			};
			res.status(200).send(item);
		} catch (e) {
			res.status(500).send(e);
		}
	},

	getDashboardCards: async function(req, res) {
		try {
			let soPhysical = (await db.findMany(SalesOrder, {paymentTerms: "Physical"})).length;
			let soOnlineBank = await db.findMany(SalesOrder, {paymentTerms: "Bank"});
			let soOnlineCOD = await db.findMany(SalesOrder, {paymentTerms: "COD"});
			let soOnline = soOnlineBank.length + soOnlineCOD.length;
			let soOrders = await db.findMany(SalesOrder, {});
			let poOrders = await db.findMany(PurchaseOrder, {});
			let item = {
				soPhysical: soPhysical,
				soOnline: soOnline,
				soOrders: forceJSON(soOrders),
				poOrders: forceJSON(poOrders)
			};
			res.status(200).send(item);
		} catch (e) {
			console.log(e);
			res.render('error');
		}
	},
	
	getConfirmPO: async function(req, res) {
		// DO NOT IMPLEMENT
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
		// DO NOT IMPLEMENT
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
	
	getPaySOPO: async function(req, res) {
		let orderNum = req.params.ordNum;
		let order = await (orderNum.substr(0, 2) === "SO" ? SalesOrder : PurchaseOrder)
				.findOne({orderNum: orderNum})
				.populate('items.product');
		res.render('paysopo', {
			topNav: true,
			sideNav: true,
			title: 'Receive ' + orderNum.substr(0, 2),
			name: req.session.user.name,
			isSO: orderNum.substr(0, 2) === "SO",
			isOverdue: Date.parse(order.paymentDue) <= Date.now(),
			order: forceJSON(order)
		});
	},
	
	getDelRecSOPO: async function(req, res) {
		try {
			let orderNum = req.params.ordNum, partial = (req.query.partial === 'true');
			let order = await (orderNum.substr(0, 2) === "SO" ? SalesOrder : PurchaseOrder)
					.findOne({orderNum: orderNum})
					.populate('items.product supplier customer');
			// console.log(order);
			res.render('drsopo', {
				topNav: true,
				sideNav: true,
				title: orderNum.substr(0, 2) === "SO" ? 'Deliver SO' : 'Receive PO',
				name: req.session.user.name,
				isSecretary: req.session.user.usertype === "Secretary",
				isPO: orderNum.substr(0, 2) === "PO",
				isPartial: partial,
				order: forceJSON(order)
			});
		} catch (e) {
			console.log(e);
		}
	},




/*
 ****************************************************************************************
 * GET above, POST below
 ****************************************************************************************
 */




	postLogin: async function(req, res) {
		let {username} = req.body;
		try {
			let user = await db.findOne(User, {username: username});
			await db.updateOne(User, {username: username}, {lastLogged: new Date()});
			req.session.user = user;
			res.status(200).send();
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
		// DO NOT IMPLEMENT
		let {itemgrp} = req.body;
		try {
			await db.insertOne(ItemGroup, {itemGroup: itemgrp});
			res.status(200).send();
		} catch (e) {
			res.status(500).send();
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
			res.status(200).send();
		} catch (e) {
			res.status(500).send();
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
			res.status(200).send();
		} catch (e) {
			res.status(500).send();
		}
	},
	
	postAddProduct: async function(req, res) {
		let { prodName, unit, itemGroup, supplier, purchasePrice, sellingPrice,
				description, quantity, reorderPoint, reorderQty, minDiscQty,
				percentage } = req.body;
		let product = {
			prodName: prodName,
			itemCode: await genItemCode(itemGroup),
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
			adjustmentHistory: [{
				reference: "-",
				before: quantity,
				remarks: "Starting quantity"
			}]
		};
		try {
			await db.insertOne(Product, product);
			res.status(200).send();
		} catch (e) {
			console.log(e);
			res.status(500).send(e);
		}
	},

	postEditProduct: async function(req, res) {
		let {inputPurchasePrice, inputSellingPrice,
			inputdesc, inputReorderPoint, inputReorderQty, inputMinDiscQty,
			inputDiscountPercent} = req.body;
		let editedProduct = {
			purchasePrice: inputPurchasePrice,
			sellingPrice: inputSellingPrice,
			description: inputdesc,
			discount: {
				qty: inputMinDiscQty,
				percentage: inputDiscountPercent
			},
			reorderPoint: inputReorderPoint,
			reorderQty: inputReorderQty
		};
		try {
			await db.updateOne(Product, {itemCode: req.params.code}, editedProduct);
			res.status(200).send();
		} catch (e) {
			res.status(500).send();
		}
	},

	postAdjustProduct: async function(req, res) {
		let {quantity, inputCurrentCount, inputRemarks} = req.body;
		let adjustedProduct = {
			'$push': {
				adjustmentHistory: {
					date: new Date(),
					before: quantity,
					reference: '-',
					quantity: Number.parseInt(inputCurrentCount) - Number.parseInt(quantity),
					after: inputCurrentCount,
					remarks: inputRemarks
				}
			},
			quantity: inputCurrentCount
		};
		try {
			await db.updateOne(Product, {itemCode: req.params.code}, adjustedProduct);
			res.status(200).send();
		} catch (e) {
			console.log(e);
			res.status(500).send();
		}
	},
	
	postNewPO: async function(req, res) {
		try {
			let {items, conditions, remarks, status, supplier, dateOrdered, paymentTerms, paymentDue, expectedDelivery} = req.body;
			let ordNum = await genOrderCode("PO"), i;
			let newPO = {
				orderNum: ordNum,
				items: items,
				penalty: 0,
				conditions: conditions,
				remarks: remarks,
				status: status,
				supplier: db.toObjId(supplier),
				dateOrdered: new Date(dateOrdered),
				paymentTerms: paymentTerms,
				paymentDue: new Date(paymentDue),
				expectedDelivery: new Date(expectedDelivery)
			};
			console.log(newPO);
			await db.insertOne(PurchaseOrder, newPO);
			
			// update incoming qty of products
			for (i = 0; i < items.length; i++) {
				await db.updateOne(Product, {_id: items[i].product}, {'$inc': {incomingQty: Number.parseInt(items[i].qty)}});
			}
			res.status(200).send();
		} catch (e) {
			console.log(e);
			res.status(500).send();
		}
	},
	
	postNewSO: async function(req, res) {
		try {
			let {items, adjustment, remarks, status, customer, dateOrdered, paymentTerms, paymentDue, deliveryMode, expectedDelivery} = req.body;
			let ordNum = await genOrderCode("SO"), i;
			let newSO = {
				orderNum: ordNum,
				items: items,
				penalty: 0,
				adjustment: adjustment,
				remarks: remarks,
				status: status,
				customer: db.toObjId(customer),
				dateOrdered: new Date(dateOrdered),
				paymentTerms: paymentTerms,
				paymentDue: new Date(paymentDue),
				deliveryMode: deliveryMode,
				expectedDelivery: new Date(expectedDelivery)
			};
			await db.insertOne(SalesOrder, newSO);
			if (paymentTerms === "Physical") {
				// update adjhist of product
				for (i = 0; i < items.length; i++) {
					let prod = await db.findOne(Product, {_id: items[i].product});
					let adjustment = {
						date: new Date(),
						before: prod.quantity,
						reference: ordNum,
						quantity: items[i].qty,
						after: prod.quantity + (-Number.parseInt(items[i].qty)),
						remarks: "Physical sale adjustment from " + ordNum
					};
					await db.updateOne(Product, {_id: items[i].product},
							{'$push': {adjustmentHistory: adjustment}});
				}
			}
			res.status(200).send();
		} catch (e) {
			console.log(e);
			res.status(500).send();
		}
	},
	
	postCancelOrder: async function(req, res) {
		try {
			let {orderNum, reason} = req.body;
			await db.updateOne(orderNum.substr(0, 2) === "SO" ? SalesOrder : PurchaseOrder,
					{orderNum: orderNum},
					{status: "Cancelled", remarks: reason});
			res.status(200).send();
		} catch (e) {
			console.log(e);
			res.status(500).send();
		}
	},
	
	
	postConfOrder: async function(req, res) {
		try {
			let {orderNum} = req.body;
			await db.updateOne(PurchaseOrder, {orderNum: orderNum}, {status: "To Pay"});
			res.status(200).send();
		} catch (e) {
			console.log(e);
			res.status(500).send();
		}
	},
	
	
	postPayOrder: async function(req, res) {
		try {
			let {orderNum, penalty, remarks} = req.body;
			let i;
			console.log(orderNum);
			if (orderNum.substr(0, 2) === "PO") {
				let order = await db.findOne(PurchaseOrder, {orderNum: orderNum});
				await db.updateOne(PurchaseOrder,
						{orderNum: orderNum},
						{status: "To Receive", penalty: penalty, remarks: remarks});
				for (i = 0; i < order.items.length; i++) {
					await db.updateOne(Product, {_id: order.items[i].product},
							{'$inc': {incomingQty: order.items[i].qty}});
				}
				res.status(200).send();
			} else {
				let order = await db.findOne(SalesOrder, {orderNum: orderNum});
				await db.updateOne(SalesOrder, {orderNum: orderNum},
						{status: order.deliveryMode === "Delivery" ? "To Deliver" : "For Pickup",
								penalty: penalty, remarks: remarks});
				for (i = 0; i < order.items.length; i++) {
					await db.updateOne(Product, {_id: order.items[i].product},
							{'$inc': {outgoingQty: order.items[i].qty}});
				}
				res.status(200).send();
			}
		} catch (e) {
			console.log(e);
			res.status(500).send();
		}
	},
	
	postPickupOrder: async function(req, res) {
		try {
			let {orderNum} = req.body;
			let i;
			let order = await db.findOne(SalesOrder, {orderNum: orderNum});
			await db.updateOne(SalesOrder, {orderNum: orderNum}, {status: "Fulfilled"});
			for (i = 0; i < order.items.length; i++) {
				// need to get the original quantity
				let prod = await db.findOne(Product, {itemCode: order[i].itemCode});
				// push to the adjustment history
				let adjustment = {
					date: new Date(),
					before: prod.quantity,
					reference: orderNum,
					quantity: order[i].qty,
					after: prod.quantity - Number.parseInt(order[i].qty),
					remarks: "Order pickup from " + orderNum
				};
				let update = {quantity: -order.items[i].qty, outgoingQty: -Number.parseInt(order.items[i].qty)};
				await db.updateOne(Product, {itemCode: order.items[i].product.itemCode},
						{'$inc': update, '$push': {adjustmentHistory: adjustment}});
			}
			res.status(200).send();
		} catch (e) {
			console.log(e);
			res.status(500).send();
		}
	},
	
	postDelRecOrder: async function(req, res) {
		try {
			let {orderNum, partial, partialList} = req.body;
			let oType = orderNum.substr(0, 2) === "SO" ? "SO" : "PO", i, addsub = oType === "SO" ? -1 : 1;
			// update qty's
			if (partial === "true") {
				// update qty's from partialItems
				// partialItems is an array that contains objects
				// {itemCode, qty}
				for (i = 0; i < partialList.length; i++) {
					// need to get the original quantity
					let prod = await db.findOne(Product, {itemCode: partialList[i].prodCode});
					// push to the adjustment history
					let adjustment = {
						date: new Date(),
						before: prod.quantity,
						reference: orderNum,
						quantity: partialList[i].qty,
						after: prod.quantity + (addsub * Number.parseInt(partialList[i].qty)),
						remarks: "Partial adjustment from " + orderNum
					};
					let update = {quantity: addsub * partialList[i].qty};
					if (oType === "SO") update.outgoingQty = -Number.parseInt(partialList[i].qty);
					else update.incomingQty = -Number.parseInt(partialList[i].qty);
					await db.updateOne(Product, {itemCode: partialList[i].prodCode},
							{'$inc': update, '$push': {adjustmentHistory: adjustment}});
				}
			} else {
				// update qty's from SOPO
				let SOPO = await (oType === "SO" ? SalesOrder : PurchaseOrder).findOne({orderNum: orderNum}).populate('items.product');
				for (i = 0; i < SOPO.items.length; i++) {
					// need to get the original quantity
					let prod = await db.findOne(Product, {itemCode: SOPO.items[i].product.itemCode});
					// push to the adjustment history
					let adjustment = {
						date: new Date(),
						before: prod.quantity,
						reference: orderNum,
						quantity: SOPO.items[i].qty,
						after: prod.quantity + (addsub * Number.parseInt(SOPO.items[i].qty)),
						remarks: "Fulfillment adjustment from " + orderNum
					};
					let update = {quantity: addsub * SOPO.items[i].qty};
					if (oType === "SO") update.outgoingQty = -Number.parseInt(SOPO.items[i].qty);
					else update.incomingQty = -Number.parseInt(SOPO.items[i].qty);
					await db.updateOne(Product, {itemCode: SOPO.items[i].product.itemCode},
							{'$inc': update, '$push': {adjustmentHistory: adjustment}});
				}
			}
			// update status
			await db.updateOne(oType === "SO" ? SalesOrder : PurchaseOrder,
					{orderNum: orderNum},
					{status: oType === "SO" ? "Fulfilled" : "Received"});
			res.status(200).send();
		} catch (e) {
			console.log(e);
			res.status(500).send();
		}
	}
};

module.exports = gpController;
