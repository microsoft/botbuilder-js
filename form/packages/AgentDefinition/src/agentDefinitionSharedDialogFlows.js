// Copyright (c) Microsoft Corporation. All rights reserved.

const agentDefinitionDialogFlow = require('./agentDefinitionDialogFlow.js');

const readSharedDialogFlows = function (agent) {
    const elements = agent.getElementsByTagName('AgentDefinition');
    if (elements.length !== 1) {
        throw new Error('Agent requires a nested AgentDefinition');
    }
    const agentDefinition = elements[0];
    const results = {};
    for (let i=0; i<agentDefinition.childNodes.length; i++) {
        const childNode = agentDefinition.childNodes.item(i);
        if (childNode.nodeType === 1 && childNode.tagName === 'DialogFlow') {
            const name = childNode.getAttribute('name');
            if (name === undefined) {
                throw new Error('Shared DialogFlows must be named');
            }
            if (name in results) {
                throw new Error('Shared DialogFlows must have unique names');
            }
            results[name] = agentDefinitionDialogFlow.readDialogFlow(childNode);
        }
    }
    return results;
};

module.exports = {
    readSharedDialogFlows: readSharedDialogFlows
};