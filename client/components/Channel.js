'use strict';

var db = require('../db');

var Channel = milo.createComponentClass({
    className: 'Channel',
    facets: {
        container: undefined
    },
    methods: {
        childrenBound: childrenBound
    }
});


function childrenBound() {
    Channel.super.childrenBound.apply(this, arguments);
    milo.mail.on('showchannel', { subscriber: showChannel, context: this });

    this.messages = this.container.scope.messages;
    this.info = this.container.scope.info;
    this.newMessage = this.container.scope.newMessage;
    this.userHandle = this.scope.userHandle;

    this.newMessage.events.on('keypress',
        { subscriber: onKeyPress, context: this });

    this.container.scope.sendMessage.events.on('click',
        { subscriber: sendMessage, context: this });
}


function showChannel(msg, data) {
    var id = this.channel_id = data.id;

    var messagesDb = this.messagesDb = db('.messages.$1', id);
    if (!messagesDb.get()) messagesDb.set([]);

    if (this.connector) milo.minder.destroyConnector(this.connector);
    this.messages.data.set(messagesDb.get());
    this.connector = milo.minder(messagesDb, '->>>', this.messages.data);

    var channels = db('.channels').get();
    var info = channels.find(function(ch) {
        return ch.id == id;
    });
    this.info.data.set(info);
}


function onKeyPress(eventType, event) {
    if (event.keyCode == 13) sendMessage.call(this);
}


function sendMessage() {
    var userHandle = this.userHandle.getHandle();
    if (!userHandle) return window.alert('Please choose your handle');
    var text = this.newMessage.el.value;
    if (!text) return window.alert('Please enter text');

    this.newMessage.el.value = '';
    this.messagesDb.push({
        userHandle: userHandle,
        text: text,
        channel_id: this.channel_id,
        timestamp: new Date
    });
}
