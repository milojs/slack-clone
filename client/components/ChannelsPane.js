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
    this.channelsList.data.set(db('.channels').get());

    this.createChannel = this.container.scope.createChannel;
    this.createChannel.events.on('click', createChannel);

    milo.minder(db('.channels'), '<<<->>>', this.channelsList.data);
}
