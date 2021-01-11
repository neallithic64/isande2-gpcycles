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
		getSizeChart: function(categs) {
			return categs.some(e => e.categName === 'Bottoms');
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

const router = require('./router/indexRouter');
app.use('/', router);

app.listen(PORT, () => console.log(`Listening to localhost on port ${PORT}.`));
