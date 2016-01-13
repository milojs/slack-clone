(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var db = require('../db');

var Channel = milo.createComponentClass({
    className: 'Channel',
    facets: {
        container: undefined
    },
    methods: {
        childrenBound: childrenBound
    }
});


function childrenBound() {
    Channel.super.childrenBound.apply(this, arguments);
    milo.mail.on('showchannel', { subscriber: showChannel, context: this });

    this.messages = this.container.scope.messages;
    this.info = this.container.scope.info;
    this.newMessage = this.container.scope.newMessage;
    this.userHandle = this.scope.userHandle;

    this.newMessage.events.on('keypress',
        { subscriber: onKeyPress, context: this });

    this.container.scope.sendMessage.events.on('click',
        { subscriber: sendMessage, context: this });
}


function showChannel(msg, data) {
    var id = this.channel_id = data.id;

    var messagesDb = this.messagesDb = db('.messages.$1', id);
    if (!messagesDb.get()) messagesDb.set([]);

    if (this.connector) milo.minder.destroyConnector(this.connector);
    this.messages.data.set(messagesDb.get());
    this.connector = milo.minder(messagesDb, '->>>', this.messages.data);

    var channels = db('.channels').get();
    var info = channels.find(function(ch) {
        return ch.id == id;
    });
    this.info.data.set(info);
}


function onKeyPress(eventType, event) {
    if (event.keyCode == 13) sendMessage.call(this);
}


function sendMessage() {
    var userHandle = this.userHandle.getHandle();
    if (!userHandle) return window.alert('Please choose your handle');
    var text = this.newMessage.el.value;
    if (!text) return window.alert('Please enter text');

    this.newMessage.el.value = '';
    this.messagesDb.push({
        userHandle: userHandle,
        text: text,
        channel_id: this.channel_id,
        timestamp: new Date
    });
}

},{"../db":8}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"../db":8}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
require('./UserHandle');
require('./ChannelsPane');
require('./ChannelItem');
require('./Channel');
require('./MessageItem');

},{"./Channel":1,"./ChannelItem":2,"./ChannelsPane":3,"./MessageItem":4,"./UserHandle":5}],7:[function(require,module,exports){
module.exports={
  "channels": [
    {
      "id": "ch1",
      "title": "Welcome",
      "tags": [
        "chat",
        "welcome"
      ],
      "description": "Welcome to slack clone"
    },
    {
      "id": "ch2",
      "title": "Milo",
      "tags": [
        "milo",
        "javascript"
      ],
      "description": "Everybody has a share"
    }
  ],
  "messages": {
    "ch1": [
      {
        "userHandle": "Jason",
        "text": "Hello there. You are using slack clone",
        "channel_id": "ch1",
        "timestamp": "2016-01-08T18:06:44.869Z"
      }
    ],
    "ch2": [
      {
        "userHandle": "Evgeny",
        "text": "Making full stack reactivity with milo",
        "channel_id": "ch2",
        "timestamp": "2016-01-08T18:05:46.299Z"
      }
    ]
  }
}
},{}],8:[function(require,module,exports){
'use strict';

var data = require('./db.json');

module.exports = window.slackDB = new milo.Model(data);

},{"./db.json":7}],9:[function(require,module,exports){
'use strict';

require('./components');

milo(function() {
    milo.binder();
});

},{"./components":6}]},{},[9]);
