// JSONデータを元に情報を取得するゲームの分だけsocketを待ち受け状態にする
$(function() {
  var socket = io.connect({'reconnect': true});
  // 接続時に既存の要素は一旦削除
  socket.on('connect', function(data) {
    $('ul').children().remove();
    console.log('delete');
      $.getJSON("/json/config.json", function(data) {
        $.each(data.games, function(key, val) {
          socket.on(val.eventname, function(info) {
            console.log('msg');
            $('ul#' + val.id).prepend('<li class="list-group-item"> '+ info + '</li>');
          });
        });
      });
  });

});