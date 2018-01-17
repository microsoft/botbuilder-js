// Copyright (c) Microsoft Corporation. All rights reserved.

const core = require('bot-framework-core');
const dialog = require('bot-framework-dialogflow');
const form = require('bot-framework-form');
const DispatcherFactory = require('bot-framework-ifdo').DispatcherFactory;

const makeCodeBehindFunctionFactory = function (codeBehind) {
    return function (metadata, name) {
        return codeBehind[metadata.onRun];
    };
};

const makeConversationUpdateRecognizerFunctionFactory = function (codeBehind) {
    return function (metadata, name) {
        return function (context) {
            if (context.request.type && context.request.type === 'conversationUpdate') {
                return codeBehind[metadata.onRun](context);
            }
            return false;
        };
    };
};

const makeLUISRecognizerFunctionFactory = function (options, codebehind) {
    return function (metadata, name) {
        return function (context) {
            if (context.request.type && context.request.type !== 'message') {
                return false;
            }
            options.luisKey = options.luisKey || metadata.key;
            return core.luisRecognizer(metadata, options, context, codebehind);
        };
    };
};

const makeRegexRecognizerFunctionFactory = function (options) {
    return function (metadata, name) {
        return function (context) {
            if (context.request.type && context.request.type !== 'message') {
                return false;
            }
            return core.regexRecognizer(metadata, context);
        };
    };
};

const makeRespondFunctionFactory = function (templates, cards, codeBehind) {
    return function (metadata, name) {
        return function (context) {
            return core.responder(templates, cards, metadata.feedback, metadata.beforeResponse, context, codeBehind);
        };
    };
};

const makeDialogFlowFunctionFactory = function (templates, cards, sharedDialogFlows, codeBehind, options) {
    return function (metadata, name) {
        return function (context) {
            return dialog.run(name, metadata, templates, cards, sharedDialogFlows, codeBehind, context, options);
        };
    };
};

const makeFormFunctionFactory = function (templates, cards, codeBehind, options) {
    return function (metadata, name) {
        return function (context) {
            return form.run(name, metadata, templates, cards, codeBehind, context, options);
        };
    };
};

const createDispatchTable = function (agent, cards, codeBehind, options) {

    const templates = agent.templates;
    const sharedDialogFlows = agent.sharedDialogFlows;

    const dispatcherFactory = new DispatcherFactory();

    // if: recognizers
    dispatcherFactory.register('CodeRecognizer', makeCodeBehindFunctionFactory(codeBehind));
    dispatcherFactory.register('LUISRecognizer', makeLUISRecognizerFunctionFactory(options, codeBehind));
    dispatcherFactory.register('ConversationUpdateRecognizer', makeConversationUpdateRecognizerFunctionFactory(codeBehind));
    dispatcherFactory.register('RegexRecognizer', makeRegexRecognizerFunctionFactory(options));
    
    // do: actions
    dispatcherFactory.register('Process', makeCodeBehindFunctionFactory(codeBehind));
    dispatcherFactory.register('Respond', makeRespondFunctionFactory(templates, cards, codeBehind));
    dispatcherFactory.register('RootDialogFlow', makeDialogFlowFunctionFactory(templates, cards, sharedDialogFlows, codeBehind, options));
    dispatcherFactory.register('Form', makeFormFunctionFactory(templates, cards, codeBehind, options));

    return dispatcherFactory.makeDispatcher(agent.tasks);
};

module.exports = {
    createDispatchTable: createDispatchTable
};
