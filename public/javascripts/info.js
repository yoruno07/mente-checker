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
});