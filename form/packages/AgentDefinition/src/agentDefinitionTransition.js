// Copyright (c) Microsoft Corporation. All rights reserved.

const agentDefinitionFeedback = require('./agentDefinitionFeedback.js');
const agentDefinitionRecognizer = require('./agentDefinitionRecognizer.js');

const readRespond = function (parent) {
    let result = [];
    const childNodes = parent.getElementsByTagName('Respond');
    for (let i = 0; i < childNodes.length; i++) {
        const element = childNodes.item(i);
        if (element.parentNode !== parent) {
            continue;
        }
        const name = element.getAttribute('name');
        if (name === undefined) {
            throw new Error('expected attribute "name" on Respond');
        }
        const beforeResponse = element.getAttribute('beforeResponse');
        const respond = { type: 'Respond', name: name, beforeResponse : beforeResponse };
        const feedback = agentDefinitionFeedback.readFeedback(element);
        if (feedback !== undefined) {
            respond.feedback = feedback;
        }
        result.push(respond);
    }
    return result;
};

const readProcess = function (parent) {
    let result = [];
    const childNodes = parent.getElementsByTagName('Process');
    for (let i = 0; i < childNodes.length; i++) {
        const element = childNodes.item(i);
        if (element.parentNode !== parent) {
            continue;
        }
        const name = element.getAttribute('name');
        if (name === undefined) {
            throw new Error('expected attribute "name" on Process');
        }
        const onRun = element.getAttribute('onRun');
        if (onRun === undefined || onRun.length === 0) {
            throw new Error('expected onRun attribute with value to be name of a JavaSCript function');
        }
        result.push({ type: 'Process', onRun: onRun, name: name });
    }
    return result;
};

const readInitial = function (parent) {
    let result = [];
    const childNodes = parent.getElementsByTagName('Initial');
    for (let i = 0; i < childNodes.length; i++) {
        const element = childNodes.item(i);
        if (element.parentNode !== parent) {
            continue;
        }
        const name = element.getAttribute('name');
        if (name === undefined) {
            throw new Error('expected attribute "name" on Initial');
        }
        result.push({ type: 'Initial', name: name });
    }
    return result;
};

const readEntityRef = function (parent) {
    let result = [];
    const childNodes = parent.getElementsByTagName('EntityRef');
    for (let i = 0; i < childNodes.length; i++) {
        const element = childNodes.item(i);
        if (element.parentNode !== parent) {
            continue;
        }
        const name = element.getAttribute('name');
        if (name === undefined) {
            throw new Error('expected attribute "name" on EntityRef');
        }
        const prompt = element.getAttribute('promptIfMissing');
        result.push({ name: name, promptIfMissing: (prompt === 'true') });
    }
    return result;
};

const readPrompt = function (parent) {
    let result = [];
    const childNodes = parent.getElementsByTagName('Prompt');
    for (let i = 0; i < childNodes.length; i++) {
        const element = childNodes.item(i);
        if (element.parentNode !== parent) {
            continue;
        }
        const name = element.getAttribute('name');
        if (name === undefined) {
            throw new Error('expected attribute "name" on Prompt');
        }
        const beforeResponse = element.getAttribute('beforeResponse');
        const feedback = agentDefinitionFeedback.readFeedbackBaseCollection(element, true);
        const recognizer = agentDefinitionRecognizer.readRecognizer(element);
        if (recognizer === undefined) {
            throw new Error('no recognizer found');
        }
        const entities = readEntityRef(element);
        result.push({
            type: 'Prompt',
            feedback: feedback,
            recognizer: recognizer,
            name: name,
            entities: entities,
            promptWhen : element.getAttribute('promptWhen'),
            repromptWhen : element.getAttribute('repromptWhen'),
            beforeResponse: beforeResponse
        });
    }
    return result;
};

const readReturn = function (parent) {
    let result = [];
    const childNodes = parent.getElementsByTagName('Return');
    for (let i = 0; i < childNodes.length; i++) {
        const element = childNodes.item(i);
        if (element.parentNode !== parent) {
            continue;
        }
        const name = element.getAttribute('name');
        if (name === undefined) {
            throw new Error('expected attribute "name" on Return');
        }
        const outcome = element.getAttribute('outcome');
        result.push({ type: 'Return', name: name, outcome: outcome });
    }
    return result;
};

const readEnd = function (parent) {
    let result = [];
    const childNodes = parent.getElementsByTagName('End');
    for (let i = 0; i < childNodes.length; i++) {
        const element = childNodes.item(i);
        if (element.parentNode !== parent) {
            continue;
        }
        const name = element.getAttribute('name');
        if (name === undefined) {
            throw new Error('expected attribute "name" on End');
        }
        result.push({ type: 'End', name: name });
    }
    return result;
};

const readDialogFlowRef = function (parent) {
    let result = [];
    const childNodes = parent.getElementsByTagName('DialogFlowRef');
    for (let i = 0; i < childNodes.length; i++) {
        const element = childNodes.item(i);
        if (element.parentNode !== parent) {
            continue;
        }
        const name = element.getAttribute('name');
        if (name === undefined) {
            throw new Error('expected attribute "name" on DialogFlowRef');
        }
        const refTo = element.getAttribute('refTo');
        if (refTo === undefined) {
            throw new Error('expected attribute "refTo" on DialogFlowRef');
        }
        result.push({ type: 'DialogFlowRef', name: name, refTo: refTo });
    }
    return result;
};

module.exports = {
    readRespond: readRespond,
    readProcess: readProcess,
    readReturn: readReturn,
    readPrompt: readPrompt,
    readEnd: readEnd,
    readInitial: readInitial,
    readDialogFlowRef: readDialogFlowRef
};
