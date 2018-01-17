// Copyright (c) Microsoft Corporation. All rights reserved.

const ifdo = require('bot-framework-ifdo');

const formDispatcherFactory = require('./formDispatcherFactory.js');
const formRuntime = require('./formRuntime.js');

const evaluate = function (name, formMetadata, templates, cards, codeBehind, context, options) {

    // turn zero
    if (context.flow.form === undefined) {

        return formRuntime.initialize(context, formMetadata, templates, cards, codeBehind).then(rsp => {
            const confirm = context.flow.confirm;
            delete context.flow.confirm;

            return Promise.resolve({ complete: context.flow.form === undefined, confirm: confirm});
        });
    }
    // run form
    else {
        const dispatcherTable = formDispatcherFactory.makeDispatcher(formMetadata, templates, cards, codeBehind, options);

        // copy from the main task context to the form context
        const formContext = {
            request: context.request,
            responses: [],
            flow: context.flow,
            global: context.global,
            local: context.local
        };

        // evaluate the form
        return ifdo.evaluate(dispatcherTable, formContext, options).then(() => {

            // copy from the form context back onto the main task context
            context.responses = formContext.responses;
            context.flow = formContext.flow;
            context.global = formContext.global;
            context.local = formContext.local;

            const confirm = context.flow.confirm;
            delete context.flow.confirm;
            
            return Promise.resolve({ complete: context.flow.form === undefined, confirm: confirm});
        });
    }
};

const run = function (name, doAction, templates, cards, codeBehind, context, options) {
    try {
        // refer to code in DesignerRuntime/src/dispatcher.js - 'flow' is well-known
        if (context.flow === undefined) {
            context.flow = {};
        }
        return evaluate(name, doAction.form, templates, cards, codeBehind, context, options).then((response) => {
            return Promise.resolve({ status: response.complete ? 'complete' : 'continue' });
        });
    }
    catch (err) {
        return Promise.reject(err);
    }
};

module.exports = {
    run: run
};
