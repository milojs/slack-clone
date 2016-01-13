(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var ChannelItem = milo.createComponentClass({
    className: 'ChannelItem',
    facets: {
        data: undefined,
        item: undefined
    },
    methods: {

    }
});

},{}],2:[function(require,module,exports){
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

},{"../db":5}],3:[function(require,module,exports){
require('./ChannelsPane');
require('./ChannelItem');

},{"./ChannelItem":1,"./ChannelsPane":2}],4:[function(require,module,exports){
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
  ]
}
},{}],5:[function(require,module,exports){
'use strict';

var data = require('./db.json');

module.exports = window.slackDB = new milo.Model(data);

},{"./db.json":4}],6:[function(require,module,exports){
'use strict';

require('./components');

milo(function() {
    milo.binder();
});

},{"./components":3}]},{},[6]);
