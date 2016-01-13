'use strict';

var express = require('express')
    , app = express()
    , server = require('http').createServer(app);

server.listen(4000);

app.use(express.static(__dirname));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
