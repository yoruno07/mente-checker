var http = require('http');
var app = require('./app');
var config = require('./public/json/config');
var games = config.games;

var modules = require('./module');
var T = modules.twitter;
var Checker = modules.checker;

server = http.createServer(app).listen(app.get('port'),function()
{
  console.log('listening on port ' +  app.get('port'));
});
var io = require('socket.io')(server);

var checkers = [];

games.forEach(function(val){
  var checker = new Checker(val.account, val.keywords, val.eventname);
  tSetup(checker);
  tstream(checker);
  checkers.push(checker);
});

function tSetup(checker) {
  io.sockets.on('connection', function(socket) {
    socket.on(checker.eventname, function(data) {
      io.sockets.emit(checker.eventname, data);
    });
    // socket接続後に最新のツイートを取得
    tGet(checker, 3);
  });
}

// 3分ごとに最新のツイートを取得し、更新がないか確認
// streamは日本語の検索が未対応のため、searchメソッドを一定時間ごとに叩くことで擬似リアルタイム表示とする
function tstream(checker) {
  setInterval(function(){
                    tGet(checker, 1);
                  }, 180000);
}

// Twitterからテキストを取得してsocketで発信
function tGet(checker, count) {
  var account = checker.account;
  var keyword =  checker.keywords.join(" OR ");
  var eventname = checker.eventname;
  var last_id = checker.last_id;
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
            if (i === 0) checker.last_id = statuses[i].id;
          }
      }
  });
}