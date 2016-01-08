'use strict';

require('./components');
var db = require('./db');

milo(function() {
    milo.binder();

    var socket = io('http://localhost:4000');

    socket.on('connect', function() {
        console.log('connected');

        socket.on('db', function (msg) {
            db.set(msg.data);
            db.on('datachanges', updateDB);
        });

        socket.on('datachanges', function (msg) {
            db.off('datachanges', updateDB);
            db.postMessageSync('changedata', msg.data, function() {
                db.on('datachanges', updateDB);
            });
        });

    });

    updateDB = _.throttle(updateDB, 500, { leading: false });

    function updateDB(msg, data) {
        if (data.changes.length) socket.emit('datachanges', { data: data });
    }
});
