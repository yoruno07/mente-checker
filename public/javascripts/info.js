// JSONデータを元に情報を取得するゲームの分だけsocketを待ち受け状態にする
$(function() {
  var socket = io.connect();
  socket.on('connect', function() {
    // 接続時に既存の要素は一旦削除
    $('ul').children().remove();
    // 初回接続時にサーバー側に合図を送る
    socket.emit("first", "first-connect");
  });

  $.getJSON("/json/config.json", function(jsondata) {
    $.each(jsondata.games, function(key, val) {
        socket.on(val.eventname, function(info) {
          $('ul#' + val.id).prepend('<li class="list-group-item"> '+ info + '</li>');
        });
    });
  });

   // 追加ソケット処理（モーダルで追加が選ばれた時に発火）
   $(document).on('click', "#add-card-submit", function(){
      $.getJSON("/json/config.json", function(jsondata) {
        $.each(jsondata.games, function(key, val) {
          // 選択されているゲームのIDを取得し、対応するカードを追加
          if ('add-'+val.id === $("#add-card-select option:selected").attr("id")) {
            var card_html = '<div class="col sortable-card"><div class="card"><div class="card-header">'+val.name+'<a href="'+jsondata.twitter_url+val.account+'"  target=”_blank”><img src="/images/twitter.png" alt="twitter" class="twitter-icon"></a></div><ul class="list-group list-group-flush info-list" id="'+val.id+'"></ul></div></div>';
            $('.empty-card').before(card_html);
            // サーバー側にカード追加の合図を送る
            socket.emit("add-card", val.id);
            return false;
          }
        });
      });
  });

  // APIエラー受取
  socket.on('error', function(err) {
    if (!($('#err-disp').length)) {
      var errmsg = '';
      console.log(err);
      if (err.statusCode===429) {
        errmsg = 'APIリクエストの上限に達しました。しばらく時間を置いて後、更新をしてください。';
      } else if (err.columnNumber===7328) {
        errmsg = 'socketの通信が切断されました。もう一度更新をしてください。';
      }  else {
        errmsg = err.message;
      }
      $('#desc').after('<div class="alert alert-danger" role="alert" id="err-disp">'+errmsg+'</div>');
    }
  });
  // APIエラー解除受取
  socket.on('no-error', function(err) {
    $('#err-disp').remove();
  });
});