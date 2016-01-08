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
