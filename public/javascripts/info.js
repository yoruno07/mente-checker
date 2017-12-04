// JSONデータを元に情報を取得するゲームの分だけsocketを待ち受け状態にする
$(function() {
  var socket = io.connect();
  socket.on('connect', function() {
    // 接続時に既存の要素は一旦削除
    $('ul').children().remove();
    // 初回接続時にサーバー側に合図を送る
    socket.emit('first', 'first-connect');
  });

  $.getJSON('/json/config.json', function(jsondata) {
    $.each(jsondata.games, function(key, val) {
        socket.on(val.eventname, function(info) {
          $('div#' + val.id).children('ul.info-list').prepend('<li class="list-group-item"> '+ info + '</li>');
        });
    });
  });

   // 追加ソケット処理（モーダルで追加が選ばれた時に発火）
   $('#add-card-submit').on('click', function(){
      $.getJSON('/json/config.json', function(jsondata) {
        $.each(jsondata.games, function(key, val) {
          // 選択されているゲームのIDを取得し、対応するカードを追加
          if ('add-'+val.id === $('#add-card-select').val()) {
            var card_html = '<div class="card" id="'+val.id+'"><div class="card-header"><i class="fa fa-times-circle-o fa-lg close-icon" aria-hidden="true"></i><span class="card-name">'+val.name+'</span><a href="'+jsondata.twitter_url+val.account+'"  target=”_blank”><img src="/images/twitter.png" alt="twitter" class="twitter-icon"></a></div><ul class="list-group list-group-flush info-list"></ul></div>';
            $('.empty-card').before(card_html);
            // サーバー側にカード追加の合図を送る
            socket.emit('add-card', val.id);
            // モーダルから追加したゲームの選択肢にdisabledを追加（二重追加防止）
            $('#add-card-select option:selected').prop('disabled', true);
            // 選択状態を冒頭に戻す
            $('#add-card-select option:first').prop('selected', true);
            return false;
          }
        });
      });
  });

   // カードが閉じられた時の処理
   $(document).on('click', '.close-icon', function(){
    var card_id = $(this).closest('.card').attr('id');
    $('#'+card_id).remove();
    // 閉じたカードの選択肢のdisabledを削除
    $('#add-card-select').children('[value=add-'+card_id+']').prop('disabled', false);
   });

  // APIエラー受取
  socket.on('error', function(err) {
    if (!($('#err-disp').length)) {
      var errmsg = '';
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