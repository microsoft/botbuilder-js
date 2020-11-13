const path = require('path');
const { ComponentRegistration } = require('botbuilder-core');
const { AdaptiveComponentRegistration } = require('botbuilder-dialogs-adaptive');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { AdaptiveTestComponentRegistration, TestUtils } = require('../lib');

describe('ActionScopeTests', function () {
    this.timeout(5000);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, 'resources/ActionScopeTests'),
        true,
        false
    );

    it('Break', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'ActionScope_Break');
    });

    it('Continue', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'ActionScope_Continue');
    });

    it('Goto_Nowhere', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'ActionScope_Goto_Nowhere');
    });

    it('Goto_OnIntent', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'ActionScope_Goto_OnIntent');
    });

    it('Goto_Parent', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'ActionScope_Goto_Parent');
    });

    it('Goto_Switch', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'ActionScope_Goto_Switch');
    });

    it('Goto', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'ActionScope_Goto');
    });
});
