'use strict';

var data = require('./db.json');

module.exports = window.slackDB = new milo.Model(data);
