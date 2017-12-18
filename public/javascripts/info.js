// JSONデータを元に情報を取得するゲームの分だけsocketを待ち受け状態にする
$(function() {
  var socket = io.connect();
  socket.on('connect', function() {
    // 接続時に既存の要素は一旦削除
    $('li:not(.no-data)').remove();
    // 初回接続時にサーバー側に合図を送る
    socket.emit('first', 'first-connect');
  });

  var status_url = '';
  $.getJSON('/json/config.json', function(jsondata) {
    $.each(jsondata.games, function(key, val) {
        socket.on(val.eventname, function(info) {
          // tweetへのリンク先を生成
          status_url = jsondata.twitter_url+val.account+'/status/'+info.id_str;
          // tweetを取得できた場合はno-data時のテキストを削除
          $('div#' + val.id).find('li.no-data').remove();
          // listとしてカード内に情報を追加
          $('div#' + val.id).children('ul.info-list').prepend('<li class="list-group-item"> '+info.text+'<br /><a href="'+status_url+'" class="card-link" target=”_blank”>'+info.date+'</a></li>');
        });
    });
  });

   // 追加ソケット処理（モーダルで追加が選ばれた時に発火）
   $('#add-card-submit').on('click', function(){
      $.getJSON('/json/config.json', function(jsondata) {
        $.each(jsondata.games, function(key, val) {
          // 選択されているゲームのIDを取得し、対応するカードを追加
          if ('add-'+val.id === $('#add-card-select').val()) {
            var card_html = '<div class="card" id="'+val.id+'"><div class="card-header"><i class="fa fa-times-circle-o fa-lg close-icon" aria-hidden="true"></i><span class="card-name">'+val.name+'</span><a href="'+jsondata.twitter_url+val.account+'"  target=”_blank”><img src="/images/twitter.png" alt="twitter" class="twitter-icon"></a></div><ul class="list-group list-group-flush info-list"><li class="list-group-item no-data">'+jsondata.no_data_text+'</li></ul></div>';
            $('.empty-card').before(card_html);
            // サーバー側にカード追加の合図を送る
            socket.emit('add-card', val.id);
            // モーダルから追加したゲームの選択肢にdisabledを追加（二重追加防止）
            $('#add-card-select option:selected').prop('disabled', true);
            // 選択状態を冒頭に戻す
            $('#add-card-select option:first').prop('selected', true);
            // カード追加情報をGAに送信
            gtag('event', 'submit', {'event_category': 'add-card', 'event_label': val.name});

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

    // 閉じたカード情報をGAに送信
    $.getJSON('/json/config.json', function(jsondata) {
      $.each(jsondata.games, function(key, val) {
        if (card_id === val.id) {
          gtag('event', 'click', {'event_category': 'close-card', 'event_label': val.name});
          return false;
        }
      });
    });

   });

  // APIエラー受取
  socket.on('error', function(err) {
    if (!($('#err-disp').length)) {
      var errmsg = '';
      if (err.statusCode===429) {
        errmsg = 'APIリクエストの上限に達しました。しばらく時間を置いて後、更新をしてください。';
        gtag('event', 'error-notice', {'event_category': 'error', 'event_label': 'APIリクエスト上限エラー'});
      } else if (err.columnNumber===7328) {
        errmsg = 'socketの通信が切断されました。もう一度更新をしてください。';
        gtag('event', 'error-notice', {'event_category': 'error', 'event_label': 'socket通信切断エラー'});
      }  else {
        errmsg = 'その他不明なエラーが発生しています。もう一度更新をしてください。';
        gtag('event', 'error-notice', {'event_category': 'error', 'event_label': 'その他不明なエラー'});
        console.log(err);
      }
      $('#desc').after('<div class="alert alert-danger" role="alert" id="err-disp">'+errmsg+'</div>');
    }
  });
  // APIエラー解除受取
  socket.on('no-error', function(err) {
    $('#err-disp').remove();
  });
});