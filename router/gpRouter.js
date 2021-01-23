const express = require('express');
const router = express();
const test = require('../controller/indexTest');
const gpController = require('../controller/gpController');
const gpMiddleware = require('../middlewares/gpMiddleware');

// Testing Routes; SANDBOXING PURPOSES ONLY
router.get('/test', test.getHome);

// GET Routes
router.get('/login', gpController.getLogin);
router.post('/adduser', gpController.getAddUser);

// POST Routes
router.post('/login', gpMiddleware.validateLogin, gpController.postLogin);
router.post('/logout', gpController.postLogout);
router.post('/adduser', gpMiddleware.validateAddUser, gpController.postAddUser);

// Error Page
router.get('*', function(req, res) {
	res.render('error', {
		title: 'Page not found',
		code: 404,
		message: 'Page not found'
	});
});

module.exports = router;
