// Copyright (c) Microsoft Corporation. All rights reserved.

var DOMParser = require('xmldom').DOMParser;

const ifdo = require('bot-framework-ifdo');
const core = require('bot-framework-core');
const agentDefinition = require('bot-framework-agentdefinition');
const agent = require('./agent.js');
const runtime = require('./runtime.js');

const contextToState = function (context) {
    delete context.local['@current'];
    return {
        sticky: context.sticky,
        flow: context.flow || {
            stack: []
        },
        data: {
            taskEntities: context.local,
            global: context.global,
        }
    };
};

const stateToContext = function (state, context) {
    context.sticky = state.sticky;
    context.flow = state.flow || { stack: [] };
    if (state.data === undefined) {
        context.local = {};
        context.global = {};
    } else {
        context.local = state.data.taskEntities || {};
        context.global = state.data.global || {};
    }
};

var send = function (activity, agentXml, codeBehind, state, cards, options) {
    const agentDom = new DOMParser().parseFromString(agentXml);
    const agentJson = agentDefinition.readAgentDefinition(agentDom);
    agentJson.cards = cards;
    const dispatchTable = agent.createDispatchTable(agentJson, cards, codeBehind, options);

    const dispatcher = function (context, options) {
        core.processCardAction(context);
        return ifdo.evaluate(dispatchTable, context, options);
    };

    const context = {
        request: activity,
        resources: agentJson.resources
    };
    
    stateToContext(state, context);
    return runtime.evaluate(dispatcher, context, options).then(() => {
        return {
            state: contextToState(context),
            context: context
        };
    });
};

// global for calling from chakra
dispatch = send; //eslint-disable-line no-undef

// npm export for calling from node
module.exports = {
    send: send
};