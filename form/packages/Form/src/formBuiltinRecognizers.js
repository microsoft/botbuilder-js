// Copyright (c) Microsoft Corporation. All rights reserved.

const cancel = function (context) {
    return /^cancel|quit$/i.test(context.request.text);
};

const help = function (context) {
    return /^help$/i.test(context.request.text);
};

const confirm = function (context) {
    if (/^yes$/i.test(context.request.text)) {
        context.local.confirm = 'yes';
        return true;
    }
    if (/^no$/i.test(context.request.text)) {
        context.local.confirm = 'no';
        return true;
    }
    return false;
};

module.exports = {
    cancel: cancel,
    help: help,
    confirm: confirm
};
