const express = require('express');
const router = express();
const test = require('../controller/indexTest');
const gpController = require('../controller/gpController');
const gpMiddleware = require('../middlewares/gpMiddleware');

// Testing Routes; SANDBOXING PURPOSES ONLY
router.get('/test', test.getHome);



// GET Routes
router.get('/');
router.get('/login', gpController.getLogin);
router.get('/adduser', gpController.getAddUser);
router.get('/addPO');
router.get('/addSO');
router.get('/addProduct');
router.get('/addCustomer');
router.get('/addSupplier');



// POST Routes
router.post('/login', gpMiddleware.validateLogin, gpController.postLogin);
router.post('/logout', gpController.postLogout);
router.post('/adduser', gpMiddleware.validateAddUser, gpController.postAddUser);
router.post('/addPO');
router.post('/addSO');
router.post('/addItemGroup', gpController.postAddItemGroup);
router.post('/addProduct');
router.post('/addCustomer');
router.post('/addSupplier');



// Error Page
router.get('*', function(req, res) {
	res.render('error', {
		title: 'Page not found',
		code: 404,
		message: 'Page not found'
	});
});

module.exports = router;
