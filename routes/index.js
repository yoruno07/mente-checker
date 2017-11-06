var express = require('express');
var router = express.Router();
// var modules = require('../module');

// var T = modules.twitter;

// var keyword = "メンテナンス";
// var from_account = "fgoproject";

// var results = [];

// var info = T.getAuth();

// T.get('search/tweets', { q: keyword + ' from:' + from_account}, function(err, data, response) {
//      if  (err) {
//         return console.log("ERROR: " + err);
//      }
//       var statuses = data.statuses;
//       var max_count = statuses.length;
//       console.log(max_count);
//       for (i=0; i < max_count; i++) {
//         results.push(statuses[i].text);
//       }
// });


router.get('/', function(req, res, next) {
    res.render('index',
        {title : 'メンテチェッカー'}
    );
});

module.exports = router;