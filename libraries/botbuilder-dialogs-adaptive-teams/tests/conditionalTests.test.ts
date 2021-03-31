// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation. All rights reserved.

import path = require('path');
import { AdaptiveBotComponent } from 'botbuilder-dialogs-adaptive';
import { AdaptiveTeamsBotComponent } from '../src';
import { AdaptiveTestBotComponent, TestUtils } from 'botbuilder-dialogs-adaptive-testing';
import { ComponentDeclarativeTypes, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { ServiceCollection, noOpConfiguration } from 'botbuilder-dialogs-adaptive-runtime-core';

describe('Conditional Tests', function () {
    let resourceExplorer: ResourceExplorer;
    beforeEach(function () {
        const services = new ServiceCollection({
            declarativeTypes: [],
        });

        new AdaptiveBotComponent().configureServices(services, noOpConfiguration);
        new AdaptiveTeamsBotComponent().configureServices(services, noOpConfiguration);
        new AdaptiveTestBotComponent().configureServices(services, noOpConfiguration);

        const declarativeTypes = services.mustMakeInstance<ComponentDeclarativeTypes[]>('declarativeTypes');

        resourceExplorer = new ResourceExplorer({ declarativeTypes }).addFolder(
            path.join(__dirname, 'conditionalTests'),
            true,
            false
        );
    });

    it('OnTeamsActivityTypes', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'ConditionalsTests_OnTeamsActivityTypes');
    });
});
