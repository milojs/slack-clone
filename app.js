'use strict';

var express = require('express')
    , app = express()
    , server = require('http').createServer(app)
    , io = require('socket.io')(server)
    , db = require('./server/db')
    , milo = require('milo-core');

console.log('Starting app on port 4000');
server.listen(4000);

app.use(express.static(__dirname));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

io.on('connection', function (socket){
    console.log('a user connected');
    socket.emit('db', { data: db.get() });

    socket.on('datachanges', function (msg) {
        db.postMessageSync('changedata', msg.data);
        socket.broadcast.emit('datachanges', msg);
    });
});
