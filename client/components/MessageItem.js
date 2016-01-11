'use strict';

var MessageItem = milo.createComponentClass({
    className: 'MessageItem',
    facets: {
        data: {
            set: setData
        },
        item: undefined
    }
});


function setData(value) {
    if (typeof value != 'object') return;
    value = _.clone(value);
    var d = new Date(value.timestamp).toString();
    value.timestamp = d.substr(16, 5);
    this.data._set(value);
}
