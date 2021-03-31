// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const path = require('path');
const { AdaptiveBotComponent } = require('botbuilder-dialogs-adaptive');
const { AdaptiveTestBotComponent } = require('..');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { ServiceCollection, noOpConfiguration } = require('botbuilder-dialogs-adaptive-runtime-core');

function makeResourceExplorer(resourceFolder, ...botComponents) {
    const services = new ServiceCollection({
        declarativeTypes: [],
    });

    new AdaptiveBotComponent().configureServices(services, noOpConfiguration);
    new AdaptiveTestBotComponent().configureServices(services, noOpConfiguration);

    botComponents.forEach((BotComponent) => {
        new BotComponent().configureServices(services, noOpConfiguration);
    });

    const declarativeTypes = services.mustMakeInstance('declarativeTypes');

    return new ResourceExplorer({
        declarativeTypes,
    }).addFolder(path.join(__dirname, 'resources', resourceFolder), true, false);
}

module.exports = { makeResourceExplorer };
