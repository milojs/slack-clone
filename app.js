'use strict';

var io = require('socket.io')(4000)
    , db = require('./server/db')
    , milo = require('milo-core');


io.on('connection', function (socket){
    console.log('a user connected');
    socket.emit('db', db.get());

    socket.on('datachanges', function({ data }), {
        db.postMessageSync('changedata', data);
        socket.broadcast.emit('datachanges', { data });
    });
});
