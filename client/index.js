'use strict';

require('./components');
var db = require('./db');

milo(function() {
    milo.binder();

    var socket = io(window.location.origin);

    socket.on('connect', function() {
        socket.on('db', function (msg) {
            db.set(msg.data);
            db.on('datachanges', updateDB);
        });

        socket.on('datachanges', function (msg) {
            db.off('datachanges', updateDB);
            db.postMessageSync('changedata', msg.data);
            _.defer(function() {
                db.on('datachanges', updateDB);
            });
        });

    });

    function updateDB(msg, data) {
        if (data.changes.length) socket.emit('datachanges', { data: data });
    }
});
