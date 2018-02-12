var http = require('http');
var moment = require('moment-timezone');
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

// 初回表示分カード取得
games.forEach(function(val){
  var checker = new Checker(val.account, val.keywords, val.eventname);
  tSetup(checker);
  tstream(checker);
});

// クライアントからカード追加の合図が送られてきたら追加カード分を取得
io.sockets.on('connection', function(socket) {
    socket.on("add-card", function (add_card_id) {
      games.forEach(function(val){
        if (add_card_id === val.id) {
          var checker = new Checker(val.account, val.keywords, val.eventname);
          tAddSetup(checker, socket);
          tstream(checker);
          return false;
        }
      });
    });
});

// 初回接続時取得
function tSetup(checker) {
  io.sockets.on('connection', function(socket) {
      // クライアント側から初回接続の合図を受け取ったら最新のツイートを取得し、そのクライアントに送信
      socket.on("first", function (msg) {
        checker.last_id = ""; // 接続が発生した場合はlast_idを初期化
        tGet(checker, 3, socket.id);
      });
  });
}

// カード追加時初期取得
function tAddSetup(checker, socket) {
    checker.last_id = ""; // 接続が発生した場合はlast_idを初期化
    tGet(checker, 3, socket.id);
}

// 3分ごとに最新のツイートを取得し、更新がないか確認
// streamは日本語の検索が未対応のため、searchメソッドを一定時間ごとに叩くことで擬似リアルタイム表示とする
function tstream(checker) {
  setInterval(function(){
                    tGet(checker, 1, null);
                  }, 180000);
}

// Twitterからテキストを取得してsocketで発信
function tGet(checker, count, socket_id) {
  var account = checker.account;
  var keyword =  checker.keywords.join(" OR ");
  var eventname = checker.eventname;
  var last_id = checker.last_id;
  T.get('search/tweets', { q: keyword + ' from:' + account, count: count}, function(err, data, response) {
       if  (err) {
          // APIエラーが発生した場合はその旨を表示
          io.to(socket_id).emit('error', err);
          return console.log("ERROR: " + err);
       } else {
          // APIエラーが発生しない場合は解消された合図を送る
          io.to(socket_id).emit('no-error', err);
          var statuses = data.statuses;
          var max_count = statuses.length;
          // 古いツイートから順に送信するため逆順で配列を回す
          for (i=max_count-1; 0 <= i; i--) {
            // 前回取得したツイートとidが一致した場合は新しいツイートがないとみなし、発信を行わない（setInterval時用）
            if (statuses[i].id === last_id) break;
            // socketでツイート内容を送信（初回接続の場合はその接続先にのみ送るためid指定で個別に送る）
            if (socket_id !== null) {
              io.to(socket_id).emit(eventname, {id_str: statuses[i].id_str, text: statuses[i].text, date: convertTwitDate(statuses[i].created_at)});
            } else {
              io.sockets.emit(eventname, {id_str: statuses[i].id_str, text: statuses[i].text, date: convertTwitDate(statuses[i].created_at)});
            }
            // 最新のツイートのIDを次回比較用に保持
            if (i === 0) checker.last_id = statuses[i].id;
          }
      }
  });
}

// Twitで取得したtweetの日付をフォーマットとタイムゾーンを表示用に変換する
// ex) Tue Nov 28 09:51:42 +0000 2017 => 2017/11/28 18:51:42
function convertTwitDate(created_at) {
  var monthlist = {'Jan' : '01', 'Feb' : '02', 'Mar' : '03', 'Apr' : '04', 'May' : '05', 'Jun' : '06', 'Jul' : '07', 'Aug' : '08', 'Sep' : '09', 'Oct' : '10', 'Nov' : '11', 'Dec' : '12'};
  var year = created_at.slice(-4);
  var month = monthlist[created_at.slice(4, 7)];
  var day = created_at.slice(8, 10);
  var time = created_at.slice(11, 19);
  // 取得した日付はUTCなのでJSTに変換
  var date = moment(year+'-'+month+'-'+day+'T'+time+'+0000').tz("Asia/Tokyo").format("YYYY/MM/DD HH:mm:ss");
  return date;
}