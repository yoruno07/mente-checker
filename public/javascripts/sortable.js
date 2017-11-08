// 各メンテ情報をドラッグで場所を並び替えられるようにする
$(function() {
  $(".sortable").sortable({
    item: ".sortable-card",
    cursor: "move",
    opacity: "0.7",
    connectWith:".sortable"
  });
});