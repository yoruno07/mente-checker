var express = require('express');
var router = express.Router();
var modules = require('../module');

var T = modules.twitter;

console.log(T);
console.log(T.getAuth());

router.get('/', function(req, res, next) {
    res.render('index',
        {title : 'メンテチェッカー' ,
        content: 'ここにコンテンツを表示'}
    );
});

module.exports = router;