const path = require('path');
const { ComponentRegistration } = require('botbuilder-core');
const { AdaptiveComponentRegistration } = require('botbuilder-dialogs-adaptive');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { AdaptiveTestComponentRegistration, TestUtils } = require('../lib');

describe('MiscTests', function () {
    this.timeout(10000);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(path.join(__dirname, 'resources/MiscTests'), true, false);

    it('IfCondition_EndDialog', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'IfCondition_EndDialog');
    });

    it('Rule_Reprompt', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Rule_Reprompt');
    });
});
