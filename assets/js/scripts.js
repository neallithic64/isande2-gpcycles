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
	$('#dataTable').DataTable();
	
	if (window.location.pathname === '/newPO' || window.location.pathname === '/newSO')
		$(':input[type="date"]').val(new Date().toISOString().substr(0, 10));
	
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
					alert(str.responseText);
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
					window.location.href = '/';
				},
				error: function(str) {
					alert(str.responseText);
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
					window.location.href = '/';
				},
				error: function(str) {
					alert(str.responseText);
				}
			});
		}
	});
	
	$('button#submitAddProduct').click(function() {
		let addProductForm = $('form#addProduct').serializeArray();
		trimArr(addProductForm);
		var checks = Array(8).fill(true);
		
		checks[0] = addProductForm.some(e => validator.isEmpty(e.value)) ? false : true;
		if (!checks[0]) alert('Please fill in all fields.');

		if (Number.parseFloat(addProductForm[4].value.replace(',', '')) < 0) {
			checks[1] = false;
			alert('Price should be a valid amount.');
		}
		
		if (Number.parseFloat(addProductForm[5].value.replace(',', '')) < 0) {
			checks[2] = false;
			alert('Price should be a valid amount.');
		}

		if (!validator.isInt(addProductForm[7].value, {min: 0})) {
			checks[3] = false;
			alert('Starting quantity should be a whole positive number.');
		}

		if (!validator.isInt(addProductForm[8].value, {min: 0})) {
			checks[4] = false;
			alert('Reorder point should be a whole positive number.');
		}

		if (!validator.isInt(addProductForm[9].value, {min: 1})) {
			checks[5] = false;
			alert('Reorder quantity should be a whole positive number.');
		}

		if (!validator.isInt(addProductForm[10].value, {min: 1})) {
			checks[6] = false;
			alert('Minimum discount quantity should be a whole positive number.');
		}

		if (!validator.isInt(addProductForm[11].value, {min: 0, max: 100})) {
			checks[7] = false;
			alert('Percentage discount should be from 0 to 100.');
		}
		
		if (checks.every(Boolean)) {
			$.ajax({
				method: 'POST',
				url: '/addProduct',
				data: addProductForm,
				success: function() {
					window.location.href = '/';
				},
				error: function(str) {
					alert(str.responseText);
				}
			});
		}
	});
	
	$('button#POaddItem').click(function() {
		$('table#POItems tbody').append("<tr>" + $('tbody tr')[0].innerHTML + "</tr>");
	});
	
	$('button#SOaddItem').click(function() {
		$('table#SOItems tbody').append("<tr>" + $('tbody tr')[0].innerHTML + "</tr>");
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
				alert(str.responseText);
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
			},
			error: function(str) {
				alert(str.responseText);
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
		$.ajax({
			method: 'POST',
			url: '/newPO',
			data: data,
			success: function() {
				window.location.href = '/viewallsopo?ordertype=PO';
			},
			error: function(str) {
				alert(str.responseText);
			}
		});
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
			status: "Paid",
			supplier: $("#inputPOName").val(),
			dateOrdered: $("#inputPODate").val(),
			paymentTerms: $("#inputPOTerms").val(),
			paymentDue: $("#inputPOPayDue").val(),
			expectedDelivery: $("#inputPODelDate").val()
		};
		$.ajax({
			method: 'POST',
			url: '/newPO',
			data: data,
			success: function() {
				window.location.href = '/viewallsopo?ordertype=PO';
			},
			error: function(str) {
				alert(str.responseText);
			}
		});
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
			status: "Confirmed",
			supplier: $("#inputPOName").val(),
			dateOrdered: $("#inputPODate").val(),
			paymentTerms: $("#inputPOTerms").val(),
			paymentDue: $("#inputPOPayDue").val(),
			expectedDelivery: $("#inputPODelDate").val()
		};
		$.ajax({
			method: 'POST',
			url: '/newPO',
			data: data,
			success: function() {
				window.location.href = '/viewallsopo?ordertype=PO';
			},
			error: function(str) {
				alert(str.responseText);
			}
		});
	});
	
	$('tbody').on("change", ':input[type="number"]', function() {
		if (window.location.pathname === '/newPO') {
			try {
				let currElem = $(this),
					qty = Number.parseFloat(currElem.closest('tr').find('.inputPOQty').val()),
					unit = Number.parseFloat(currElem.closest('tr').find('.inputPOUnit').val().replace(',', '')),
					discount = Number.parseFloat(currElem.closest('tr').find('.inputPODiscount').val());
				if (Number.isNaN(discount)) discount = 0;
				currElem.closest('tr').find('.inputPOTotal').val((qty * unit * (1 - (discount / 100))).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
				updatePOTotals();
			} catch (e) {
				console.log(e);
				alert('error! check console.');
			}
		} else {
			try {
				let currElem = $(this),
					qty = Number.parseFloat(currElem.closest('tr').find('.inputSOQty').val()),
					unit = Number.parseFloat(currElem.closest('tr').find('.inputSOUnit').val().replace(',', '')),
					discount = Number.parseFloat(currElem.closest('tr').find('.inputSODiscount').val());
				if (Number.isNaN(discount)) discount = 0;
				currElem.closest('tr').find('.inputSOTotal').val((qty * unit * (1 - (discount / 100))).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
				updateSOTotals();
			} catch (e) {
				console.log(e);
				alert('error! check console.');
			}
		}
	});
	
	$('tbody').on("change", '.inputSOQty', function() {
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
				discount: e.children[3].children[0].children[0].value
			});
		});
		let data = {
			items: products,
			conditions: $("#inputSOCons").val(),
			remarks: $("#inputSORemarks").val(),
			adjustment: $("#inputSOAdj").val(),
			status: $("#inputSOMode").val() === "Delivery" ? "To Deliver" : "For Pickup",
			customer: $("#inputSOName").val(),
			dateOrdered: $("#inputSODate").val(),
			paymentTerms: $("#inputSOTerms").val(),
			paymentDue: $("#inputSOPayDue").val(),
			deliveryMode: $("#inputSOMode").val(),
			expectedDelivery: $("#inputSODelDate").val()
		};
		$.ajax({
			method: 'POST',
			url: '/newSO',
			data: data,
			success: function() {
				window.location.href = '/viewallsopo?ordertype=SO';
			},
			error: function(str) {
				alert(str.responseText);
			}
		});
	});
	$("#SOSubmitConfPay").click(function() {
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
			conditions: $("#inputSOCons").val(),
			remarks: $("#inputSORemarks").val(),
			adjustment: $("#inputSOAdj").val(),
			status: "Fulfilled",
			customer: $("#inputSOName").val(),
			dateOrdered: $("#inputSODate").val(),
			paymentTerms: $("#inputSOTerms").val(),
			paymentDue: $("#inputSOPayDue").val(),
			deliveryMode: $("#inputSOMode").val(),
			expectedDelivery: $("#inputSODelDate").val()
		};
		$.ajax({
			method: 'POST',
			url: '/newSO',
			data: data,
			success: function() {
				window.location.href = '/viewallsopo?ordertype=SO';
			},
			error: function(str) {
				alert(str.responseText);
			}
		});
	});
	
	
	
	// STATUS UPDATE FUNCTIONS
	
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
				alert(str.responseText);
			}
		});
	});
});

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
					alert(str.responseText);
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
					alert(str.responseText);
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
