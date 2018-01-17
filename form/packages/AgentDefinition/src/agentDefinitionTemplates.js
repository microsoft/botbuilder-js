// Copyright (c) Microsoft Corporation. All rights reserved.

const agentDefinitionFeedback = require('./agentDefinitionFeedback.js');

const readSimpleTemplates = function (agent, result) {
    const templates = agent.getElementsByTagName('SimpleResponseTemplate');
    for (let i=0; i<templates.length; i++) {
        const template = templates.item(i);
        const name = template.getAttribute('name');
        if (name === undefined) {
            throw new Error('Expected attribute "name" on SimpleResponseTemplate.');
        }
        const feedback = agentDefinitionFeedback.readFeedback(template);
        if (name in result) {
            throw new Error(`Template name "${name}" is not unique.`);
        }
        result[name] = {
            type: template.tagName,
            feedback: feedback
        };
    }
};

const readConditionalTemplateCases = function (name, template) {
    const result = {};
    const cases = template.getElementsByTagName('Case');
    for (let i=0; i<cases.length; i++) {
        const _case = cases.item(i);
        const value = _case.getAttribute('value');
        if (value === undefined) {
            throw new Error(`Expected attribuite "value" on Case element in Template "${name}".`);
        }
        if (value in result) {
            throw new Error(`The Case value "${value}" is not unique on Template "${name}".`);
        }
        const feedback = agentDefinitionFeedback.readFeedback(_case);
        result[value] = feedback;
    }
    return result;
};

const readConditionalTemplates = function (agent, result) {
    const templates = agent.getElementsByTagName('ConditionalResponseTemplate');
    for (let i=0; i<templates.length; i++) {
        const template = templates.item(i);
        const name = template.getAttribute('name');
        if (name === undefined) {
            throw new Error('Expected attribute "name" on ConditionalResponseTemplate.');
        }
        const onRun = template.getAttribute('onRun');
        if (onRun === undefined) {
            throw new Error('Expected attribute "onRun" on ConditionalResponseTemplate.');
        }
        if (name in result) {
            throw new Error(`Template name "${name}" is not unique.`);
        }
        result[name] = {
            type: template.tagName,
            name: name,
            onRun: onRun,
            cases: readConditionalTemplateCases(name, template)
        };
    }
};

const readTemplates = function (agent) {
    const templates = {};
    readSimpleTemplates(agent, templates);
    readConditionalTemplates(agent, templates);
    return templates;
};

module.exports = {
    readTemplates: readTemplates
};
