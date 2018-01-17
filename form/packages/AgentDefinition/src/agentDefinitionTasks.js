// Copyright (c) Microsoft Corporation. All rights reserved.

const agentDefinitionRecognizer = require('./agentDefinitionRecognizer.js');
const agentDefinitionDialogFlow = require('./agentDefinitionDialogFlow.js');
const agentDefinitionTransition = require('./agentDefinitionTransition.js');
const agentDefinitionForms = require('./agentDefinitionForms.js');

const readRespond = function (task) {
    const respond = agentDefinitionTransition.readRespond(task);
    if (respond.length !== 1) {
        throw new Error('expected single Respond element');
    }
    return respond[0];
};

const readProcess = function (task) {
    const process = agentDefinitionTransition.readProcess(task);
    if (process.length !== 1) {
        throw new Error('expected single Process element');
    }
    return process[0];
};

const readRecognizer = function (task) {
    const recognizer = agentDefinitionRecognizer.readRecognizer(task);
    if (recognizer === undefined) {
        throw new Error('no recognizer found');
    }
    return recognizer;
};

const readTrigger = function (task) {
    const triggerType = task.getAttribute('triggerType');
    switch (triggerType) {
        case 'LUISRecognizer':
            return agentDefinitionRecognizer.readLuisRecognizer(task);
        case 'CodeRecognizer':
            return agentDefinitionRecognizer.readCodeRecognizer(task);
        case 'ConversationUpdateRecognizer':
            return agentDefinitionRecognizer.readConversationUpdateRecognizer(task);
        case 'RegexRecognizer':
            return agentDefinitionRecognizer.readRegexRecognizer(task);
        case '':
            return readRecognizer(task);
        default:
            throw new Error('expected the triggerType value to be blank, "LUIS", "Code", "Regex", or "ConversationUpdateRecognizer"');
    }
};

const readAction = function (task, sharedDialogFlows, forms) {
    const doAction = task.getAttribute('doAction');
    switch (doAction) {
        case 'Respond':
            return readRespond(task);
        case 'Process':
            return readProcess(task);
        case 'Form':
            return agentDefinitionForms.readTaskForm(task, forms);
        case '':
        case 'DialogFlow':
            return agentDefinitionDialogFlow.readTaskDialogFlow(task, sharedDialogFlows);
        default:
            throw new Error('expected the doAction value to be blank, "Respond", "Process", "Form" or "DialogFlow"');
    }
};

const readTask = function (task, sharedDialogFlows, forms) {
    const name = task.getAttributeNode('name');
    if (name === undefined) {
        throw new Error('expected Task element to have an attribute "name"');
    }
    try {
        const trigger = readTrigger(task);
        const action = readAction(task, sharedDialogFlows, forms);
        return { type: 'Task', name: name.value, if: trigger, do: action };
    }
    catch (error) {
        throw new Error(`error processing Task '${name}' ${error}`);
    }
};

const readTasks = function (agent, sharedDialogFlows, forms) {
    const results = [];
    const tasks = agent.getElementsByTagName('Task');
    const names = new Set();
    for (let i = 0; i < tasks.length; i++) {
        const task = readTask(tasks.item(i), sharedDialogFlows, forms);
        if (names.has(task.name)) {
            throw new Error(`Task name '${task.name}' is not unique`);
        }
        names.add(task.name);
        results.push(task);
    }
    return results;
};

module.exports = {
    readTasks: readTasks
};
