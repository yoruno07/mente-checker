var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var app =  express();

// appの設定
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('port', (process.env.PORT || 3000));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// server.jsでサーバー起動とsocket使用
module.exports = app;
require('./server');