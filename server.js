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
var account = "fgo_project";
var count = 5;
var eventname = 'fgo_info';

var last_id = "";

io.sockets.on('connection', function(socket) {
  socket.on(eventname, function(data) {
    io.sockets.emit(eventname, data);
  });
  // socket接続後に最新のツイートを取得
  tGet(account, keyword, count, eventname);
});

// 1分ごとに最新のツイートを取得し、更新がないか確認
// streamは日本語の検索が未対応のため、searchメソッドを一定時間ごとに叩くことで擬似リアルタイム表示とする
setInterval(function(){
  tGet(account, keyword, 1, eventname);
}, 60000);

// Twitterからテキストを取得してsocketで発信
function tGet(account, keyword, count, eventname) {
  T.get('search/tweets', { q: keyword + ' from:' + account, count: count}, function(err, data, response) {
       if  (err) {
          return console.log("ERROR: " + err);
       } else {
          var statuses = data.statuses;
          var max_count = statuses.length;
          // 古いツイートから順に送信するため逆順で配列を回す
          for (i=max_count-1; 0 <= i; i--) {
            // 前回取得したツイートとidが一致した場合は新しいツイートがないとみなし、発信を行わない（setInterval時用）
            if (statuses[i].id === last_id) break;
            // socketでツイート内容を送信
            io.sockets.emit(eventname, statuses[i].text);
            // 最新のツイートのIDを次回比較用に保持
            if (i === 0) last_id = statuses[i].id;
          }
      }
  });
}

// function tStream(account, keyword, eventname){
//   var stream = T.stream('statuses/filter', {track: keyword});
//   stream.on('tweet', function (tweet) {
//     if (tweet.user.name === account) {
//       var text = "ユーザー名: " + tweet.user.name + "<br/>ツイート: " + tweet.text;
//       text += "<br/>=========================================================";
//       io.sockets.emit(eventname, text);
//       console.log(text);
//     }
//   });
// }
