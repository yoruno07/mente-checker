var express = require('express');
var path = require('path');
var routes = require('./routes/index');
var bodyParser = require('body-parser');
var twit = require('twit');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

app.listen(process.env.PORT || 3000, function () {
  console.log('listening on port ' + process.env.PORT);
});


// コマンドライン引数をキーワードとして検索する
// var keyword = process.argv[2];
// var from_account = process.argv[3];

// var keyword = "メンテナンス";
// var from_account = "fgoproject";

// console.log("「" + keyword + "」" + "についてtwitter検索します");

// twitter.get('search/tweets', { q: keyword, count: 20 }, function(err, data, response) {
// twitter.get('search/tweets', { q: keyword + ' from:' + from_account, count: 20 }, function(err, data, response) {
//  if  (err) {
//     return console.log("ERROR: " + err);
//  }
//   var statuses = data.statuses;
//   var max_count = statuses.length;
//   console.log(max_count);
//   for (i=0; i < max_count; i++) {
//     console.log(statuses[i].text);
//     console.log("---------------------------------------------------------");
//   }
// });

// var stream = twitter.stream('statuses/filter', {track: keyword});

// stream.on('tweet', function(tweet){
//   var text = tweet.text;
//   var user_name = tweet.user.name;
//   console.log("ユーザー名: " + user_name + "\nツイート: " + text);
//   console.log("=========================================================");
// });