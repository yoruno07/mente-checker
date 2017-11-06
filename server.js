var http = require('http');
var app = require('./app');
var modules = require('./module');

var T = modules.twitter;

server = http.createServer(app).listen(app.get('port'),function()
{
  console.log('listening on port ' +  app.get('port'));
});

var io = require('socket.io')(server);
var keyword = "メンテナンス";
var account = "fgoproject";
var count = 5;
var eventname = 'fgo_info';

// module.exports = io;
io.sockets.on('connection', function(socket) {
  socket.on(eventname, function(data) {
    io.sockets.emit(eventname, data);
  });
  tGet(account, keyword, count, eventname);
});

// Twitterからテキストを取得してsocketで発信
function tGet(account, keyword, count, eventname){
  T.get('search/tweets', { q: keyword + ' from:' + account, count: count}, function(err, data, response) {
       if  (err) {
          return console.log("ERROR: " + err);
       } else {
          var statuses = data.statuses;
          var max_count = statuses.length;
          console.log(max_count);
          for (i=max_count-1; 0 <= i; i--) {
            io.sockets.emit(eventname, statuses[i].text);
            // this.results.push(statuses[i].text);
          }
      }
  });
}

var stream = T.stream('statuses/filter', {track: keyword, follow: account});
stream.on('eventname', function (tweet) {
  var text = "ユーザー名: " + tweet.user.name + "<br/>ツイート: " + tweet.text;
  text += "<br/>=========================================================";
  io.sockets.emit('msg', text);
  console.log(text);
});

// setInterval(function(){
//   io.sockets.emit('msg', "1111111111111111111111111111111<br/><br/><br/>");
// }, 1000);


