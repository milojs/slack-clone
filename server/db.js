'use strict';

var milo = require('milo-core')
    , _ = require('protojs')
    , fs = require('fs');

var db = new milo.Model(require('./db.json'));

module.exports = db;

db.on('changedata', _.throttle(updateDB, 2000, { leading: false }));

function updateDB() {
    fs.writeFile(__dirname + '/db.json', JSON.stringify(db.get(), null, '  '), _.noop);
}
