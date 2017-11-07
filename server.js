var http = require('http');
var app = require('./app');
var modules = require('./module');
var config = require('./public/json/config');

var T = modules.twitter;

server = http.createServer(app).listen(app.get('port'),function()
{
  console.log('listening on port ' +  app.get('port'));
});

var io = require('socket.io')(server);
var games = config.games;
var checkers = [];

class Checker {
  constructor(acc, kw, et) {
    this._account = acc;
    this._keywords = kw;
    this._eventname = et;
    this._last_id = "";
  }

  get account() {
    return this._account;
  }
  get keywords() {
    return this._keywords;
  }
  get eventname() {
    return this._eventname;
  }
  get last_id() {
    return this._last_id;
  }

  set account(acc) {
    this._account = acc;
  }
  set keywords(kw) {
    this._keywords = kw;
  }
  set eventname(et) {
    this._eventname = et;
  }
  set last_id(id) {
    this._last_id = id;
  }
}

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