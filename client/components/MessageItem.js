'use strict';

var UserHandle = milo.registry.components.get('UserHandle');


var MessageItem = milo.createComponentClass({
    className: 'MessageItem',
    facets: {
        data: undefined,
        item: undefined,
        css: {
            classes: {
                '.userHandle': isAuthor
            }
        }
    },
    methods: {
        start: start
    }
});


function start() {
    MessageItem.super.start.apply(this, arguments);
    milo.minder(this.data, '->>', this.css);
}


function isAuthor(handleText) {
    if (handleText == UserHandle.getHandle()) return 'current-user';
}
