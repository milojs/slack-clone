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
        childrenBound: childrenBound,
        setHandle: setHandle,
        getHandle: getHandle
    },
    staticMethods: {
        getHandle: getHandle
    }
});


var HANDLE_KEY = '/slack_clone/userHandle';


function childrenBound() {
    UserHandle.super.childrenBound.apply(this, arguments);
    this.handleText = this.el.querySelector('input');
    var handleText = this.getHandle();
    if (handleText) this.handleText.value = handleText;
}


function onInput() {
    var handleText = this.handleText.value;
    this.setHandle(handleText);
}


function getHandle() {
    return window.localStorage.getItem(HANDLE_KEY);
}


function setHandle(text) {
    window.localStorage.setItem(HANDLE_KEY, text);
}
