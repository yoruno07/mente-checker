var express = require('express');
var router = express.Router();
var config = require('../public/json/config');

router.get('/', function(req, res, next) {
  res.render('index',
    {title : config.sitename,
    games: config.games}
  );
});

module.exports = router;