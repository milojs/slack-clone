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
