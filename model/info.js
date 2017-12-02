var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../public/json/config');

var Info = new Schema({
  game_id: String,
  tweet_id: Number,
  content: String,
  tweeted_at: Date
});

// MongoDBへの接続
mongoose.connect('mongodb://' + process.env.DB_URL + '/' + config.db_name);
// スキーマからモデルをコンパイルし、モデルをエクスポートする
exports.Info = mongoose.model('info', Info);