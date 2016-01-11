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
    this.newMessage = this.container.scope.newMessage;
    this.container.scope.sendMessage.events.on('click',
        { subscriber: sendMessage, context: this });

    this.userHandle = this.scope.userHandle;
}


function showChannel(msg, data) {
    var id = this.channel_id = data.id;

    var messagesDb = this.messagesDb = db('.messages.$1', id);
    if (this.connector) milo.minder.destroyConnector(this.connector);
    this.messages.data.set(messagesDb.get());
    this.connector = milo.minder(messagesDb, '->>>', this.messages.data);
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
