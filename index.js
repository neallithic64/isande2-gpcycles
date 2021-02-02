const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(__dirname + '/'));

const db = require('./models/db');
db.connect();

app.use(cookieParser());
app.use(session({
	secret: "s3cr3t4nds3cur3",
	name: "sessionId",
	resave: false,
	saveUninitialized: true
}));

app.set('views', path.join(__dirname, '/views/'));
app.engine('hbs', exphbs.create({
	extname: 'hbs',
	defaultLayout: 'main',
	runtimeOptions: {
		allowProtoPropertiesByDefault: true,
		allowProtoMethodsByDefault: true
	},
	partialsDir: 'views/partials',
	layoutsDir: 'views/layouts',
	helpers: {
		getArrIndex: function(arr, index) {
			return arr[index];
		},
		getSalesStatActs: function(status) {
			switch (status) {
				case 'CANCELLED':
				case 'SHIPPED': return 'disabledactions';
			}
		},
		getFormatDate: function(date) {
			return date.toString().substr(0, 10);
		},
		getFormatISODate: function(date) {
			return date.toISOString().substr(0, 10);
		},
		getProdLowCount: function(product) {
			return (product.reorderPoint > product.quantity) ? true : false;
		},
		getDiscountSO: function(item, qty) {
			return qty < item.product.discount.qty ? 0 : item.product.discount.percentage;
		},
		getOrderTotal: function(items, isSO) {
			if (isSO) return items
					.reduce((acc, elem) => acc + (elem.qty >= elem.product.discount.qty ? elem.qty * elem.unitPrice * (100 - elem.product.discount.percentage) : elem.qty * elem.unitPrice), 0)
					.toFixed(2)
					.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			else return items
					.reduce((acc, elem) => acc + elem.qty * elem.unitPrice * (100 - elem.discount), 0)
					.toFixed(2)
					.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		},
		adjustmentType: function(adj) {
			if (adj.length === 9 && adj.subsubstr(0,3) === "SO-") return "Sale";
			else if (adj.length === 9 && adj.subsubstr(0,3) === "PO-") return "Purchase";
			else return "Adjustment";
		},
		subtotalOrder: function(order, ord) {
			return order.items.reduce((acc, e) => acc + e.qty * e.unitPrice, 0);
		},
		discountOrder: function(order, ord) {
			if (ord === 0) return order.items.reduce((acc, e) => acc + e.unitPrice * e.qty * (e.discount/100), 0);
			if (ord === 1) return order.items.reduce((acc, e) => acc + (e.qty >= e.product.discount.qty ? e.qty * e.unitPrice * e.product.discount.percentage / 100 : 0), 0);
		},
		netotalOrder: function(order, ord) {
			if (ord === 0) return order.items.reduce((acc, e) => acc + (e.unitPrice * e.qty * (100 - e.discount) / 100), 0);
			if (ord === 1) return order.items.reduce((acc, e) => acc + e.qty * e.unitPrice, 0);
		},
		netPriceDisc: function(price, qty, discount) {
			return price * qty * (100 - discount) / 100;
		},
		begInv: function(product) {
			return product.adjustmentHistory.length > 0 ? product.adjustmentHistory[0].before : product.quantity;
		},
		sumPurch: function(product) {
			var sum=0;
			for(i=0; i<product.adjustmentHistory.length; i++) {
				if (product.adjustmentHistory[i].reference == null);
				else if ((product.adjustmentHistory[i].reference).substring(0,3)=="PO-")
					sum += product.adjustmentHistory[i].quantity;
			}
			return sum;
		},
		sumSales: function(product) {
			var sum=0;
			for(i=0; i<product.adjustmentHistory.length; i++) {
				if (product.adjustmentHistory[i].reference == null);
				else if ((product.adjustmentHistory[i].reference).substring(0,3)=="SO-")
					sum += product.adjustmentHistory[i].quantity;
			}
			return sum;
		},
		sumAdj: function(product) {
			var sum=0;
			for(i=0; i<product.adjustmentHistory.length; i++) {
				if (product.adjustmentHistory[i].reference == null);
				else if ((product.adjustmentHistory[i].reference)=='-')
					sum += product.adjustmentHistory[i].quantity;
			}
			return sum;
		},
		cogs: function(product) {
			beg = product.adjustmentHistory.length > 0 ? product.adjustmentHistory[0].before : product.quantity;
			var end = beg;
			var purch = 0;
			for(i=0; i<product.adjustmentHistory.length; i++) {
				if (product.adjustmentHistory[i].reference == null);
				else if (product.adjustmentHistory[i].reference == "-")
					end += product.adjustmentHistory[i].quantity;
				else if ((product.adjustmentHistory[i].reference).substring(0,3) == "SO-")
					end -= product.adjustmentHistory[i].quantity;
				else if ((product.adjustmentHistory[i].reference).substring(0,3) == "PO-") {
					end += product.adjustmentHistory[i].quantity;
					purch += product.adjustmentHistory[i].quantity;
				}
			}
			return (beg+purch-end)*product.purchasePrice;
		},
		invTurnover: function(product) {
			beg = product.adjustmentHistory.length > 0 ? product.adjustmentHistory[0].before : product.quantity;
			var end = beg;
			var purch = 0;
			for(i=0; i<product.adjustmentHistory.length; i++) {
				if (product.adjustmentHistory[i].reference == null);
				else if (product.adjustmentHistory[i].reference == "-")
					end += product.adjustmentHistory[i].quantity;
				else if ((product.adjustmentHistory[i].reference).substring(0,3) == "SO-")
					end -= product.adjustmentHistory[i].quantity;
				else if ((product.adjustmentHistory[i].reference).substring(0,3) == "PO-") {
					end += product.adjustmentHistory[i].quantity;
					purch += product.adjustmentHistory[i].quantity;
				}
			}
			return (beg+purch-end) * product.purchasePrice * 2 / (beg+end);
		}
	}
}).engine);
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const router = require('./router/gpRouter');
app.use('/', router);

app.listen(PORT, () => console.log(`Listening to localhost on port ${PORT}.`));
