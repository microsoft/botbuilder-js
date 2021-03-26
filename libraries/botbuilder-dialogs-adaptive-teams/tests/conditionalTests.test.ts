// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation. All rights reserved.

import path = require('path');
import { AdaptiveBotComponent } from 'botbuilder-dialogs-adaptive';
import { AdaptiveTeamsBotComponent } from '../src';
import { AdaptiveTestBotComponent, TestUtils } from 'botbuilder-dialogs-adaptive-testing';
import { ComponentDeclarativeTypes, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { Configuration, ServiceCollection } from 'botbuilder-runtime-core';

describe('Conditional Tests', function () {
    let resourceExplorer: ResourceExplorer;
    beforeEach(function () {
        const services = new ServiceCollection({
            declarativeTypes: [],
        });

        const configuration: Configuration = {
            get(_path) {
                return undefined;
            },
            set(_path, _value) {},
        };

        new AdaptiveBotComponent().configureServices(services, configuration);
        new AdaptiveTeamsBotComponent().configureServices(services, configuration);
        new AdaptiveTestBotComponent().configureServices(services, configuration);

        const declarativeTypes = services.mustMakeInstance<ComponentDeclarativeTypes[]>('declarativeTypes');

        resourceExplorer = new ResourceExplorer({ declarativeTypes }).addFolder(
            path.join(__dirname, 'conditionalTests'),
            true,
            false
        );
    });

    it('OnTeamsActivityTypes', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'ConditionalsTests_OnTeamsActivityTypes');
    });
});
