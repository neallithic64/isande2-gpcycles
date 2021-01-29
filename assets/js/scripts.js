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
	
});
    
function logout() {
	let xhr = new XMLHttpRequest();
	xhr.open('POST', '/logout');
	xhr.onreadystatechange = (() => {
		if (xhr.readyState === 4 && xhr.status) window.location.href = "/login";
	});
	xhr.send();
}
