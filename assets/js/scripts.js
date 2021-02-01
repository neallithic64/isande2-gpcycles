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

	if (window.location.pathname === "/viewPO" || window.location.pathname === "/viewSO") {
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



function trimArr(arr) {
	arr.forEach(e => e.value = validator.trim(e.value));
}

$(document).ready(function() {
	// Call the dataTables jQuery plugin
	$('#dataTable').DataTable();
	
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
