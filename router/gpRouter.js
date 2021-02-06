const express = require('express');
const router = express();
const test = require('../controller/indexTest');
const gpController = require('../controller/gpController');
const gpMiddleware = require('../middlewares/gpMiddleware');



// Testing Routes; SANDBOXING PURPOSES ONLY
router.get('/test', test.getHome);
router.get('/ADD_STUFF', test.getItemGroups);
router.get('/check_suppl', test.getJoinedSuppliers);



// GET Routes
router.get('/', gpController.getHome);
router.get('/login', gpController.getLogin);
router.get('/customers', gpController.getAllCustomers);
router.get('/suppliers', gpController.getAllSuppliers);
router.get('/users', gpController.getAllUsers);
router.get('/allproducts', gpController.getInventory);
router.get('/allgroups', gpController.getGroups);
router.get('/allgroupproducts/:index', gpController.getGroupInventory);
router.get('/inventoryreport', gpController.getInventoryReport);
router.get('/salesreport', gpController.getSalesReport);

	// Add Routes
router.get('/addUser', gpController.getAddUser);
router.get('/addProduct', gpController.getAddProduct);
router.get('/addCustomer', gpController.getAddCustomer);
router.get('/addSupplier', gpController.getAddSupplier);

	// Product Routes
router.get('/viewproduct/:code', gpController.getProductPage);
router.get('/adjustproduct/:code', gpController.getAdjustProduct);
router.get('/editproduct/:code', gpController.getEditProduct);

	// SOPO Routes
router.get('/newPO', gpController.getNewPO);
router.get('/newSO', gpController.getNewSO);
router.get('/salesorders', gpController.getAllSalesOrders);
router.get('/purchorders', gpController.getAllPurchOrders);
router.get('/viewPO/:ordNum', gpController.getPurchaseOrder);
router.get('/viewSO/:ordNum', gpController.getSalesOrder);
router.get('/paysopo/:ordNum*', gpController.getPaySOPO);
router.get('/drsopo/:ordNum*', gpController.getDelRecSOPO);
router.get('/viewallsopo*', gpController.getViewAllSOPO);

	// AJAX Routes
router.get('/getItemAJAX', gpController.getItemAJAX);
router.get('/getSupplProds', gpController.getSupplOrds);
router.get('/getSalesOrderAJAX', gpController.getSalesOrderAJAX);
router.get('/getDashboardCards', gpController.getDashboardCards);

// NO LONGER IMPLEMENTED
// router.get('/confirmpo', gpController.getConfirmPO);
// router.get('/confirmso', gpController.getConfirmSO);



// POST Routes
router.post('/login', gpMiddleware.validateLogin, gpController.postLogin);
router.post('/logout', gpController.postLogout);
router.post('/addUser', gpMiddleware.validateAddUser, gpController.postAddUser);
router.post('/newPO', gpController.postNewPO);
router.post('/newSO', gpController.postNewSO);
router.post('/addProduct', gpController.postAddProduct);
router.post('/addCustomer', gpController.postAddCustomer);
router.post('/addSupplier', gpController.postAddSupplier);
router.post('/editproduct/:code', gpController.postEditProduct);
router.post('/adjustproduct/:code', gpController.postAdjustProduct);

router.post('/cancelSOPO', gpController.postCancelOrder);
router.post('/paySOPO', gpController.postPayOrder);
router.post('/confPO', gpController.postConfOrder);
router.post('/delrecSOPO', gpController.postDelRecOrder);
router.post('/pickupSO', gpController.postPickupOrder);



// NO LONGER IMPLEMENTED
// router.post('/addItemGroup', gpController.postAddItemGroup);



// Error Page
router.get('*', function(req, res) {
	res.render('error', {
		title: 'Page not found',
		code: 404,
		message: 'Page not found'
	});
});

module.exports = router;
