// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';


$(document).ready(function() {
	$.ajax({
		method: 'GET',
		url: "/getSalesOrderAJAX",
		data: "",
		success: function(item) {
			let dataLabels = [];
			let physicalDataSet = [];
			let onlineDataSet = [];
			let i, j, k, physicalSales, onlineSales;
			// Physical Sales
			for (i = 0; i < item.soDates.length; i++) {
				physicalSales = 0;
				for (j= 0; j < item.soPhysical.length; j++) {
					if ((new Date(item.soPhysical[j].dateOrdered)).toISOString().substr(0, 10) === (new Date(item.soDates[i])).toISOString().substr(0, 10)) {
						for (k = 0; k < item.soPhysical[i].items.length; k++) {
							physicalSales += (item.soPhysical[j].items[k].unitPrice * item.soPhysical[j].items[k].qty);
						}
					}
				}
				dataLabels.push((new Date(item.soDates[i])).toISOString().substr(0, 10));
				physicalDataSet.push(physicalSales);
			}
			// Online Sales
			for (i = 0; i < item.soDates.length; i++) {
				onlineSales = 0;
				for (j= 0; j < item.soOnline.length; j++) {
					if ((new Date(item.soOnline[j].dateOrdered)).toISOString().substr(0, 10) === (new Date(item.soDates[i])).toISOString().substr(0, 10)) {
						for (k = 0; k < item.soOnline[i].items.length; k++) {
							onlineSales += (item.soOnline[j].items[k].unitPrice * item.soOnline[j].items[k].qty);
						}
					}
				}
				dataLabels.push((new Date(item.soDates[i])).toISOString().substr(0, 10));
				onlineDataSet.push(onlineSales);
			}
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
						data: physicalDataSet,
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
								max: 60000,
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
			alert(str.responseText);
		}
	});
})



