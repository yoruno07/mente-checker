var express = require('express');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');

var modules = require('./module');
var T = modules.twitter;

var routes = require('./routes/index');

var app =  express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('port', (process.env.PORT || 3000));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

server = http.createServer(app).listen(app.get('port'),function()
{
    console.log('listening on port ' +  app.get('port'));
});

var io = require('socket.io')(server);

io.sockets.on('connection', function(socket) {
  socket.on('msg', function(data) {
    io.sockets.emit('msg', data);
  });
});

var keyword = "FGO";

var stream = T.stream('statuses/filter', {track: keyword});
stream.on('tweet', function (tweet) {
  var text = "ユーザー名: " + tweet.user.name + "<br/>ツイート: " + tweet.text;
  text += "<br/>=========================================================";
    io.sockets.emit('msg', text);
  console.log(text);
});


// stream.on('tweet', function(tweet){
//   var text = tweet.text;
//   var user_name = tweet.user.name;
//   console.log("ユーザー名: " + user_name + "\nツイート: " + text);
//   console.log("=========================================================");
// });

// app.listen(app.get('port'), function () {
//   console.log('listening on port ' +  app.get('port'));
// });