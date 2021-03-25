// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation. All rights reserved.

import 'mocha';
import { ComponentRegistration } from 'botbuilder';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { TeamsComponentRegistration } from '../lib';
import path = require('path');
import { AdaptiveTestComponentRegistration, TestUtils } from 'botbuilder-dialogs-adaptive-testing';
import { AdaptiveComponentRegistration } from 'botbuilder-dialogs-adaptive';

describe('Conditional Tests', function () {
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());
    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new TeamsComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(path.join(__dirname, 'conditionalTests'), true, false);

    it('OnTeamsActivityTypes', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'ConditionalsTests_OnTeamsActivityTypes');
    });
});
