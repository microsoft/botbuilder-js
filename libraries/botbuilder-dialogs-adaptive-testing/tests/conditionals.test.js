const path = require('path');
const { ComponentRegistration } = require('botbuilder-core');
const { AdaptiveComponentRegistration } = require('botbuilder-dialogs-adaptive');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { AdaptiveTestComponentRegistration, TestUtils } = require('../lib');

describe('ConditionalsTests', function () {
    this.timeout(5000);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, 'resources/ConditionalsTests'),
        true,
        false
    );

    it('OnActivityTypes', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'ConditionalsTests_OnActivityTypes');
    });

    it('OnCancelDialog', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'ConditionalsTests_OnCancelDialog');
    });

    it('OnChooseIntent', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'ConditionalsTests_OnChooseIntent');
    });

    it('OnIntent', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'ConditionalsTests_OnIntent');
    });

    it('OnIntent with entities', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'ConditionalsTests_OnIntentWithEntities');
    });

    it('OnRepromptDialog', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'ConditionalsTests_OnRepromptDialog');
    });
});
