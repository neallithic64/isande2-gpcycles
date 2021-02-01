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
			return date.toISOString().substr(0, 10);
		},
		getOrderTotal: function(items) {
			return items.reduce((acc, elem) => acc + elem.qty * elem.unitPrice * (100 - elem.discount), 0)
						.toFixed(2)
						.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		},
		adjustmentType: function(adj) {
			if (adj.length === 9 && adj.subsubstr(0,3) === "SO-") return "Sale";
			else if (adj.length === 9 && adj.subsubstr(0,3) === "PO-") return "Purchase";
			else return "Adjustment";
		},
		netPriceDisc: function(price, qty, discount) {
			return price * qty * (100 - discount);
		},
		subtotalOrder: function(order, ord) {
			var subtotal = 0;
			if (ord === 1) {
				order.forEach(function(e) {
					subtotal += e.items.product.sellingPrice * e.items.qty;
				});
			}
			if (ord === 0) {
				order.forEach(function(e1) {
					subtotal += e1.items.reduce((acc, e2) => acc + e2.unitPrice * e2.qty);
				});
			}
			return subtotal;
		},
		getDiscountSO: function(item, qty) {
			return qty < item.product.disount.qty ? 0 : item.product.disount.percentage;
		},
		discountOrder: function(order, ord) {
			var discount = 0;
			if (ord === 1) {
				order.forEach(function(e) {
					discount += (e.items.product.sellingPrice * e.items.qty * getDiscountSO(e.items, e.items.qty));
				});
			}
			if (ord === 0) {
				order.forEach(function(e1) {
					discount += e1.items.reduce((acc, e2) => acc + e2.unitPrice * e2.qty * e2.discount);
				});
			}
			return discount;
		},
		netotalOrder: function(order, ord) {
			return subtotalOrder(order, ord) - discountOrder(order, ord);
		}
	}
}).engine);
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const router = require('./router/gpRouter');
app.use('/', router);

app.listen(PORT, () => console.log(`Listening to localhost on port ${PORT}.`));
