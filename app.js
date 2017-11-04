var express = require('express');
var path = require('path');
var routes = require('./routes/index');
var bodyParser = require('body-parser');
var Twit = require('twit');

var app = express();

var options = {
  token: process.env.ACCESS_TOKEN,
  token_secret: process.env.ACCESS_TOKEN_SECRET,
  key: process.env.CONSUMER_KEY,
  secret: process.env.CONSUMER_SECRET
};
app.set('options', options);

var T = new Twit({
  consumer_key: options.key,
  consumer_secret: options.secret,
  access_token: options.token,
  access_token_secret: options.token_secret
});

console.log(T.getAuth());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('port', (process.env.PORT || 3000));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

app.listen(app.get('port'), function () {
  console.log('listening on port ' +  app.get('port'));
});

// module.exports = Twitter;