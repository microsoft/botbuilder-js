const path = require('path');
const { ComponentRegistration } = require('botbuilder-core');
const { AdaptiveComponentRegistration } = require('botbuilder-dialogs-adaptive');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { AdaptiveTestComponentRegistration, TestUtils } = require('../lib');

describe('SelectorTests', function () {
    this.timeout(10000);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, 'resources/SelectorTests'),
        true,
        false
    );

    it('ConditionalSelector', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'SelectorTests_ConditionalSelector');
    });

    it('FirstSelector', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'SelectorTests_FirstSelector');
    });

    it('MostSpecificFirstSelector', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'SelectorTests_MostSpecificFirstSelector');
    });

    it('MostSpecificRandomSelector', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'SelectorTests_MostSpecificRandomSelector');
    });

    it('Priority', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'SelectorTests_Priority');
    });

    it('Priority', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'SelectorTests_Float_Priority');
    });

    it('RandomSelector', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'SelectorTests_RandomSelector');
    });

    it('RunOnce', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'SelectorTests_RunOnce');
    });

    it('TrueSelector', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'SelectorTests_TrueSelector');
    });
});
