'use strict';

var UserHandle = milo.createComponentClass({
    className: 'UserHandle',
    facets: {
        events: {
            messages: {
                'input': { subscriber: onInput, context: 'owner' }
            }
        }
    },
    methods: {
        start: start,
        setHandle: setHandle,
        getHandle: getHandle
    },
    staticMethods: {
        getHandle: getHandle
    }
});


var HANDLE_KEY = '/slack_clone/userHandle';


function start() {
    UserHandle.super.start.apply(this, arguments);
    this.el.value = this.getHandle() || '';
}


function onInput() {
    var handleText = this.el.value;
    this.setHandle(handleText);
}


function getHandle() {
    return window.localStorage.getItem(HANDLE_KEY);
}


function setHandle(text) {
    window.localStorage.setItem(HANDLE_KEY, text);
}
