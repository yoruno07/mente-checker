var express = require('express');
var router = express.Router();
var config = require('../public/json/config');

router.get('/', function(req, res, next) {
  res.render('index',
    {title : config.sitename,
    description : config.description,
    twitter_url : config.twitter_url,
    no_data_text : config.no_data_text,
    games: config.games}
  );
});

module.exports = router;