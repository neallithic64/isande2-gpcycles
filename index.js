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
		multiplyDisc: function(price,qty,discount) {
			return price * qty * (100 - discount);
		},
		subtotalSO: function(salesorder) {
			var subSO = 0;
			salesorder.item.forEach(function(){
				subSO += (salesorder.items.product.sellingPrice * salesorder.items.qty);
			})
			return subSO;
		},
		discountSO: function(salesorder) {
			var discSO = 0;
			salesorder.item.forEach(function(){
				discSO += (salesorder.items.product.sellingPrice * salesorder.items.qty * discuntSO(salesorder.items));
			})
			return discSO;
		},
		netotalSO: function(salesorder) {
			return subtotalSO(salesorder) - discountSO(salesorder);
		},
		getArrIndex: function(arr, index) {
			return arr[index];
		},
		getPrice: function(price) {
			return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		},
		getPURL: function(id) {
			return '/product/' + id;
		},
		getDiscountSO: function(item) {
			return item.qty < item.product.disount.qty ? 0 : item.product.disount.percentage;
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
		}
	}
}).engine);
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const router = require('./router/gpRouter');
app.use('/', router);

app.listen(PORT, () => console.log(`Listening to localhost on port ${PORT}.`));
