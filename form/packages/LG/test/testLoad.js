// Copyright (c) Microsoft Corporation. All rights reserved.

const fs = require('fs');
const path = require('path');
const DOMParser = require('xmldom').DOMParser;
const agentDefinition = require('../../AgentDefinition/index.js');

const loadXmlSync = function (path) {
    const data = fs.readFileSync(path, 'utf8');
    return new DOMParser().parseFromString(data);
};

const templates = function (fileName, codeBehind = {}) {
    const fullName = path.resolve(__dirname, './data/templates/', fileName);
    return agentDefinition.readTemplates(loadXmlSync(fullName), codeBehind);
};

const intentTips = function (fileName) {
    const fullName = path.resolve(__dirname, './data/intenttips/', fileName);
    return agentDefinition.readIntentTips(loadXmlSync(fullName));
};

module.exports = {
    intentTips: intentTips,
    templates: templates
};
