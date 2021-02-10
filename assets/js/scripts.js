/*!
* Start Bootstrap - SB Admin v6.0.2 (https://startbootstrap.com/template/sb-admin)
* Copyright 2013-2020 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-sb-admin/blob/master/LICENSE)
*/
/* global validator */

(function($) {
	"use strict";
	// Add active state to sidbar nav links
	var path = window.location.href; // because the 'href' property of the DOM element is the absolute path
	$("#layoutSidenav_nav .sb-sidenav a.nav-link").each(function() {
		if (this.href === path) {
			$(this).addClass("active");
		}
	});
	// Toggle the side navigation
	$("#sidebarToggle").on("click", function(e) {
		e.preventDefault();
		$("body").toggleClass("sb-sidenav-toggled");
	});

	if (window.location.pathname.includes("/viewPO") || window.location.pathname.includes("/viewSO") ) {
		// Get the modal
		var modal = document.getElementById("cancelModal");

		// Get the button that opens the modal
		var btn = document.getElementById("cancelSOPOButton");

		// Get the <span> element that closes the modal
		var span = document.getElementsByClassName("close")[0];

		// When the user clicks on the button, open the modal
		btn.onclick = function() {
			modal.style.display = "block";
		};

		// When the user clicks on <span> (x), close the modal
		span.onclick = function() {
			modal.style.display = "none";
		};

		// When the user clicks anywhere outside of the modal, close it
		window.onclick = function(event) {
			if (event.target == modal) {
				modal.style.display = "none";
			}
		};
	}
})(jQuery);


// Non-library scripts below


$(document).ready(function() {
	// Call the dataTables jQuery plugin
	$('#datatable').DataTable();
	
	if (window.location.pathname === '/newPO' || window.location.pathname === '/newSO')
		$(':input[type="date"]').val(new Date().toISOString().substr(0, 10));
	
	$("#PayNetTotal").val(Number.parseFloat($("#paySub").val().replace(",", "")) - Number.parseFloat($("#payTotalDisc").val()));
	
	$('button#submitLogin').click(function() {
		let form = $("form#loginForm").serializeArray();
		if (form.every(e => !validator.isEmpty(e.value))) {
			$.ajax({
				method: 'POST',
				url: '/login',
				data: form,
				success: function() {
					window.location.href = '/';
				},
				error: function(str) {
					console.log(str.responseText);
				}
			});
		} else alert('Incomplete fields, please accomplish them all.');
	});
	
	$('button#submitAddUser').click(function() {
		let addUserForm = $('form#addUser').serializeArray();
		trimArr(addUserForm);
		var checks = Array(4).fill(true);
		
		checks[0] = addUserForm.some(e => validator.isEmpty(e.value)) ? false : true;
		if (!checks[0]) alert('Please fill in all fields.');
		
		if (addUserForm[0].value === '0') {
			checks[1] = false;
			alert('Please input a valid user type.');
		}
		
		if (!validator.equals(addUserForm[4].value, addUserForm[5].value)) {
			checks[2] = false;
			alert('Passwords do not match.');
		}
		
		if (!validator.isLength(addUserForm[4].value, {min: 8})) {
			checks[3] = false;
			alert('Password must be at least 8 characters long.');
		}
		
		if (checks.every(Boolean)) {
			$.ajax({
				method: 'POST',
				url: '/adduser',
				data: addUserForm,
				success: function() {
					window.location.href = '/';
				},
				error: function(str) {
					console.log(str);
				}
			});
		}
	});
	
	$('button#submitAddCustomer').click(function() {
		let addCustomerForm = $('form#addCustomer').serializeArray();
		trimArr(addCustomerForm);
		var checks = Array(4).fill(true);
		
		checks[0] = addCustomerForm.some(e => validator.isEmpty(e.value)) ? false : true;
		if (!checks[0]) alert('Please fill in all fields.');
		else {
			if (!/^09[0-9]{2}( |-)?[0-9]{3}( |-)?[0-9]{4}$/.test(addCustomerForm[2].value)) {
				$('p#phoneError').text('Please enter a mobile number (11 digits).');
				checks[1] = false;
			}
			if (!validator.isEmail(addCustomerForm[3].value)) {
				$('p#emailError').text('Invalid email inputted.');
				checks[2] = false;
			}
			if (!validator.isLength(addCustomerForm[4].value, {min: 8})) {
				$('p#passwordError').text('Street name must be at least 8 characters long.');
				checks[3] = false;
			}
		}
		
		if (checks.every(Boolean)) {
			$.ajax({
				method: 'POST',
				url: '/addCustomer',
				data: addCustomerForm,
				success: function() {
					window.location.href = '/customers';
				},
				error: function(str) {
					console.log(str);
				}
			});
		}
	});
	
	$('button#submitAddSupplier').click(function() {
		let addSupplierForm = $('form#addSupplier').serializeArray();
		trimArr(addSupplierForm);
		var checks = Array(4).fill(true);
		
		checks[0] = addSupplierForm.some(e => validator.isEmpty(e.value)) ? false : true;
		if (!checks[0]) alert('Please fill in all fields.');
		
		if (!validator.isEmail(addSupplierForm[1].value)) {
			checks[1] = false;
			alert('Please input a valid email.');
		}

		if (!validator.isLength(addSupplierForm[2].value, {min: 30})) {
			checks[2] = false;
			alert('Address must be at least 30 characters long.');
		}

		if (!/^09[0-9]{2}( |-)?[0-9]{3}( |-)?[0-9]{4}$/.test(addSupplierForm[4].value)) {
			checks[3] = false;
			alert('Please neter a mobile number (11 digits).');
		}
		
		if (checks.every(Boolean)) {
			$.ajax({
				method: 'POST',
				url: '/addSupplier',
				data: addSupplierForm,
				success: function() {
					window.location.href = '/suppliers';
				},
				error: function(str) {
					console.log(str);
				}
			});
		}
	});
	
	$('button#submitAddProduct').click(function() {
		let addProd = $('form#addProduct').serializeArray();
		trimArr(addProd);
		var checks = Array(9).fill(true), errStr = "";
		
		for (let i = 0; i < addProd.length-2 && checks[0]; i++)
			if (validator.isEmpty(addProd[i].value))
				checks[0] = false;
		if (!checks[0]) errStr += 'Please fill in all fields.\n';

		if (Number.parseFloat(addProd[4].value.replace(',', '')) < 0) {
			checks[1] = false;
			errStr += 'Price should be a valid amount.\n';
		}
		
		if (Number.parseFloat(addProd[5].value.replace(',', '')) < 0) {
			checks[2] = false;
			errStr += 'Price should be a valid amount.\n';
		}

		if (!validator.isInt(addProd[7].value, {min: 0})) {
			checks[3] = false;
			errStr += 'Starting quantity should be a whole positive number.\n';
		}

		if (!validator.isInt(addProd[8].value, {min: 0})) {
			checks[4] = false;
			errStr += 'Reorder point should be a whole positive number.\n';
		}

		if (!validator.isInt(addProd[9].value, {min: 1})) {
			checks[5] = false;
			errStr += 'Reorder quantity should be a whole positive number.\n';
		}

		if (!validator.isEmpty(addProd[10].value) && !validator.isInt(addProd[10].value, {min: 1})) {
			checks[6] = false;
			errStr += 'Minimum discount quantity should be a whole positive number.\n';
		}

		if (!validator.isEmpty(addProd[11].value) && !validator.isInt(addProd[11].value, {min: 0, max: 100})) {
			checks[7] = false;
			errStr += 'Percentage discount should be from 0 to 100.\n';
		}
		
		if (validator.isEmpty(addProd[11].value) ? !validator.isEmpty(addProd[10].value) : validator.isEmpty(addProd[10].value)) {
			checks[8] = false;
			errStr += 'Discount fields must be complete.';
		}
		
		if (checks.every(Boolean)) {
			$.ajax({
				method: 'POST',
				url: '/addProduct',
				data: addProd,
				success: function() {
					window.location.href = '/allproducts';
				},
				error: function(str) {
					console.log(str);
				}
			});
		} else alert(errStr);
	});
	
	// DASHBOARD
	if (window.location.pathname === "/") {
		$.ajax({
			method: 'GET',
			url: "/getDashboardCards",
			data: "",
			success: function(item) {
				document.getElementById("dbPhysicalSales").innerHTML = item.soPhysical;
				document.getElementById("dbOnlineSales").innerHTML = item.soOnline;
				let i, j, k, revenue, purchases, profit;
				revenue = 0;
				for (j = 0; j < item.soOrders.length; j++) {
					for (k = 0; k < item.soOrders[j].items.length; k++) {
						revenue += item.soOrders[j].items[k].netPrice;
					}
				}
				purchases = 0;
				for (j = 0; j < item.poOrders.length; j++) {
					for (k = 0; k < item.poOrders[j].items.length; k++) {
						purchases += ((item.poOrders[j].items[k].qty * item.poOrders[j].items[k].unitPrice) * (1 - (item.poOrders[j].items[k].discount / 100)));
					}
				}
				profit = revenue - purchases;
				document.getElementById("dbRevenue").innerHTML = revenue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
				document.getElementById("dbProfit").innerHTML = profit.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			},
			error: function(str) {
				console.log(str);
			}
		});
	}
	
	$('button#POaddItem').click(function() {
		$('table#POItems tbody').append("<tr>" + $('tbody tr')[0].innerHTML + "</tr>");
	});
	
	$('button#SOaddItem').click(function() {
		$('table#SOItems tbody').append("<tr>" + $('tbody tr')[0].innerHTML + "</tr>");
		$('tbody tr')[$('tbody tr').length-1].querySelector('.currentQtySpan').textContent = '';
	});
	
	$('tbody').on("change", '.inputPOItem', function() {
		let currElem = $(this), item = currElem.val();
		$.ajax({
			method: 'GET',
			url: '/getItemAJAX',
			data: {code: item},
			success: function(res) {
				currElem.closest('td').next().next().find('input').val(res.purchasePrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
			},
			error: function(str) {
				console.log(str);
			}
		});
	});
	
	$('tbody').on("change", '.inputSOItem', function() {
		let currElem = $(this), item = currElem.val();
		$.ajax({
			method: 'GET',
			url: '/getItemAJAX',
			data: {code: item},
			success: function(res) {
				currElem.closest('td').next().next().find('input').val(res.sellingPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
				currElem.closest('td').next().find('input').attr('discountPoint', res.discount.qty);
				currElem.closest('td').next().find('input').attr('discountPercent', res.discount.percentage);
				currElem.closest('td').find('.currentQtySpan').text(res.quantity + " stocks left.");
			},
			error: function(str) {
				console.log(str);
			}
		});
	});
	
	$("#inputPOName").change(function() {
		let supplier = $(this).val();
		$.ajax({
			method: 'GET',
			url: '/getSupplProds',
			data: {supplier: supplier},
			success: function(res) {
				$(".inputPOItem").each(function(i, elem) {
					$(elem).find('option:not(:first)').remove();
					res.forEach(e => $(elem).append("<option value='" + e._id + "'> " + e.prodName + " </option>"));
				});
			},
			error: function(str) {
				console.log(str);
			}
		});
	});
	
	$("#POSubmitDraft").click(function() {
		let products = [];
		$('tbody tr').each((i, e) => {
			products.push({
				product: e.children[0].children[0].children[0].value,
				qty: e.children[1].children[0].children[0].value,
				unitPrice: e.children[2].children[0].children[0].value.replace(',', ''),
				discount: e.children[3].children[0].children[0].value
			});
		});
		let data = {
			items: products,
			conditions: $("#inputPOCons").val(),
			remarks: $("#inputPORemarks").val(),
			status: "Draft",
			supplier: $("#inputPOName").val(),
			dateOrdered: $("#inputPODate").val(),
			paymentTerms: $("#inputPOTerms").val(),
			paymentDue: $("#inputPOPayDue").val(),
			expectedDelivery: $("#inputPODelDate").val()
		};
		if (validateOrder(data, "PO")) {
			$.ajax({
				method: 'POST',
				url: '/newPO',
				data: data,
				success: function() {
					window.location.href = '/viewallsopo?ordertype=PO';
				},
				error: function(str) {
					console.log(str);
				}
			});
		}
	});
	$("#POSubmitConfPay").click(function() {
		let products = [];
		$('tbody tr').each((i, e) => {
			products.push({
				product: e.children[0].children[0].children[0].value,
				qty: e.children[1].children[0].children[0].value,
				unitPrice: e.children[2].children[0].children[0].value.replace(',', ''),
				discount: e.children[3].children[0].children[0].value
			});
		});
		let data = {
			items: products,
			conditions: $("#inputPOCons").val(),
			remarks: $("#inputPORemarks").val(),
			status: "To Receive",
			supplier: $("#inputPOName").val(),
			dateOrdered: $("#inputPODate").val(),
			paymentTerms: $("#inputPOTerms").val(),
			paymentDue: $("#inputPOPayDue").val(),
			expectedDelivery: $("#inputPODelDate").val()
		};
		if (validateOrder(data, "PO")) {
			$.ajax({
				method: 'POST',
				url: '/newPO',
				data: data,
				success: function() {
					window.location.href = '/viewallsopo?ordertype=PO';
				},
				error: function(str) {
					console.log(str);
				}
			});
		}
	});
	$("#POSubmitConf").click(function() {
		let products = [];
		$('tbody tr').each((i, e) => {
			products.push({
				product: e.children[0].children[0].children[0].value,
				qty: e.children[1].children[0].children[0].value,
				unitPrice: e.children[2].children[0].children[0].value.replace(',', ''),
				discount: e.children[3].children[0].children[0].value
			});
		});
		let data = {
			items: products,
			conditions: $("#inputPOCons").val(),
			remarks: $("#inputPORemarks").val(),
			status: "To Pay",
			supplier: $("#inputPOName").val(),
			dateOrdered: $("#inputPODate").val(),
			paymentTerms: $("#inputPOTerms").val(),
			paymentDue: $("#inputPOPayDue").val(),
			expectedDelivery: $("#inputPODelDate").val()
		};
		if (validateOrder(data, "PO")) {
			$.ajax({
				method: 'POST',
				url: '/newPO',
				data: data,
				success: function() {
					window.location.href = '/viewallsopo?ordertype=PO';
				},
				error: function(str) {
					console.log(str.responseText);
				}
			});
		}
	});
	
	$('tbody').on("change", ':input[type="number"]', function() {
		try {
			if (window.location.pathname === '/newPO') {
				let currElem = $(this),
					qty = Number.parseFloat(currElem.closest('tr').find('.inputPOQty').val()),
					unit = Number.parseFloat(currElem.closest('tr').find('.inputPOUnit').val().replace(',', '')),
					discount = Number.parseFloat(currElem.closest('tr').find('.inputPODiscount').val());
				if (Number.isNaN(discount)) discount = 0;
				currElem.closest('tr').find('.inputPOTotal').val((qty * unit * (1 - (discount / 100))).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
				updatePOTotals();
			} else if (window.location.pathname === '/newSO') {
				let currElem = $(this),
					qty = Number.parseFloat(currElem.closest('tr').find('.inputSOQty').val()),
					unit = Number.parseFloat(currElem.closest('tr').find('.inputSOUnit').val().replace(',', '')),
					discount = Number.parseFloat(currElem.closest('tr').find('.inputSODiscount').val());
				if (Number.isNaN(discount)) discount = 0;
				currElem.closest('tr').find('.inputSOTotal').val((qty * unit * (1 - (discount / 100))).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
				updateSOTotals();
			}
		} catch (e) {
			console.log(e);
		}
	});
	
	$('tbody').on("change", '.inputSOQty', function() {
		try {
			let currElem = $(this), qty = currElem.val(), unit, discount;
			if (qty >= Number.parseInt(currElem.attr('discountPoint')))
				currElem.closest('td').next().next().find('input').val(currElem.attr('discountPercent') + '.0');
			else currElem.closest('td').next().next().find('input').val('0.0');
			// updating totals
			qty = Number.parseFloat(currElem.closest('tr').find('.inputSOQty').val()),
				unit = Number.parseFloat(currElem.closest('tr').find('.inputSOUnit').val().replace(',', '')),
				discount = Number.parseFloat(currElem.closest('tr').find('.inputSODiscount').val());
			currElem.closest('tr').find('.inputSOTotal').val((qty * unit * (1 - (discount / 100))).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
			updateSOTotals();
		} catch (e) {
			console.log(e);
		}
	});
	
	$('#inputSOAdj').change(function() {
		updateSOTotals();
	});
	
	$("#SOSubmitConf").click(function() {
		let products = [];
		$('tbody tr').each((i, e) => {
			products.push({
				product: e.children[0].children[0].children[0].value,
				qty: e.children[1].children[0].children[0].value,
				unitPrice: e.children[2].children[0].children[0].value.replace(',', ''),
				discount: e.children[3].children[0].children[0].value,
				netPrice: e.children[4].children[0].children[0].value.replace(',', '')
			});
		});
		let data = {
			items: products,
			conditions: $("#inputSOCons").val(),
			remarks: $("#inputSORemarks").val(),
			adjustment: $("#inputSOAdj").val(),
			status: $("#inputSOTerms").val() === "Physical" ? "Fulfilled" : "Pending",
			customer: $("#inputSOName").val(),
			dateOrdered: $("#inputSODate").val(),
			paymentTerms: $("#inputSOTerms").val(),
			paymentDue: $("#inputSOPayDue").val(),
			deliveryMode: $("#inputSOMode").val(),
			expectedDelivery: $("#inputSODelDate").val()
		};
		if (validateOrder(data, "SO")) {
			$.ajax({
				method: 'POST',
				url: '/newSO',
				data: data,
				success: function() {
					window.location.href = '/viewallsopo?ordertype=SO';
				},
				error: function(str) {
					console.log(str);
				}
			});
		}
	});
	$("#SOSubmitConfPay").click(function() {
		let products = [];
		$('tbody tr').each((i, e) => {
			products.push({
				product: e.children[0].children[0].children[0].value,
				qty: e.children[1].children[0].children[0].value,
				unitPrice: e.children[2].children[0].children[0].value.replace(',', ''),
				discount: e.children[3].children[0].children[0].value,
				netPrice: e.children[4].children[0].children[0].value.replace(',', '')
			});
		});
		let data = {
			items: products,
			conditions: $("#inputSOCons").val(),
			remarks: $("#inputSORemarks").val(),
			adjustment: $("#inputSOAdj").val(),
			status: $("#inputSOTerms").val() === "Physical" ? "Fulfilled" : $("#inputSOMode").val() === "Delivery" ? "To Deliver" : "For Pickup",
			customer: $("#inputSOName").val(),
			dateOrdered: $("#inputSODate").val(),
			paymentTerms: $("#inputSOTerms").val(),
			paymentDue: $("#inputSOPayDue").val(),
			deliveryMode: $("#inputSOMode").val(),
			expectedDelivery: $("#inputSODelDate").val()
		};
		if (validateOrder(data, "SO")) {
			$.ajax({
				method: 'POST',
				url: '/newSO',
				data: data,
				success: function() {
					window.location.href = '/viewallsopo?ordertype=SO';
				},
				error: function(str) {
					console.log(str.responseText);
				}
			});
		}
	});
});


// STATUS UPDATE FUNCTIONS


$(document).ready(function() {
	$("#cancelSOPOSubmitButton").click(function() {
		let ordNum = window.location.pathname.split('/')[2], reason = $("#inputCancelRemarks").val();
		$.ajax({
			method: 'POST',
			url: '/cancelSOPO',
			data: {orderNum: ordNum, reason: reason},
			success: function() {
				alert('Order has been cancelled.');
				window.location.href = '/viewallsopo?ordertype=' + ordNum.substr(0, 2);
			},
			error: function(str) {
				console.log(str.responseText);
			}
		});
	});

	$("#paySOPOSubmitButton").click(function() {
		let ordNum = window.location.pathname.split('/')[2],
			penalty = $("#inputPenalty").val(),
			remarks = $("#inputPenaltyRemarks").val();
		$.ajax({
			method: 'POST',
			url: '/paySOPO',
			data: {orderNum: ordNum, penalty: penalty, remarks: remarks},
			success: function() {
				alert('Order has been paid.');
				window.location.href = '/viewallsopo?ordertype=' + ordNum.substr(0, 2);
			},
			error: function(str) {
				console.log(str.responseText);
			}
		});
	});

	$("#pickupSOButton").click(function() {
		// redirect to '/viewallsopo', change status to fulfilled
		let ordNum = window.location.pathname.split('/')[2];
		$.ajax({
			method: 'POST',
			url: '/pickupSO',
			data: {orderNum: ordNum},
			success: function() {
				alert('Order has been picked up.');
				window.location.href = '/viewallsopo?ordertype=SO';
			},
			error: function(str) {
				console.log(str);
			}
		});
	});
	$("#submitDeliverSOButton").click(function() {
		let urlParams = new URLSearchParams(window.location.search);
		let partial = urlParams.get('partial') === "true", partialList = [];
		let ordNum = window.location.pathname.split('/')[2];
		if (partial) {
			$('input[type="checkbox"]').each(function(i, elem) {
				if (elem.checked) {
					partialList.push({
						prodCode: elem.closest('tr').querySelector('.drItem').id,
						qty: Number.parseInt(elem.closest('tr').querySelector('.drQtyCheck').value)
					});
				}
			});
		}
		$.ajax({
			method: 'POST',
			url: '/delrecSOPO',
			data: {orderNum: ordNum, partial: partial, partialList: partialList},
			success: function() {
				alert('Order has been paid.');
				window.location.href = '/viewallsopo?ordertype=' + ordNum.substr(0, 2);
			},
			error: function(str) {
				console.log(str);
			}
		});
	});
	
	$("#confPOButton").click(function() {
		let ordNum = window.location.pathname.split('/')[2];
		$.ajax({
			method: 'POST',
			url: '/confPO',
			data: {orderNum: ordNum},
			success: function() {
				window.location.href = '/viewallsopo?ordertype=PO';
			},
			error: function(str) {
				console.log(str.responseText);
			}
		});
	});
	
	$("#submitReceivePOButton").click(function() {
		let urlParams = new URLSearchParams(window.location.search);
		let partial = urlParams.get('partial') === "true", partialList = [];
		let ordNum = window.location.pathname.split('/')[2];
		if (partial) {
			$('input[type="checkbox"]').each(function(i, elem) {
				if (elem.checked) {
					partialList.push({
						prodCode: elem.closest('tr').querySelector('.drItem').id,
						qty: Number.parseInt(elem.closest('tr').querySelector('.drQtyCheck').value)
					});
				}
			});
		}
		$.ajax({
			method: 'POST',
			url: '/delrecSOPO',
			data: {orderNum: ordNum, partial: partial, partialList: partialList},
			success: function() {
				alert('Order has been received.');
				window.location.href = '/viewallsopo?ordertype=' + ordNum.substr(0, 2);
			},
			error: function(str) {
				console.log(str);
			}
		});
	});
});


// EDITING PRODUCT FUNCTIONS


$(document).ready(function() {
	$('button#submitEditProduct').click(function() {
		let editProductForm = $('form#editProduct').serializeArray();
		trimArr(editProductForm);
		var checks = Array(6).fill(true);

		if (Number.parseFloat(editProductForm[1].value.replace(',', '')) < 0) {
			checks[0] = false;
			alert('Price should be a valid amount.');
		}
		
		if (Number.parseFloat(editProductForm[2].value.replace(',', '')) < 0) {
			checks[1] = false;
			alert('Price should be a valid amount.');
		}

		if (!validator.isInt(editProductForm[3].value, {min: 1})) {
			checks[2] = false;
			alert('Minimum discount quantity should be a whole positive number.');
		}

		if (!validator.isInt(editProductForm[4].value, {min:0, max: 100})) {
			checks[3] = false;
			alert('Percentage discount should be from 0 to 100.');
		}

		if (!validator.isInt(editProductForm[5].value, {min: 0})) {
			checks[4] = false;
			alert('Reorder point should be a whole positive number.');
		}

		if (!validator.isInt(editProductForm[6].value, {min: 1})) {
			checks[5] = false;
			alert('Reorder quantity should be a whole positive number.');
		}

		if (checks.every(Boolean)) {
			$.ajax({
				method: 'POST',
				url: "/editproduct/" + window.location.pathname.split('/')[2],
				data: editProductForm,
				success: function() {
					window.location.href = "/viewproduct/" + window.location.pathname.split('/')[2];
				},
				error: function(str) {
					alert(str);
				}
			});
		}
	});

	$('button#submitAdjustProduct').click(function() {
		let adjustProductForm = $('form#adjustProduct').serializeArray();
		trimArr(adjustProductForm);
		var checks = Array(2).fill(true);
		
		checks[0] = adjustProductForm.some(e => validator.isEmpty(e.value)) ? false : true;
		if (!checks[0]) alert('Please fill in all fields.');
		
		if (!validator.isInt(adjustProductForm[1].value, {min: 0})) {
			checks[1] = false;
			alert('Current count should be a whole positive number.');
		}

		if (checks.every(Boolean)) {
			$.ajax({
				method: 'POST',
				url: "/adjustProduct/" + window.location.pathname.split('/')[2],
				data: adjustProductForm,
				success: function() {
					window.location.href = "/viewproduct/" + window.location.pathname.split('/')[2];
				},
				error: function(str) {
					console.log(str);
				}
			});
		}
	});
});

function logout() {
	let xhr = new XMLHttpRequest();
	xhr.open('POST', '/logout');
	xhr.onreadystatechange = (() => {
		if (xhr.readyState === 4 && xhr.status) window.location.href = "/login";
	});
	xhr.send();
}

function updatePOTotals() {
	let qty, unit, discount = 0.0, subtotal = 0.0;
	
	$('tbody tr').each(function(i, e) {
		qty = Number.parseFloat(e.querySelectorAll('input')[0].value);
		unit = Number.parseFloat(e.querySelectorAll('input')[1].value.replace(',', ''));
		subtotal += qty * unit;
		discount += qty * unit * (Number.parseFloat(e.querySelectorAll('input')[2].value) / 100);
	});
	let nettotal = $.map($('.inputPOTotal'), function (e) {return e.value.replace(',', '');})
			.reduce((acc, e) => acc + Number.parseFloat(e), 0.0);
	$("#inputPOSub").val(subtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
	$("#inputPOTotalDisc").val(discount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
	$("#inputPONet").val(nettotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
}

function updateSOTotals() {
	let qty, unit, discount = 0.0, subtotal = 0.0, adj;
	
	$('tbody tr').each(function(i, e) {
		qty = Number.parseFloat(e.querySelectorAll('input')[0].value);
		unit = Number.parseFloat(e.querySelectorAll('input')[1].value.replace(',', ''));
		subtotal += qty * unit;
		discount += qty * unit * (Number.parseFloat(e.querySelectorAll('input')[2].value) / 100);
	});
	adj = !isNaN(Number.parseFloat($('#inputSOAdj').val())) ? Number.parseFloat($('#inputSOAdj').val()) : 0.0;
	console.log(adj);
	let nettotal = $.map($('.inputSOTotal'), function (e) {return e.value.replace(',', '');})
			.reduce((acc, e) => acc + Number.parseFloat(e), 0.0);
	nettotal -= adj;
	$("#inputSOSub").val(subtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
	$("#inputSOTotalDisc").val(discount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
	$("#inputSOFinalAdj").val(adj.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
	$("#inputSONet").val(nettotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
}

function trimArr(arr) {
	arr.forEach(e => e.value = validator.trim(e.value));
}


let isFilter = true, grp = 0;

$(document).ready(function() {
	// Call the dataTables jQuery plugin
	$('#datatable').dataTable();
	$('#report').dataTable({
		'iDisplayLength': 100
	});

	$("#myInput").on("keyup", function() {
		var value = $(this).val().toLowerCase();
		$(".dropdown-menu li").filter(function() {
			$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
		});
	});

	if (window.location.pathname === "/inventoryreport") {
		let elem = $("#groupnum");
		let str = "00: Adaptor\n01: Aero Bar\n02: Bar Tape\n04: Bell\n05: Bike Bag\n" +
				"06: Bike Light\n07: Bike Racks\n08: Bottle\n09: Bottle Cage\n10: B" +
				"ottom Bracket\n11: Brakes\n12: Cable\n13: Cage Storage\n14: Calipe" +
				"r Road\n15: Chain\n16: Chain Catcher\n17: Chain Guide\n18: Crankse" +
				"t\n19: Drop Out\n21: Frame\n22: Free Hub\n23: Front Derailleur\n24" +
				": Group Set\n25: Handle Bar\n26: Handle Grip\n27: Headset\n28: Hel" +
				"met\n29: Hub\n30: Lube\n33: Others\n34: Patch\n35: Pedal\n36: Pull" +
				"ey\n37: Pump\n39: Rebuild Kit\n40: STI\n41: Sealant\n42: Seat Clam" +
				"p\n43: Seat Post\n45: Shoe Cover\n46: Skewer\n47: Spacer\n48: Spee" +
				"dometer\n49: Sprocket\n51: Tire\n52: Tools\n53: Tube\n54: Tubeless" +
				" Valve\n55: Unit\n56: Valve Extender";
		str.split("\n").forEach(e => elem.append("<option value=\"" + e.split(": ")[0] + "\">" + e + "</option>"));
	}
	
	$("select#groupnum").change(function() {
		console.log($(this).val());
		group($(this).val());
	});
	
	$("button#filterbutton").click(function() {
		isFilter = !isFilter;
		console.log(isFilter);
		if (isFilter) {
			$(this).css("background-color", "white");
			$(this).css("color", "black");
			$(".notLowQty").each(function(i, elem) {
				$(elem).css("display", "");
			});
		}
		else {
			$(this).css("background-color", "#F50506");
			$(this).css("color", "white");
			$(".notLowQty").each(function(i, elem) {
				$(elem).css("display", "none");
			});
		}
	});
});

function validateOrder(order, type) {
	// check if all req fields have content
	let vals = Object.values(order), checks = Array(8).fill(true), err = "";
	for (let i = vals.length-1; i > vals.length-7; i--)
		if (vals[i] === null || validator.isEmpty(vals[i])) checks[0] = false;
	if (!checks[0]) err += "Please fill in all required fields.\n";
	
	// check contents of items
	order.items.forEach(e => {
		console.log(e);
		if (validator.isEmpty(e.product))
			checks[1] = false;
		if (validator.isEmpty(e.discount) || !validator.isFloat(e.discount))
			checks[2] = false;
		if (validator.isEmpty(e.qty) || !validator.isInt(e.qty, {min: 1}))
			checks[3] = false;
	});
	if (!checks[1]) err += "Please fill in all product rows.\n";
	if (!checks[2]) err += "Please fill discounts with valid numbers.\n";
	if (!checks[3]) err += "Please fill quantities with valid numbers.\n";
	
	// check if expectedDelivery is after paymentDue and dateOrdered
	if (Date.parse(order.paymentDue) - Date.parse(order.dateOrdered) < 0) {
		checks[4] = false;
		err += "Payment due date must be after date ordered.\n";
	}
	if (Date.parse(order.expectedDelivery) - Date.parse(order.paymentDue) < 0) {
		checks[5] = false;
		err += "Expected delivery date must be after payment due date.\n";
	}
	
	if (type === "SO") {
		// must be numbers: adjustment (SO)
		if (!validator.isEmpty(order.adjustment) && !validator.isInt(order.adjustment)) {
			checks[6] = false;
			err += "Adjustment must be a valid number.\n";
		}
		
		// checking quantity doesn't exceed stocks
		$(".currentQtySpan").each(function(i, elem) {
			if (order.items[i].qty > Number.parseInt(elem.textContent.split(' ')[0])) {
				checks[7] = false;
			}
		});
		if (!checks[7]) err += "Quantity of products must not exceed available stocks.\n";
	}
	
	// returning
	if (!checks.every(Boolean)) alert(err);
	return checks.every(Boolean);
}

function group(grp) {
	$('tbody tr').each(function(i, element) {
		element.style.display = "";
		if(grp !== "-1" && !element.classList.contains('g' + grp))
			element.style.display = "none";
	});
}

function downloadCSV(csv, filename) {
	var csvFile;
	var downloadLink;
	// CSV file
	csvFile = new Blob([csv], {type: "text/csv"});
	// Download link
	downloadLink = document.createElement("a");
	// File name
	downloadLink.download = filename;
	// Create a link to the file
	downloadLink.href = window.URL.createObjectURL(csvFile);
	// Hide download link
	downloadLink.style.display = "none";
	// Add the link to DOM
	document.body.appendChild(downloadLink);
	// Click download link
	downloadLink.click();
}

function exportTableToCSV(filename) {
	var csv = [];
	var rows = document.querySelectorAll("table tr");
	for (var i = 1; i < rows.length; i++) {
		var row = [], cols = rows[i].querySelectorAll("td, th");
		for (var j = 0; j < cols.length; j++) 
			row.push(cols[j].innerText);
		csv.push(row.join(","));
	}
	// Download CSV file
	downloadCSV(csv.join("\n"), filename);
}

function printDiv(div) {
	var printContents = document.getElementById(div).innerHTML;
	var original = document.body.innerHTML;
	document.body.innerHTML = printContents;
	window.print();
	document.body.innerHTML = original;
}
