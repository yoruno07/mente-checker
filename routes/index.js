var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index',
        {title : 'メンテチェッカー',
        eventname: 'fgo_info'}
    );
});

module.exports = router;