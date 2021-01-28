const express = require('express');
const router = express();
const test = require('../controller/indexTest');
const gpController = require('../controller/gpController');
const gpMiddleware = require('../middlewares/gpMiddleware');

// Testing Routes; SANDBOXING PURPOSES ONLY
router.get('/test', test.getHome);
router.get('/ADD_ITEMGROUPS', test.addItemGroups);



// GET Routes
router.get('/', gpController.getHome);
router.get('/login', gpController.getLogin);
router.get('/customers', gpController.getAllCustomers);
router.get('/suppliers', gpController.getAllSuppliers);
router.get('/users', gpController.getAllUsers);
router.get('/addUser', gpController.getAddUser);
router.get('/inventory', gpController.getInventory);
router.get('/addPO');
router.get('/addSO');
router.get('/addProduct', gpController.getAddProduct);
router.get('/addCustomer', gpController.getAddCustomer);
router.get('/addSupplier', gpController.getAddSupplier);



// POST Routes
router.post('/login', gpMiddleware.validateLogin, gpController.postLogin);
router.post('/logout', gpController.postLogout);
router.post('/addUser', gpMiddleware.validateAddUser, gpController.postAddUser);
router.post('/addPO');
router.post('/addSO');
router.post('/addItemGroup', gpController.postAddItemGroup);
router.post('/addProduct');
router.post('/addCustomer', gpController.postAddCustomer);
router.post('/addSupplier', gpController.postAddSupplier);



// Error Page
router.get('*', function(req, res) {
	res.render('error', {
		title: 'Page not found',
		code: 404,
		message: 'Page not found'
	});
});

module.exports = router;
