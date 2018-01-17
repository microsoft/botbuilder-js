// Copyright (c) Microsoft Corporation. All rights reserved.

const core = require('bot-framework-core');
const DispatcherFactory = require('bot-framework-ifdo').DispatcherFactory;
const formRuntime = require('./formRuntime.js');
const builtin = require('./formBuiltinRecognizers.js');
const recognition = require('./formEntityRecognition.js');

const fallbackRecognizer = function (formMetadata, result, context) {
    // the flow state will tell us if we are expecting a single entity 
    let entity = undefined;
    if (context.flow.stack.length > 0) {
        const entry = context.flow.stack[0];
        if (entry.type === 'SingleEntityPrompt') {
            entity = entry.entityName;
        }
    }
    // and if we have failed to bind that single entity
    if (entity && context.local[entity] === undefined) {
        return recognition.recognizeSingleEntity(formMetadata, entity, context);
    }
    return result;
};

const makeCodeBehindFunctionFactory = function (codeBehind) {
    return function (metadata, name) {
        return function (context) {
            if (context.flow && context.flow.form) {
                context.local = Object.assign(context.flow.form.local, context.local);
            }
            return core.codeRecognizer(metadata.onRun, codeBehind, context);
        };
    };
};

const makeLUISRecognizerFunctionFactory = function (options, formMetadata, codeBehind) {
    return function (metadata, name) {
        return function (context) {
            if (context.request.type && context.request.type !== 'message') {
                return Promise.resolve(false);
            }
            if (context.flow && context.flow.form) {
                context.local = Object.assign(context.flow.form.local, context.local);
            }
            options.luisKey = options.luisKey || metadata.key;
            return core.luisRecognizer(metadata, options, context, codeBehind).then((result) => {
                return fallbackRecognizer(formMetadata, result, context);
            });
        };
    };
};

const makeRegexRecognizerFunctionFactory = function (formMetadata) {
    return function (metadata, name) {
        return function (context) {
            if (context.request.type && context.request.type !== 'message') {
                return Promise.resolve(false);
            }
            if (context.flow && context.flow.form) {
                context.local = Object.assign(context.flow.form.local, context.local);
            }

            // As regex recognizer has not picked up any entities we can go straight to fallback
            return fallbackRecognizer(formMetadata, true, context);
        };
    };
};

const makeStopRecognizerFunctionFactory = function () {
    return function (metadata, name) {
        return function (context) {
            return true;
        };
    };
};

const makeCancelFactory = function (formMetadata, templates, cards, codeBehind) {
    return function (metadata, name) {
        return function (context) {
            return formRuntime.cancel(metadata, context, formMetadata, templates, cards, codeBehind);
        };
    };
};

const makeHelpFactory = function (formMetadata, templates, cards, codeBehind) {
    return function (metadata, name) {
        return function (context) {
            return formRuntime.help(metadata, context, formMetadata, templates, cards, codeBehind);
        };
    };
};

const makeConfirmFactory = function (formMetadata, templates, cards, codeBehind) {
    return function (metadata, name) {
        return function (context) {
            return formRuntime.confirm(metadata, context, formMetadata, templates, cards, codeBehind);
        };
    };
};

const makeAddOrUpdateFactory = function (formMetadata, templates, cards, codeBehind) {
    return function (metadata, name) {
        return function (context) {
            return formRuntime.addOrUpdate(metadata, context, formMetadata, templates, cards, codeBehind);
        };
    };
};

const makeRepromptFactory = function (formMetadata, templates, cards, codeBehind) {
    return function (metadata, name) {
        return function (context) {
            return formRuntime.reprompt(metadata, context, formMetadata, templates, cards, codeBehind);
        };
    };
};

const makeDispatcher = function (formMetadata, templates, cards, codeBehind, options) {

    // these are built-in but otherwise everything is as if it was user provided code behind
    codeBehind['builtin.cancel'] = builtin.cancel;
    codeBehind['builtin.help'] = builtin.help;
    codeBehind['builtin.confirm'] = builtin.confirm;
    
    const dispatcherFactory = new DispatcherFactory();
    
    // if: recognizers
    dispatcherFactory.register('CodeRecognizer', makeCodeBehindFunctionFactory(codeBehind));
    dispatcherFactory.register('LUISRecognizer', makeLUISRecognizerFunctionFactory(options, formMetadata, codeBehind));
    dispatcherFactory.register('RegexRecognizer', makeRegexRecognizerFunctionFactory(formMetadata));
    dispatcherFactory.register('StopRecognizer', makeStopRecognizerFunctionFactory());
    
    // do: form specific actions
    dispatcherFactory.register('Cancel', makeCancelFactory(formMetadata, templates, cards, codeBehind));
    dispatcherFactory.register('Help', makeHelpFactory(formMetadata, templates, cards, codeBehind));
    dispatcherFactory.register('Confirm', makeConfirmFactory(formMetadata, templates, cards, codeBehind));
    dispatcherFactory.register('AddOrUpdate', makeAddOrUpdateFactory(formMetadata, templates, cards, codeBehind));
    dispatcherFactory.register('Reprompt', makeRepromptFactory(formMetadata, templates, cards, codeBehind));
    
    const dispatcherTable = dispatcherFactory.makeDispatcher(formMetadata.dispatcher);

    return dispatcherTable;
};

module.exports.makeDispatcher = makeDispatcher;
