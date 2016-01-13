'use strict';

var db = require('../db');
var tagOptions = require('./taglist.json').sort(_.compareProperty('label'));
var MLDialog = milo.registry.components.get('MLDialog');
var MLForm = milo.registry.components.get('MLForm');

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
    milo.minder(db('.channels'), '<<<->>>', this.channelsList.data);

    this.createChannel = this.container.scope.createChannel;
    this.createChannel.events.on('click', { subscriber: createChannel, context: this });

    this.userHandle = this.container.scope.userHandle;

    this.channelsList.data.once('', { subscriber: selectFirstChannel, context: this });
}


function selectFirstChannel() {
    var item = this.channelsList.list.item(0);
    if (item) item.select();
}


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

    var form = MLForm.createForm(getFormSchema(), this, getDefaults());
    dialog.container.scope.dialogBody.container.append(form);

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


function getDefaults() {
    return {
        title: '',
        description: '',
        tags: [],
        id: ''
    };
}
