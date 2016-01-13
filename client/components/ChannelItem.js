'use strict';

var ChannelItem = milo.createComponentClass({
    className: 'ChannelItem',
    facets: {
        data: undefined,
        item: undefined,
        events: {
            messages: {
                'click': { subscriber: onChannelClick, context: 'owner' }
            }
        }
    },
    methods: {
        select: select
    }
});


function onChannelClick() {
    this.select();
}


function select() {
    var id = this.data.path('.id').get();
    milo.mail.postMessage('showchannel', { id: id });
    showSelected.call(this);
}


function showSelected() {
    this.item.list.each(function (comp) {
        comp.el.classList.remove('selected');
    });
    this.el.classList.add('selected');
}
