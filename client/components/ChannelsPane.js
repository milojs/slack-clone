'use strict';

var db = require('../db');


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
    milo.minder(db('.channels'), '<<<->>>', this.channelsList.data);
}
