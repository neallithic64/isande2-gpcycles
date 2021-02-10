// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

$(document).ready(function() {
	if (window.location.pathname === "/") {
		$.ajax({
			method: 'GET',
			url: "/getSalesOrderAJAX",
			data: "",
			success: function(item) {
				let dataLabels = [];
				let physicalDataSet = [];
				let onlineDataSet = [];
				let i, j, k, l, m, physicalSales, onlineSales;
				// Physical Sales
				for (i = 0; i < item.soDates.length; i++) {
					physicalSales = 0;
					for (j= 0; j < item.soPhysical.length; j++) {
						if ((new Date(item.soPhysical[j].dateOrdered)).toISOString().substr(0, 10) === (new Date(item.soDates[i])).toISOString().substr(0, 10)) {
							for (k = 0; k < item.soPhysical[j].items.length; k++) {
								physicalSales += item.soPhysical[j].items[k].netPrice;
							}
						}
					}
					dataLabels.push((new Date(item.soDates[i])).toISOString().substr(0, 10));
					physicalDataSet.push(physicalSales);
				}
				// Online Sales
				for (i = 0; i < item.soDates.length; i++) {
					onlineSales = 0;
					for (j= 0; j < item.soOnlineBank.length; j++) {
						if (((new Date(item.soOnlineBank[j].dateOrdered)).toISOString().substr(0, 10) === (new Date(item.soDates[i])).toISOString().substr(0, 10)) && ((item.soOnlineBank[j].status === "For Pickup") || (item.soOnlineBank[j].status === "To Deliver") || (item.soOnlineBank[j].status === "Fulfilled"))) {
							for (k = 0; k < item.soOnlineBank[j].items.length; k++) {
								onlineSales += item.soOnlineBank[j].items[k].netPrice;
							}
						}
					}
					for (l = 0; l < item.soOnlineCOD.length; l++) {
						if (((new Date(item.soOnlineCOD[l].dateOrdered)).toISOString().substr(0, 10) === (new Date(item.soDates[i])).toISOString().substr(0, 10)) && (item.soOnlineCOD[l].status === "Fulfilled")) {
							for (m = 0; m < item.soOnlineCOD[l].items.length; m++) {
								onlineSales += item.soOnlineCOD[l].items[m].netPrice;
							}
						}
					}
					dataLabels.push((new Date(item.soDates[i])).toISOString().substr(0, 10));
					onlineDataSet.push(onlineSales);
				}
				
				dataLabels = [...new Set(dataLabels)];
				if (dataLabels.length > 7) {
					let excess = dataLabels.length - 7;
					let i;
					for (i = 0; i < excess; i++) {
						dataLabels.shift();
						physicalDataSet.shift();
						onlineDataSet.shift();
					}
				}
				
				dataLabels.sort(function(a, b) {
					return Date.parse(a) - Date.parse(b);
				});

				// Chart
				var ctx = document.getElementById("dbDailySales");
				var myLineChart = new Chart(ctx, {
					type: 'line',
					data: {
						labels: [...new Set(dataLabels)],
						datasets: [{
							label: "Physical Sales",
							lineTension: 0.3,
							backgroundColor: "rgba(236,170,105,0.4)",
							borderColor: "rgba(236,170,105,1)",
							pointRadius: 5,
							pointBackgroundColor: "rgba(236,170,105,1)",
							pointBorderColor: "rgba(255,255,255,0.8)",
							pointHoverRadius: 5,
							pointHoverBackgroundColor: "rgba(236,170,105,1)",
							pointHitRadius: 50,
							pointBorderWidth: 2,
							data: physicalDataSet
						}, {
							label: "Online Sales",
							lineTension: 0.3,
							backgroundColor: "rgba(23, 162, 184, 0.2)",
							borderColor: "rgba(2,117,216,1)",
							pointRadius: 5,
							pointBackgroundColor: "rgba(2,117,216,1)",
							pointBorderColor: "rgba(255,255,255,0.8)",
							pointHoverRadius: 5,
							pointHoverBackgroundColor: "rgba(2,117,216,1)",
							pointHitRadius: 50,
							pointBorderWidth: 2,
							data: onlineDataSet
						} ]
					},
					options: {
						scales: {
							xAxes: [{
								time: {
									unit: 'date'
								},
								gridLines: {
									display: false
								},
								ticks: {
									maxTicksLimit: 7
								}
							}],
							yAxes: [{
								ticks: {
									min: 0,
									max: 1000000,
									maxTicksLimit: 10
								},
								gridLines: {
									color: "rgba(0, 0, 0, .125)"
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
