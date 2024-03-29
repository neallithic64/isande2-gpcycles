const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

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
	saveUninitialized: true,
	store: new MongoStore({
		mongooseConnection: mongoose.connection,
		ttl: 60*60*24,
		autoRemove: 'native',
		touchAfter: 3600
	}),
	cookie: {
		secure: true,
		samesite: 'lax'
	}
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
		getNaturalIndex: function(index) {
			return index+1;
		},
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
		getFormatPrice: function(price) {
			return Number.parseFloat(price)
					.toFixed(2)
					.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		},
		statusShowButton:	function(status, button) {
			switch (button) {
				case 1: return status === "Draft"; // 1: PO Confirm
				case 2: return status === "To Pay"; // 2: PO Pay
				case 3: return status === "To Receive"; // 3: PO Receive
				case 4: return status === "Draft" || status === "To Pay"; // 4: PO Cancel
				case 5: return status === "Pending"; // 5: SO Pay
				case 6: return status === "To Deliver"; // 6: SO Deliver
				case 7: return status === "To Pickup"; // 7: SO Pickup
				case 8: return status === "Pending"; // 8: SO Cancel
			}
		},
		getProdLowCount: function(product) {
			return product.reorderPoint > product.quantity;
		},
		getDiscountSO: function(item, qty) {
			console.log(item);
			console.log(qty);
			return qty < item.product.discount.qty ? 0 : item.product.discount.percentage;
		},
		getOrderTotal: function(items, isSO) {
			if (isSO) return items
					.reduce((acc, elem) => acc + (elem.qty >= elem.product.discount.qty ? elem.qty * elem.unitPrice * (100 - elem.product.discount.percentage) / 100 : elem.qty * elem.unitPrice), 0)
					.toFixed(2)
					.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			else return items
					.reduce((acc, elem) => acc + elem.qty * elem.unitPrice * (100 - elem.discount) / 100, 0)
					.toFixed(2)
					.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		},
		getincoming: function(product, purchaseorders) {
			var sum = 0, i,j, have=false;
			for(i = 0; i < purchaseorders.length; i++) {
				for(j = 0; j < purchaseorders[i].items.length; j++)
					if (purchaseorders[i].items[j].product === product._id) {
						if(!have) {
							var day = new Date(purchaseorders[i].expectedDelivery);
							have = true;
						}
						else{
							var newday = new Date(purchaseorders[i].expectedDelivery);
							if(newday-day) day = newday;
						}
					}
			}
			return day.toISOString().substr(0, 10);
		},
		getoutgoing: function(product, salesorders) {
			let i, j, have = false;
			for (i = 0; i < salesorders.length; i++) {
				for (j = 0; j < salesorders[i].items.length; j++)
					if (salesorders[i].items[j].product === product._id) {
						if (!have) {
							var day = new Date(salesorders[i].expectedDelivery);
							have = true;
						}
						else {
							var newday = new Date(salesorders[i].expectedDelivery);
							if(newday-day) day = newday;
						}
					}
			}
			return day;
		},
		adjustmentType: function(adj) {
			if (adj.length === 9 && adj.subsubstr(0,3) === "SO-") return "Sale";
			else if (adj.length === 9 && adj.subsubstr(0,3) === "PO-") return "Purchase";
			else return "Adjustment";
		},
		getLink: function(adjustment) {
			if (adjustment.reference === null) return "";
			if (adjustment.reference === "-") return "";
			if (adjustment.reference.substr(0,2) === "PO") return ("/viewPO/" + adjustment.reference);
			if (adjustment.reference.substr(0,2) === "SO") return ("/viewSO/" + adjustment.reference);
		},
		subtotalOrder: function(order, ord) {
			return order.items
					.reduce((acc, e) => acc + e.qty * e.unitPrice, 0)
					.toFixed(2)
					.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		},
		// Ord: 0 === PO
		// Ord: 1 === SO
		discountOrder: function(order, ord) {
			if (ord === 0) return order.items
					.reduce((acc, e) => acc + e.unitPrice * e.qty * (e.discount/100), 0)
					.toFixed(2)
					.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			if (ord === 1) return order.items
					.reduce((acc, e) => acc + (e.qty >= e.product.discount.qty ? e.qty * e.unitPrice * e.product.discount.percentage / 100 : 0), 0)
					.toFixed(2)
					.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		},
		netotalOrder: function(order, ord) {
			if (ord === 0) return order.items
					.reduce((acc, e) => acc + (e.unitPrice * e.qty * (100 - e.discount) / 100), 0)
					.toFixed(2)
					.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			if (ord === 1) return order.items
					.reduce((acc, e) => acc + (e.qty >= e.product.discount.qty ? e.qty * e.unitPrice * (100 - e.product.discount.percentage) / 100 : e.qty * e.unitPrice), 0)
					.toFixed(2)
					.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		},
		netPriceDisc: function(price, qty, discount) {
			console.log(price);
			console.log(qty);
			return price * qty * (100 - discount) / 100;
		},
		begInv: function(product, month) {
			if (product.adjustmentHistory.length <= 0) return product.quantity;
			else
				for (var i=0; i<product.adjustmentHistory.length; i++) {
					var monthIn = new Date(product.adjustmentHistory[i].date);
					if (month===monthIn.getMonth()+1 && product.adjustmentHistory[i].before)
						return product.adjustmentHistory[i].before;
			}
			return product.adjustmentHistory[0].before;
		},
		sumPurch: function(product, month) {
			var sum = 0, i;
			for(i = 0; i < product.adjustmentHistory.length; i++) {
				var monthIn = new Date(product.adjustmentHistory[i].date);
				if (!product.adjustmentHistory[i].reference);
				else if ((product.adjustmentHistory[i].reference).substring(0,3) === "PO-"
						&& (month===monthIn.getMonth()+1))
					sum += product.adjustmentHistory[i].quantity;
			}
			return sum;
		},
		sumSales: function(product, month) {
			var sum = 0, i;
			for(i = 0; i < product.adjustmentHistory.length; i++) {
				var monthIn = new Date(product.adjustmentHistory[i].date);
				if (!product.adjustmentHistory[i].reference);
				else if ((product.adjustmentHistory[i].reference).substring(0,3) === "SO-"
						&& (month===monthIn.getMonth()+1))
					sum += product.adjustmentHistory[i].quantity;
			}
			return sum * -1;
		},
		sumAdj: function(product, month) {
			let sum = 0, i;
			for(i = 0; i < product.adjustmentHistory.length; i++) {
				var monthIn = new Date(product.adjustmentHistory[i].date);
				if (!product.adjustmentHistory[i].reference);
				else if ((product.adjustmentHistory[i].reference) === '-'
						&& (month===monthIn.getMonth()+1))
					sum += product.adjustmentHistory[i].quantity;
			}
			return sum;
		},
		endInv: function(product, month) {
			var i=0, begInv, sumPurch=0 , sumSales=0 , sumAdj=0, found=false;
			if (product.adjustmentHistory.length <= 0) return product.quantity;
			else {
				while (i<product.adjustmentHistory.length && !found)
				{
					var monthIn = new Date(product.adjustmentHistory[i].date);
					if (month===monthIn.getMonth()+1)
						if (product.adjustmentHistory[i]) {
							begInv = product.adjustmentHistory[i].before;
							found = true;
						}
					i++;
				}
				if (!found) begInv=product.adjustmentHistory[0].before;

				for (var i=0; i<product.adjustmentHistory.length; i++) {
					var monthIn = new Date(product.adjustmentHistory[i].date);
					if (month===monthIn.getMonth()+1) {
						if (product.adjustmentHistory[i].reference) {
							if ((product.adjustmentHistory[i].reference).substr(0,3) === 'PO-')
								sumPurch += product.adjustmentHistory[i].quantity;
							else if ((product.adjustmentHistory[i].reference).substr(0,3) === 'SO-')
								sumSales += product.adjustmentHistory[i].quantity;
							else if ((product.adjustmentHistory[i].reference) === '-')
								sumAdj += product.adjustmentHistory[i].quantity;
						}
					}
				}
				console.log(begInv, sumPurch, sumSales, sumAdj, begInv + sumPurch + sumSales + sumAdj);
			}
			return begInv + sumPurch + sumSales + sumAdj;
		},
		cogs: function(product, month) {
			var i=0, begInv, endInv, sumPurch=0 , sumSales=0 , sumAdj=0, found=false;
			if (product.adjustmentHistory.length <= 0){
				begInv = product.quantity;
				endInv = product.quantity;
			}
			else {
				while (i<product.adjustmentHistory.length && !found)
				{
					var monthIn = new Date(product.adjustmentHistory[i].date);
					if (month===monthIn.getMonth()+1)
						if (product.adjustmentHistory[i]) {
							begInv = product.adjustmentHistory[i].before;
							found = true;
						}
					i++;
				}
				if (!found) begInv=product.adjustmentHistory[0].before;

				for (var i=0; i<product.adjustmentHistory.length; i++) {
					var monthIn = new Date(product.adjustmentHistory[i].date);
					if (month===monthIn.getMonth()+1) {

						if (product.adjustmentHistory[i].reference) {
							if ((product.adjustmentHistory[i].reference).substr(0,3) === 'PO-')
								sumPurch += product.adjustmentHistory[i].quantity;
							else if ((product.adjustmentHistory[i].reference).substr(0,3) === 'SO-')
								sumSales += product.adjustmentHistory[i].quantity;
							else if ((product.adjustmentHistory[i].reference) === '-')
								sumAdj += product.adjustmentHistory[i].quantity;
						}
					}
				}
			}
			endInv = begInv + sumPurch + sumSales + sumAdj;
			var cogs = (begInv + sumPurch - endInv) * product.purchasePrice;
			return cogs.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		},
		invTurnover: function(product, month) {
			var i=0, begInv, endInv, sumPurch=0 , sumSales=0 , sumAdj=0, found=false;
			if (product.adjustmentHistory.length <= 0){
				begInv = product.quantity;
				endInv = product.quantity;
			}
			else {
				while (i<product.adjustmentHistory.length && !found)
				{
					var monthIn = new Date(product.adjustmentHistory[i].date);
					if (month===monthIn.getMonth()+1)
						if (product.adjustmentHistory[i]) {
							begInv = product.adjustmentHistory[i].before;
							found = true;
						}
					i++;
				}
				if (!found) begInv=product.adjustmentHistory[0].before;

				for (var i=0; i<product.adjustmentHistory.length; i++) {
					var monthIn = new Date(product.adjustmentHistory[i].date);
					if (month===monthIn.getMonth()+1) {
						if (product.adjustmentHistory[i].reference) {
							if ((product.adjustmentHistory[i].reference).substr(0,3) === 'PO-')
								sumPurch += product.adjustmentHistory[i].quantity;
							else if ((product.adjustmentHistory[i].reference).substr(0,3) === 'SO-')
								sumSales += product.adjustmentHistory[i].quantity;
							else if ((product.adjustmentHistory[i].reference) === '-')
								sumAdj += product.adjustmentHistory[i].quantity;
						}
					}
				}
			}
			var endInv = begInv + sumPurch + sumSales + sumAdj;
			if (begInv + endInv === 0) return 0;
			var invt = (begInv + sumPurch - endInv) * 2 / (begInv + endInv);
			return +(Math.round(invt + "e+2") + "e-2");
		},
		itemSold: function(product, salesorders, month) {
			var sum = 0, i,j;
			for(i = 0; i < salesorders.length; i++) {
				var monthIn = new Date(salesorders[i].dateOrdered);
				if (month===monthIn.getMonth()+1)
					for(j = 0; j < salesorders[i].items.length; j++)
						if (salesorders[i].items[j].product === product._id)
							sum += salesorders[i].items[j].qty;
			}
			return sum;
		},
		totalSalesPrice: function(product, salesorders, month) {
			var sum = 0, i,j, price;
			for(i = 0; i < salesorders.length; i++) {
				var monthIn = new Date(salesorders[i].dateOrdered);
				if (month===monthIn.getMonth()+1)
					for(j = 0; j < salesorders[i].items.length; j++)
						if (salesorders[i].items[j].product === product._id)
							sum += salesorders[i].items[j].qty;
					}
			return (sum*product.sellingPrice).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		},
		totalSalesCost: function(product, salesorders, month) {
			var sum = 0, i,j;
			for(i = 0; i < salesorders.length; i++) {
				var monthIn = new Date(salesorders[i].dateOrdered);
				if (month===monthIn.getMonth()+1)
					for(j = 0; j < salesorders[i].items.length; j++)
						if (salesorders[i].items[j].product === product._id)
							sum += salesorders[i].items[j].qty;
			}
			return (sum * product.purchasePrice).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		},
		totalSalesDisc: function(product, salesorders, month) {
			var sum = 0, i,j, dis;
			for (i = 0; i < salesorders.length; i++) {
				var monthIn = new Date(salesorders[i].dateOrdered);
				if (month===monthIn.getMonth()+1)
				for (j = 0; j < salesorders[i].items.length; j++)
					if (salesorders[i].items[j].product === product._id) {
						dis = salesorders[i].items[j].discount;
						if (dis) sum+= dis;
					}
			}
			return sum.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');;
		},
		totalNetProfit: function(product, salesorders, month) {
			let sum = 0, i,j, dis, disc = 0;
			for(i = 0; i < salesorders.length; i++) {
				var monthIn = new Date(salesorders[i].dateOrdered);
				if (month===monthIn.getMonth()+1)
				for (j = 0; j < salesorders[i].items.length; j++)
					if (salesorders[i].items[j].product === product._id) {
						sum += salesorders[i].items[j].qty;
						dis = salesorders[i].items[j].discount;
						if (dis) disc+= dis;
					}
			}
			let totelNetProfit = (sum * (product.sellingPrice - product.purchasePrice)) - disc;
			return totelNetProfit.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		},
		percentProfit: function(product, salesorders, month) {
			var sum = 0, i,j, dis, price;
			var disc = 0;
			for(i = 0; i < salesorders.length; i++) {
				var monthIn = new Date(salesorders[i].dateOrdered);
				if (month === monthIn.getMonth()+1)
				for(j = 0; j < salesorders[i].items.length; j++) {
					if (salesorders[i].items[j].product === product._id) {
						sum += salesorders[i].items[j].qty;
						dis = salesorders[i].items[j].discount;
						if (dis) disc+= dis;
					}
				}
			}
			var netprof = sum * (product.sellingPrice - product.purchasePrice) - disc;
			var percent = (netprof / sum) / product.purchasePrice;
			if (percent) return (percent * 100).toFixed(2);
		},
		getGroupCode: function(itemCode) {
			return "g" + itemCode.split("-")[0];
		},
		statusStyle: function(status) {
			return 'status-' + status.charAt(0).toLowerCase() + status.split(' ').join('').substr(1);
		}
	}
}).engine);
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const router = require('./router/gpRouter');
app.use('/', router);

app.listen(PORT, () => console.log(`Listening to localhost:${PORT}.`));
