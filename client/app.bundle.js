(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var db = require('../db');

var Channel = milo.createComponentClass({
    className: 'Channel',
    facets: {
        container: undefined
    },
    methods: {
        start: start
    }
});


function start() {
    Channel.super.start.apply(this, arguments);
    this.on('childrenbound', childrenBound);
    milo.mail.on('showchannel', { subscriber: showChannel, context: this });
}


function childrenBound() {
    this.messages = this.container.scope.messages;
    this.newMessage = this.container.scope.newMessage;
    this.container.scope.sendMessage.events.on('click',
        { subscriber: sendMessage, context: this });
}


function showChannel(msg, data) {
    var id = this.channel_id = data.id;

    var messagesDb = this.messagesDb = db('.messages.$1', id);
    if (this.connector) milo.minder.destroyConnector(this.connector);
    this.messages.data.set(messagesDb.get());
    this.connector = milo.minder(messagesDb, '<<<->>>', this.messages.data);
}


function sendMessage() {
    var text = this.newMessage.el.value;
    this.messagesDb.push({
        text: text,
        channel_id: this.channel_id,
        timestamp: new Date
    });
}

},{"../db":6}],2:[function(require,module,exports){
'use strict';

var ChannelItem = milo.createComponentClass({
    className: 'ChannelItem',
    facets: {
        data: undefined,
        item: undefined,
        events: {
            messages: {
                click: { subscriber: onChannelClick, context: 'owner' }
            }
        }
    },
    methods: {

    }
});


function onChannelClick() {
    var id = this.data.path('.id').get();
    milo.mail.postMessage('showchannel', { id: id });
}

},{}],3:[function(require,module,exports){
'use strict';

var db = require('../db');

var ChannelsPane = milo.createComponentClass({
    className: 'ChannelsPane',
    facets: {
        container: undefined
    },
    methods: {
        start: start
    }
});


function start() {
    ChannelsPane.super.start.apply(this, arguments);
    this.on('childrenbound', onChildrenBound);
    
}


function onChildrenBound() {
    this.channelsList = this.container.scope.channelsList;
    milo.minder(db('.channels'), '<<<->>>', this.channelsList.data);
}

},{"../db":6}],4:[function(require,module,exports){
'use strict';

var MessageItem = milo.createComponentClass({
    className: 'MessageItem',
    facets: {
        data: undefined,
        item: undefined
    },
    methods: {
        
    }
});

},{}],5:[function(require,module,exports){
require('./ChannelsPane');
require('./ChannelItem');
require('./Channel');
require('./MessageItem');

},{"./Channel":1,"./ChannelItem":2,"./ChannelsPane":3,"./MessageItem":4}],6:[function(require,module,exports){
'use strict';

module.exports = new milo.Model;

},{}],7:[function(require,module,exports){
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
            console.log(msg.data);
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

},{"./components":5,"./db":6}]},{},[7]);
