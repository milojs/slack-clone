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
