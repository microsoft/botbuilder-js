// Copyright (c) Microsoft Corporation. All rights reserved.

const readResources = function (agent) {
    const elements = agent.getElementsByTagName('Resources');
    if (elements.length == 0) {
        return {};
    }
    if (elements.length > 1) {
        throw new Error('Multiple resources found in agent Xml');
    }
    const result = {};
    const resourcesElement = elements[0];
    var functionElements = resourcesElement.getElementsByTagName('Function');
    for (let i = 0; i < functionElements.length; i++) {
        const childNode = functionElements.item(i);
        const app = childNode.getAttribute('app');
        const name = childNode.getAttribute('function');
        const uri = childNode.getAttribute('href');

        if (app && name && uri) {
            result[app] = result[app] || {};
            result[app][name] = { href: uri };
        }
    }
    return result;
};

module.exports.readResources = readResources;