// 各メンテ情報をドラッグで場所を並び替えられるようにする
$(function() {
  $(".card-columns").sortable({
    item: ".card",
    cursor: "move",
    opacity: "0.7",
    connectWith:".card-columns"
  });
});