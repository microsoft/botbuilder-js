// Copyright (c) Microsoft Corporation. All rights reserved.

const formPrompt = require('./formPrompt.js');
const formResponder = require('./formResponder.js');

const cancel = function (metadata, context, formMetadata, templates, cards, codeBehind) {
    context.local = context.flow.form.local;
    context.flow.stack = [];
    return formResponder.responder(metadata, context, formMetadata, templates, cards, codeBehind).then(() => {
        delete context.flow.form;
        return { status: 'complete' };
    });
};

const help = function (metadata, context, formMetadata, templates, cards, codeBehind) {
    context.local = context.flow.form.local;
    const beforeResponse = undefined;
    return formResponder.responder(metadata, context, formMetadata, templates, cards, codeBehind).then(() => {
        return { status: 'continue' };
    });
};

const hasMissingRequiredFields = function (form, context) {
    const required = form.fields.filter((f) => { return !(f.entity in context.local) && f.required; });
    return required.length > 0;
};

const getCodeBehind = function (name, codeBehind) {
    const fn = codeBehind[name];
    if (typeof fn !== 'function') {
        throw new Error(`cannot find function with name ${name}`);
    }
    return function (context) {
        try {
            return fn(context);
        }
        catch (err) {
            throw new Error(`user function "${name}" threw an exception: ${err}`);
        }
    };
};

const confirm = function (confirmMetadata, context, formMetadata, templates, cards, codeBehind) {
    context.local = Object.assign(context.flow.form.local, context.local);
    if (context.local.confirm === 'yes') {
        if (hasMissingRequiredFields(formMetadata, context)) {
            const helpMetadata = formMetadata.dispatcher.find(entry => entry.name === 'Help').do;
            return formResponder.responder(helpMetadata, context, formMetadata, templates, cards, codeBehind).then(() => {
                return { status: 'continue' };
            });
        }
        else {
            return formResponder.responder(confirmMetadata, context, formMetadata, templates, cards, codeBehind).then(() => {

                formMetadata.fields.forEach((field) => {
                    if (field.preserveInGlobal) {
                        if (field.entity in context.local) {
                            context.global[field.entity] = context.local[field.entity];
                        }
                    }
                });

                delete context.flow.form;

                if (formMetadata.submit) {
                    const thenActionFunc = getCodeBehind(formMetadata.submit, codeBehind);
                    return Promise.resolve(thenActionFunc(context)).then(() => {
                        return { status: 'complete' };
                    });
                }
                else {
                    return { status: 'complete' };
                }
            });
        }
    }
    else if (context.local.confirm === 'no') {
        const cancelMetadata = formMetadata.dispatcher.find(entry => entry.name === 'Cancel').do;
        return formResponder.responder(cancelMetadata, context, formMetadata, templates, cards, codeBehind).then(() => {
            delete context.flow.form;
            return { status: 'complete' };
        });
    }
    else {
        return Promise.resolve({ status: 'continue' });
    }
};

const addOrUpdate = function (addOrUpdateMetadata, context, formMetadata, templates, cards, codeBehind) {
    context.flow.form.local = context.local;
    context.flow.stack = [];
    return formPrompt.prompt(formMetadata, context, templates, cards, codeBehind).then((entityName) => {
        if (entityName) {
            context.flow.stack.push({ type: 'SingleEntityPrompt', entityName: entityName });
        }
        return { status: 'continue' };
    });
};

const reprompt = function (repromptMetadata, context, formMetadata, templates, cards, codeBehind) {
    return formResponder.responder(repromptMetadata, context, formMetadata, templates, cards, codeBehind).then(() => {
        return { status: 'continue' };
    });
};

const initialize = function (context, formMetadata, templates, cards, codeBehind) {
    context.flow.form = { local: context.local };
    context.flow.stack = [];
    return formPrompt.prompt(formMetadata, context, templates, cards, codeBehind).then((entityName) => {
        if (entityName) {
            context.flow.stack.push({ type: 'SingleEntityPrompt', entityName: entityName });
        }
        return { status: 'continue' };
    });
};

module.exports = {
    cancel: cancel,
    help: help,
    confirm: confirm,
    addOrUpdate: addOrUpdate,
    reprompt: reprompt,
    initialize: initialize
};
