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

var db = require('../db')
    , createChannel = require('../create_channel');


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

    this.createChannel = this.container.scope.createChannel;
    this.createChannel.events.on('click', createChannel);

    milo.minder(db('.channels'), '<<<->>>', this.channelsList.data);
    
    this.channelsList.data.once('', { subscriber: selectFirstChannel, context: this });
}


function selectFirstChannel() {
    var item = this.channelsList.list.item(0);
    if (item) item.select();
}

},{"../create_channel":7,"../db":8}],4:[function(require,module,exports){
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
'use strict';

var db = require('./db');
var tagOptions = require('./taglist.json').sort(_.compareProperty('label'));
var MLDialog = milo.registry.components.get('MLDialog');
var MLForm = milo.registry.components.get('MLForm');

module.exports = createChannel;


function createChannel() {
    var dialog = MLDialog.createDialog({
        title: 'Create new channel',
        html: 'Please enter channel meta data:',
        buttons: [
            {
                label: 'Cancel',
                result: 'CANCEL'
            },
            {
                label: 'Create',
                result: 'OK',
                close: false
            }
        ]
    });

    var form = MLForm.createForm(getFormSchema());
    dialog.container.scope.dialogBody.container.append(form);
    form.validateModel();

    dialog.openDialog(function (result) {
        if (result == 'OK' && form.isValid()) {
            var newMeta = form.model.get();
            var length = db('.channels').len();
            newMeta.id = 'ch' + (length + 1);
            db('.channels').push(newMeta);
            dialog.closeDialog();
            dialog.destroy();
        }
    });
}


function getFormSchema() {
    return {
        items: [
            {
                type: 'input',
                label: 'Channel title',
                modelPath: '.title',
                validate: {
                    fromModel: ['required'],
                    toModel: ['required']
                }
            },
            {
                type: 'input',
                label: 'Channel description',
                modelPath: '.description',
                validate: {
                    fromModel: ['required'],
                    toModel: ['required']
                }
            },
            {
                type: 'combolist',
                label: 'Tags',
                modelPath: '.tags',
                comboOptions: tagOptions,
                translate: {
                    toModel: function (val) {
                        return val && val.map(function (v) { return v.value; });
                    }
                }
            },
            {
                type: 'checkbox',
                label: 'Private',
                wrapCssClass: 'checkbox',
                modelPath: '.isPrivate'
            }
        ]
    };
}

},{"./db":8,"./taglist.json":10}],8:[function(require,module,exports){
'use strict';

module.exports = window.slackDB = new milo.Model;

},{}],9:[function(require,module,exports){
'use strict';

require('./components');
var db = require('./db');

milo(function() {
    milo.binder();

    var socket = io(window.location.origin);

    socket.on('connect', function() {
        socket.on('db', function (msg) {
            db.set(msg.data);
            db.on('datachanges', updateDB);
        });

        socket.on('datachanges', function (msg) {
            db.off('datachanges', updateDB);
            db.postMessageSync('changedata', msg.data);
            _.defer(function() {
                db.on('datachanges', updateDB);
            });
        });

    });

    function updateDB(msg, data) {
        if (data.changes.length) socket.emit('datachanges', { data: data });
    }
});

},{"./components":6,"./db":8}],10:[function(require,module,exports){
module.exports=[
    { "label": "eclipse", "value": "eclipse" },
    { "label": "string", "value": "string" },
    { "label": "windows", "value": "windows" },
    { "label": "html5", "value": "html5" },
    { "label": "wordpress", "value": "wordpress" },
    { "label": "excel", "value": "excel" },
    { "label": "multithreading", "value": "multithreading" },
    { "label": "spring", "value": "spring" },
    { "label": "swift", "value": "swift" },
    { "label": "facebook", "value": "facebook" },
    { "label": "image", "value": "image" },
    { "label": "milojs", "value": "milojs" },
    { "label": "forms", "value": "forms" },
    { "label": "oracle", "value": "oracle" },
    { "label": "git", "value": "git" },
    { "label": "winforms", "value": "winforms" },
    { "label": "osx", "value": "osx" },
    { "label": "bash", "value": "bash" },
    { "label": "algorithm", "value": "algorithm" },
    { "label": "apache", "value": "apache" },
    { "label": "performance", "value": "performance" },
    { "label": "swing", "value": "swing" },
    { "label": "twitter-bootstrap", "value": "twitter-bootstrap" },
    { "label": "mongodb", "value": "mongodb" },
    { "label": "matlab", "value": "matlab" },
    { "label": "ruby-on-rails-3", "value": "ruby-on-rails-3" },
    { "label": "entity-framework", "value": "entity-framework" },
    { "label": "vba", "value": "vba" },
    { "label": "linq", "value": "linq" },
    { "label": "hibernate", "value": "hibernate" },
    { "label": "visual-studio", "value": "visual-studio" },
    { "label": "perl", "value": "perl" },
    { "label": "list", "value": "list" },
    { "label": "web-services", "value": "web-services" },
    { "label": "css3", "value": "css3" },
    { "label": "postgresql", "value": "postgresql" },
    { "label": "javascript", "value": "javascript" },
    { "label": "java", "value": "java" },
    { "label": "c#", "value": "c#" },
    { "label": "php", "value": "php" },
    { "label": "android", "value": "android" },
    { "label": "jquery", "value": "jquery" },
    { "label": "python", "value": "python" },
    { "label": "html", "value": "html" },
    { "label": "c++", "value": "c++" },
    { "label": "ios", "value": "ios" },
    { "label": "mysql", "value": "mysql" },
    { "label": "css", "value": "css" },
    { "label": "sql", "value": "sql" },
    { "label": "asp.net", "value": "asp.net" },
    { "label": "objective-c", "value": "objective-c" },
    { "label": "ruby-on-rails", "value": "ruby-on-rails" },
    { "label": ".net", "value": ".net" },
    { "label": "iphone", "value": "iphone" },
    { "label": "c", "value": "c" },
    { "label": "arrays", "value": "arrays" },
    { "label": "sql-server", "value": "sql-server" },
    { "label": "ruby", "value": "ruby" },
    { "label": "angularjs", "value": "angularjs" },
    { "label": "json", "value": "json" },
    { "label": "ajax", "value": "ajax" },
    { "label": "regex", "value": "regex" },
    { "label": "xml", "value": "xml" },
    { "label": "asp.net-mvc", "value": "asp.net-mvc" },
    { "label": "r", "value": "r" },
    { "label": "linux", "value": "linux" },
    { "label": "wpf", "value": "wpf" },
    { "label": "django", "value": "django" },
    { "label": "node.js", "value": "node.js" },
    { "label": "database", "value": "database" },
    { "label": "xcode", "value": "xcode" },
    { "label": "vb.net", "value": "vb.net" },
    { "label": "qt", "value": "qt" },
    { "label": "visual-studio-2010", "value": "visual-studio-2010" },
    { "label": "scala", "value": "scala" },
    { "label": "sql-server-2008", "value": "sql-server-2008" },
    { "label": "sqlite", "value": "sqlite" },
    { "label": "function", "value": "function" },
    { "label": "wcf", "value": "wcf" },
    { "label": "file", "value": "file" },
    { "label": "python-2.7", "value": "python-2.7" },
    { "label": "uitableview", "value": "uitableview" },
    { "label": "shell", "value": "shell" },
    { "label": "codeigniter", "value": "codeigniter" },
    { "label": "api", "value": "api" },
    { "label": "cordova", "value": "cordova" },
    { "label": "validation", "value": "validation" },
    { "label": "class", "value": "class" },
    { "label": "rest", "value": "rest" },
    { "label": "google-maps", "value": "google-maps" },
    { "label": "excel-vba", "value": "excel-vba" },
    { "label": "actionscript-3", "value": "actionscript-3" },
    { "label": "maven", "value": "maven" },
    { "label": "asp.net-mvc-3", "value": "asp.net-mvc-3" },
    { "label": "sockets", "value": "sockets" },
    { "label": "jsp", "value": "jsp" },
    { "label": "unit-testing", "value": "unit-testing" },
    { "label": "google-chrome", "value": "google-chrome" },
    { "label": "symfony2", "value": "symfony2" },
    { "label": "xaml", "value": "xaml" },
    { "label": "tsql", "value": "tsql" },
    { "label": "security", "value": "security" },
    { "label": "asp.net-mvc-4", "value": "asp.net-mvc-4" },
    { "label": "email", "value": "email" },
    { "label": "loops", "value": "loops" },
    { "label": "android-layout", "value": "android-layout" },
    { "label": "sorting", "value": "sorting" },
    { "label": "cocoa", "value": "cocoa" }
]

},{}]},{},[9]);
