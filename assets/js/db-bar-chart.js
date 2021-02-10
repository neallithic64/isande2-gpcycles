// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

const monthNames = {
	"Jan": 1,
	"Feb": 2,
	"Mar": 3,
	"Apr": 4,
	"May": 5,
	"Jun": 6,
	"Jul": 7,
	"Aug": 8,
	"Sep": 9,
	"Oct": 10,
	"Nov": 11,
	"Dec": 12
};

$(document).ready(function() {
	if (window.location.pathname === "/") {
		$.ajax({
			method: 'GET',
			url: "/getSalesOrderAJAX",
			data: "",
			success: function(item) {
				let dataLabels = [];
				let revenueDataSet = [];
				let purchaseDataSet = [];
				let i, j, k, l, m, month, year, fdate, revenue, purchases;

				function getTrueMonth(date) {
					return (new Date(date)).getMonth() + 1;
				}
				function getTrueYear(date) {
					return (new Date(date)).getFullYear();
				}
				function getDate(date) {
					let months = {
						1 : "Jan", 2 : "Feb", 3 : "Mar", 4 : "Apr", 5 : "May", 6 : "Jun",
						7 : "Jul", 8 : "Aug", 9 : "Sep", 10 : "Oct", 11 : "Nov", 12 : "Dec"
					};
					month = months[getTrueMonth(new Date(date))];
					year = (new Date(date)).getFullYear();
					fdate = month + ' ' + year;
					return fdate;
				}
				function dynamicSort(property) {
					var sortOrder = 1;
					if(property[0] === "-") {
						sortOrder = -1;
						property = property.substr(1);
					}
					return function (a,b) {
						var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
						return result * sortOrder;
					};
				}

				item.soOrders = item.soOrders.sort(dynamicSort("dateOrdered"));
				item.poOrders = item.poOrders.sort(dynamicSort("dateOrdered"));

				// Revenue
				l = 0;
				for (i = 0; i < item.soDates.length; i++) {
					revenue = 0;
					for (j = 0; j < item.soOrders.length; j++) {
						if ((getTrueMonth(item.soOrders[j].dateOrdered) === getTrueMonth(item.soDates[i])) && (getTrueYear(item.soOrders[j].dateOrdered) === getTrueYear(item.soDates[i])) && ((item.soOrders[j].status === "For Pickup") || (item.soOrders[j].status === "To Deliver") || (item.soOrders[j].status === "Fulfilled"))) {
							for (k = 0; k < item.soOrders[j].items.length; k++) {
								revenue += item.soOrders[j].items[k].netPrice;
							}
						}
					}
					dataLabels.push(getDate(item.soDates[i]));
					revenueDataSet.push(revenue);
					while ((getTrueMonth(item.soOrders[l].dateOrdered) === getTrueMonth(item.soDates[i]))) {
						i++;
					}
					l++;
					i--;
				}

				// Purchases
				l = 0;
				for (i = 0; i < item.poDates.length; i++) {
					purchases = 0;
					for (j = 0; j < item.poOrders.length; j++) {
						if ((getTrueMonth(item.poOrders[j].dateOrdered) === getTrueMonth(item.poDates[i])) && (getTrueYear(item.poOrders[j].dateOrdered) === getTrueYear(item.poDates[i])) && ((item.poOrders[j].status === "Paid") || (item.poOrders[j].status === "To Receive") || (item.poOrders[j].status === "Received"))) {
							for (k = 0; k < item.poOrders[j].items.length; k++) {
								purchases += ((item.poOrders[j].items[k].qty * item.poOrders[j].items[k].unitPrice) * (1 - (item.poOrders[j].items[k].discount / 100)));
							}
						}
					}
					dataLabels.push(getDate(item.poDates[i]));
					purchaseDataSet.push(purchases);
					while ((getTrueMonth(item.poOrders[l].dateOrdered) === getTrueMonth(item.poDates[i]))) {
						i++;
					}
					l++;
					i--;
				}

				if ([...new Set(dataLabels)].length > 6) {
					let excess = [...new Set(dataLabels)].length - 6;
					let i;
					for (i = 0; i < excess; i++) {
						dataLabels.shift();
						revenueDataSet.shift();
						purchaseDataSet.shift();
					}
				}
				
				dataLabels.sort(function(a, b) {
					return monthNames[a.split(' ')[0]] - monthNames[b.split(' ')[0]];
				});
				// console.log([...new Set(revenueDataSet)]);
				
				// Chart
				var ctx = document.getElementById("dbRevAndPurch");
				var myBarChart = new Chart(ctx, {
					type: 'bar',
					data: {
						labels: [...new Set(dataLabels)],
						datasets: [{
							label: "Revenue",
							backgroundColor: "green",
							borderColor: "green",
							data: revenueDataSet
						}, {
							label: "Purchases",
							backgroundColor: "red",
							borderColor: "red",
							data: purchaseDataSet
						} ]
					},
					options: {
						scales: {
							xAxes: [{
								time: {
									unit: 'month'
								},
								gridLines: {
									display: false
								},
								ticks: {
									maxTicksLimit: 6
								}
							}],
							yAxes: [{
								ticks: {
									min: 0,
									max: 1000000,
									maxTicksLimit: 10
								},
								gridLines: {
									display: true
								}
							}]
						},
						legend: {
							display: true
						}
					}
				});
			},
			error: function(str) {
				console.log(str);
			}
		});
	}
});
