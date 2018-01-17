// Copyright (c) Microsoft Corporation. All rights reserved.

const agentDefinitionTransition = require('./agentDefinitionTransition.js');

const readTaskDialogFlow = function (task, sharedDialogFlows) {
    const result = { type: 'RootDialogFlow', nonRootDialogFlows: {} };
    const childNodes = task.getElementsByTagName('DialogFlow');
    if (childNodes.length === 0) {
        result.rootDialogFlow = readDialogFlowRef(task, sharedDialogFlows);
    }
    else {
        for (let i=0; i<childNodes.length; i++) {
            const element = childNodes.item(i);
            const dialogFlow = readDialogFlow(element);
            if (dialogFlow.isRootFlow) {
                if (result.rootDialogFlow !== undefined) {
                    throw new Error('you can only have a single root DialogFlow in a Task');        
                }
                result.rootDialogFlow = dialogFlow;
            }
            else {
                if (dialogFlow.name === undefined || dialogFlow.name === '') {
                    throw new Error('non-root DialogFlows require a name');
                }
                result.nonRootDialogFlows[dialogFlow.name] = dialogFlow;
            }
        }
    }
    return result;
};

const readDialogFlowRef = function (task, sharedDialogFlows) {
    const childNodes = task.getElementsByTagName('DialogFlowRef');
    if (childNodes.length !== 1) {
        throw new Error('Expected a single DialogFlowRef element');
    }
    const dialogFlowRef = childNodes[0];
    const refTo = dialogFlowRef.getAttributeNode('refTo');
    if (refTo === undefined) {
        throw new Error('Expected refTo attribute on DialogFlowRef');
    }
    const result = sharedDialogFlows[refTo.value];
    if (result === undefined) {
        throw new Error(`Could not find shared dialog flow "${refTo.value}"`);
    }
    return result;
};

const readDialogFlow = function (element) {
    const name = element.getAttribute('name');
    const stateTransitionTable = readStateTransitionTable(element);
    const transitions = readTransitions(element);
    const isRootFlow = element.getAttribute('isRootFlow') === 'true';
    return { type: 'DialogFlow', name: name, stateTransitionTable: stateTransitionTable, transitions: transitions, isRootFlow: isRootFlow };
};

const readStateTransitionTable = function (dialogFlow) {
    const result = [];
    const transitions = dialogFlow.getElementsByTagName('Transitions');
    if (transitions.length !== 1) {
        throw new Error('expected a single transitions element');
    }
    const initialState = transitions[0].getAttribute('initialState');
    const childNodes = transitions[0].getElementsByTagName('Transition');
    for (let i=0; i<childNodes.length; i++) {
        const element = childNodes.item(i);
        const transition = { to: element.getAttribute('to'), from: element.getAttribute('from') };
        const whenValueIs = element.getAttribute('whenValueIs');
        if (whenValueIs && whenValueIs.length > 0) {
            transition.whenValueIs = whenValueIs;
        }
        result.push(transition);
    }
    return { initialState: initialState, table: result };
};

const readTransitions = function (dialogFlow) {
    const addNamedElement = function (destination, source) {
        for (const element of source) {
            destination[element.name] = element;
        }
    };
    const result = {};
    addNamedElement(result, agentDefinitionTransition.readProcess(dialogFlow));
    addNamedElement(result, agentDefinitionTransition.readRespond(dialogFlow));
    addNamedElement(result, agentDefinitionTransition.readInitial(dialogFlow));
    addNamedElement(result, agentDefinitionTransition.readPrompt(dialogFlow));
    addNamedElement(result, agentDefinitionTransition.readReturn(dialogFlow));
    addNamedElement(result, agentDefinitionTransition.readEnd(dialogFlow));
    addNamedElement(result, agentDefinitionTransition.readDialogFlowRef(dialogFlow));
    return result;
};

module.exports = {
    readTaskDialogFlow: readTaskDialogFlow,
    readDialogFlow: readDialogFlow
};

