'use strict';

var db = require('../db');
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

    this.channelsList.data.once('', { subscriber: selectFirstChannel, context: this });
}


function selectFirstChannel() {
    var item = this.channelsList.list.item(0);
    if (item) item.select();
}


function createChannel() {
    var dialog = MLDialog.createDialog({
        title: 'Create new channel',
        html: 'Please enter channel meta data:'
    });

    var form = MLForm.createForm(getFormSchema(), this);
    dialog.container.scope.dialogBody.container.append(form);

    dialog.openDialog(function (result) {
        console.log('wrergerg', result, form.model.get());
    });
}


function getFormSchema() {
    return {
        items: [
            {
                type: 'input',
                label: 'Channel title',
                modelPath: '.title'
            },
            {
                type: 'input',
                label: 'Channel description',
                modelPath: '.description'
            }
        ]
    }
}