// 各メンテ情報をドラッグで場所を並び替えられるようにする（スマホ以外）
if (!navigator.userAgent.match(/(iPhone|iPod|Android)/)) {
    $(function() {
      $(".card-columns").sortable({
        item: ".card",
        cursor: "move",
        opacity: "0.7",
        connectWith:".card-columns"
      });
    });
}