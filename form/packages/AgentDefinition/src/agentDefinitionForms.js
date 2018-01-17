// Copyright (c) Microsoft Corporation. All rights reserved.

const agentDefinitionFeedback = require('./agentDefinitionFeedback.js');
const agentDefinitionRecognizer = require('./agentDefinitionRecognizer.js');
const agentDefinitionTransition = require('./agentDefinitionTransition.js');

const readConstraints = function (element) {
    const constraints = [];
    for (let i=0; i<element.childNodes.length; i++) {
        const childNode = element.childNodes.item(i);
        if (childNode.tagName === 'Constraint') {
            const type = childNode.getAttributeNode('type');
            const value = childNode.getAttributeNode('value');
            if (type && value) {
                constraints.push({ type: type.value, value: value.value });
            }
        }
    }
    return constraints;
};

const readField = function (element) {
    const field = {};
    const entity = element.getAttributeNode('entity');
    if (entity !== undefined) {
        field.entity = entity.value;
    }
    else {
        return undefined;
    }
    const displayName = element.getAttributeNode('displayName');
    if (displayName !== undefined) {
        field.displayName = displayName.value;
    }
    else {
        field.displayName = entity;
    }
    const dataType = element.getAttributeNode('dataType');
    if (dataType !== undefined) {
        field.dataType = dataType.value;
    }
    else {
        field.dataType = 'String';
    }
    field.required = element.getAttribute('required') === 'true';
    field.acceptsMultipleValues = element.getAttribute('acceptsMultipleValues') === 'true';
    field.preserveInGlobal = element.getAttribute('preserveInGlobal') === 'true';

    field.constraints = readConstraints(element);

    return field;
};

const readPrompt = function (element) {
    const prompt = {};
    const when = element.getAttributeNode('when');
    if (when !== undefined) {
        prompt.when = when.value;
    }
    const feedback = agentDefinitionFeedback.readFeedback(element);
    if (feedback !== undefined) {
        prompt.feedback = feedback;
    }
    else {
        return undefined;
    }
    return prompt;
};

const readAction = function (element) {
    const action = {};
    const type = element.getAttributeNode('type');
    if (type !== undefined) {
        action.name = type.value;
    }
    else {
        return undefined;
    }
    const recognizer = agentDefinitionRecognizer.readRecognizer(element);
    if (recognizer !== undefined) {
        action.if = recognizer;
    }

    action.do = { type: type.value };
    const feedback = agentDefinitionFeedback.readFeedback(element);
    if (feedback !== undefined) {
        action.do.feedback = feedback;
    }

    if (action.name === 'Submit') {
        const processNodes = agentDefinitionTransition.readProcess(element);
        if (processNodes.length > 0) {
            action.onRun = processNodes[0].onRun;
        }
    }
    else {
        if (action.if === undefined) {
            return undefined;
        }
    }

    return action;
};

const readReprompt = function (element) {
    const action = {
        name: 'Reprompt',
        if: { type: 'StopRecognizer' },
        do: { type: 'Reprompt' }
    };

    const feedback = agentDefinitionFeedback.readFeedback(element);
    if (feedback !== undefined) {
        action.do.feedback = feedback;
    }

    return action;
};

const readForm = function (element) {
    const form = { fields: [], prompts: [] };
    const actions = {};
    for (let i=0; i<element.childNodes.length; i++) {
        const childNode = element.childNodes.item(i);
        switch (childNode.tagName) {
            case 'Field': {
                const field = readField(childNode);
                if (field !== undefined) {
                    form.fields.push(field);
                }
                break;
            }
            case 'PromptForInput': {
                const prompt = readPrompt(childNode);
                if (prompt !== undefined) {
                    form.prompts.push(prompt);
                }
                break;
            }
            case 'FormAction': {
                const action = readAction(childNode);
                if (action !== undefined) {
                    actions[action.name] = action;
                }
                break;
            }
            case 'Reprompt': {
                const action = readReprompt(childNode);
                if (action !== undefined) {
                    actions[action.name] = action;
                }
                break;
            }
        }
    }

    form.dispatcher = [];
    if (actions.Cancel) {
        form.dispatcher.push(actions.Cancel);
    }
    if (actions.Help) {
        form.dispatcher.push(actions.Help);
    }
    if (actions.Confirm) {
        form.dispatcher.push(actions.Confirm);
    }
    if (actions.AddOrUpdate) {
        form.dispatcher.push(actions.AddOrUpdate);
    }
    if (actions.Reprompt) {
        form.dispatcher.push(actions.Reprompt);
    }
    
    if (actions.Submit) {
        form.submit = actions.Submit.onRun;
    }
    
    return form;
};

const readForms = function (agent) {
    const elements = agent.getElementsByTagName('AgentDefinition');
    if (elements.length !== 1) {
        throw new Error('Agent requires a nested AgentDefinition');
    }
    const agentDefinition = elements[0];
    const results = {};
    for (let i=0; i<agentDefinition.childNodes.length; i++) {
        const childNode = agentDefinition.childNodes.item(i);
        if (childNode.nodeType === 1 && childNode.tagName === 'Form') {
            const name = childNode.getAttributeNode('name');
            if (name === undefined) {
                throw new Error('Forms must be named');
            }
            if (name in results) {
                throw new Error('Forms must have unique names');
            }
            results[name.value] = readForm(childNode);
        }
    }
    return results;
};

const readFormRef = function (task, forms) {
    const childNodes = task.getElementsByTagName('FormRef');
    if (childNodes.length !== 1) {
        throw new Error('Expected a single FormRef element');
    }
    const formRef = childNodes[0];
    const refTo = formRef.getAttributeNode('refTo');
    if (refTo === undefined) {
        throw new Error('Expected refTo attribute on FormRef');
    }
    const result = forms[refTo.value];
    if (result === undefined) {
        throw new Error(`Could not find form "${refTo.value}"`);
    }
    return result;
};

const readTaskForm = function (task, forms) {
    return {
        type: 'Form',
        form: readFormRef(task, forms),
    };
};

module.exports = {
    readForms: readForms,
    readTaskForm: readTaskForm
};
