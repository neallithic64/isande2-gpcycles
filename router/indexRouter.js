const express = require('express');
const router = express();
const test = require('../controller/indexTest');

// Testing Routes
router.get('/test', test.getHome);
router.post('/test', test.postGenDocs);

// Error Page
router.get('*', function(req, res) {
	res.render('error', {
		title: 'Page not found',
		code: 404,
		message: 'Page not found',
		showNav: true
	});
});

module.exports = router;
