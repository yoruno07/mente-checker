var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index',
        {title : 'メンテチェッカー' ,
        content: 'ここにコンテンツを表示'}
    );
});

module.exports = router;