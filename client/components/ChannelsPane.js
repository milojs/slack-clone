'use strict';

var db = require('../db')
    , createChannel = require('../create_channel');

var ChannelsPane = milo.createComponentClass({
    className: 'ChannelsPane',
    facets: {
        container: undefined
    },
    methods: {
        childrenBound: childrenBound
    }
});


function childrenBound() {
    ChannelsPane.super.childrenBound.apply(this, arguments);
    this.channelsList = this.container.scope.channelsList;
    milo.minder(db('.channels'), '<<<->>>', this.channelsList.data);

    this.createChannel = this.container.scope.createChannel;
    this.createChannel.events.on('click', createChannel);

    this.channelsList.data.once('', { subscriber: selectFirstChannel, context: this });
}


function selectFirstChannel() {
    var item = this.channelsList.list.item(0);
    if (item) item.select();
}
