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
		getPrice: function(price) {
			return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		},
		getPURL: function(id) {
			return '/product/' + id;
		},
		getPriceTotal: function(cart) {
			return cart.reduce((total, item) => total + item.price * item.qty, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		},
		getOrdAccess: function(cart, index, attr) {
			switch (attr) {
				case 0: return cart[index].size;
				case 1: return cart[index].price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
				case 2: return (cart[index].qty * cart[index].price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			}
		},
		categToString: function(cats) {
			return cats.map(e => e.categName).join(', ');
		},
		isProofEmpty: function(proofPay) {
			return proofPay.length > 0 ? 'Yes' : 'No';
		},
		getSalesStatActs: function(status) {
			switch (status) {
				case 'CANCELLED':
				case 'SHIPPED': return 'disabledactions';
			}
		},
		getDateNow: function() {
			return new Date();
		},
		getFracRate: function(val, total) {
			return val&&total ? Math.round(val/total * 100) / 100 + '%' : '0%';
		},
		adjustmentType: function(adj) {
			if (adj.length == 9 && adj.subsubstr(0,3) == "SO-") return "Sale";
			else if (adj.length == 9 && adj.subsubstr(0,3) == "PO-") return "Purchase";
			else return Adjustment
		},
		netPriceDisc: function(price,qty,discount) {
			return price * qty * (100 - discount);
		},
		subtotalOrder: function(order, ord) {
			var subtotal = 0;
			if (ord == 1) {
				order.items.forEach(function(){
					subtotal += (order.items.product.sellingPrice * order.items.qty);
			})}
			if (ord == 0) {
				order.items.forEach(function(){
					subtotal += (order.items.product.purchasePrice * order.items.qty);
			})}
			return subtotal;
		},
		getDiscountSO: function(item, qty) {
			return qty < item.product.disount.qty ? 0 : item.product.disount.percentage;
		},
		discountOrder: function(order, ord) {
			var discount = 0;
			if (ord == 1) {
				order.items.forEach(function(){
					discount += (order.items.product.sellingPrice * order.items.qty * getDiscountSO(order.items, order.items.qty));
			})}
			if (ord == 0) {
				order.items.forEach(function(){
					discount += (order.items.product.purchasePrice * order.items.qty * order.items.discount);
			})}
			return discount;
		},
		netotalOrder: function(order, ord) {
			return subtotalOrder(order,ord) - discountOrder(order,ord);
		}
	}
}).engine);
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const router = require('./router/gpRouter');
app.use('/', router);

app.listen(PORT, () => console.log(`Listening to localhost on port ${PORT}.`));
