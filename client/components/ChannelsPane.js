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
