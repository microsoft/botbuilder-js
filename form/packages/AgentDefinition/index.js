// Copyright (c) Microsoft Corporation. All rights reserved.

const agentDefinition = require('./src/agentDefinition.js');
const agentDefinitionTemplates = require('./src/agentDefinitionTemplates.js');
const agentDefinitionIntentTips = require('./src/agentDefinitionIntentTips.js');

module.exports = {
    readTemplates : agentDefinitionTemplates.readTemplates,
    readIntentTips : agentDefinitionIntentTips.readIntentTips,
    readAgentDefinition : agentDefinition.readAgentDefinition
};
