// Copyright (c) Microsoft Corporation. All rights reserved.

const agentDefinitionTasks = require('./agentDefinitionTasks.js');
const agentDefinitionTemplates = require('./agentDefinitionTemplates.js');
const agentDefinitionIntentTips = require('./agentDefinitionIntentTips.js');
const agentDefinitionSharedDialogFlows = require('./agentDefinitionSharedDialogFlows.js');
const agentDefinitionResources = require('./agentDefinitionResources.js');
const agentDefinitionForms = require('./agentDefinitionForms.js');

const readAgentDefinition = function (agentXml) {
    const templates = agentDefinitionTemplates.readTemplates(agentXml);
    const intentTips = agentDefinitionIntentTips.readIntentTips(agentXml);
    const resources = agentDefinitionResources.readResources(agentXml);
    for (const name in intentTips) {
        templates[name] = intentTips[name];
    }
    const sharedDialogFlows = agentDefinitionSharedDialogFlows.readSharedDialogFlows(agentXml);
    const forms = agentDefinitionForms.readForms(agentXml);
    return {
        tasks: agentDefinitionTasks.readTasks(agentXml, sharedDialogFlows, forms),
        templates: templates,
        sharedDialogFlows: sharedDialogFlows,
        resources: resources,
        forms: forms
    };
};

module.exports = {
    readAgentDefinition: readAgentDefinition
};
