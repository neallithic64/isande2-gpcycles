const express = require('express');
const router = express();
const test = require('../controller/indexTest');
const gpController = require('../controller/gpController');
const gpMiddleware = require('../middlewares/gpMiddleware');

// Testing Routes; SANDBOXING PURPOSES ONLY
router.get('/test', test.getHome);



// GET Routes
router.get('/', gpController.getHome);
router.get('/login', gpController.getLogin);
router.get('/adduser', gpController.getAddUser);
router.get('/addPO');
router.get('/addSO');
router.get('/addProduct');
router.get('/addCustomer', gpController.getAddCustomer);
router.get('/addSupplier', gpController.getAddSupplier);



// POST Routes
router.post('/login', gpMiddleware.validateLogin, gpController.postLogin);
router.post('/logout', gpController.postLogout);
router.post('/adduser', gpMiddleware.validateAddUser, gpController.postAddUser);
router.post('/addPO');
router.post('/addSO');
router.post('/addItemGroup', gpController.postAddItemGroup);
router.post('/addProduct');
router.post('/addCustomer', gpController.postAddCustomer);
router.post('/addSupplier', gpController.postAddSupplier);



// Error Page
router.get('*', function(req, res) {
//	res.render('error', {
//		title: 'Page not found',
//		code: 404,
//		message: 'Page not found'
//	});
	res.send('error');
});

module.exports = router;
