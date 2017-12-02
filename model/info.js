var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../public/json/config');

var Info = new Schema({
  game_id: String,
  tweet_id: Number,
  content: String,
  tweeted_at: Number
});

// MongoDBへの接続
mongoose.connect(process.env.MONGODB_URI);
// スキーマからモデルをコンパイルし、モデルをエクスポートする
exports.Info = mongoose.model('info', Info);