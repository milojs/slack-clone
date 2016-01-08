'use strict';

var express = require('express')
    , app = express()
    , server = require('http').createServer(app)
    , io = require('socket.io')(server)
    , db = require('./server/db')
    , milo = require('milo-core');

server.listen(4000);

app.use(express.static(__dirname));

io.on('connection', function (socket){
    console.log('a user connected');
    socket.emit('db', { data: db.get() });

    socket.on('datachanges', function (msg) {
        db.postMessageSync('changedata', msg.data);
        socket.broadcast.emit('datachanges', msg);
    });
});
