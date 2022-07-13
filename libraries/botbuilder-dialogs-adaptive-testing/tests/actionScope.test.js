const { TestUtils } = require('../lib');
const { makeResourceExplorer } = require('./utils');

describe('ActionScopeTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('ActionScopeTests');
    });

    it('Break', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'ActionScope_Break');
    });

    it('Continue', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'ActionScope_Continue');
    });

    it('Goto_Nowhere', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'ActionScope_Goto_Nowhere');
    });

    it('Goto_OnIntent', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'ActionScope_Goto_OnIntent');
    });

    it('Goto_Parent', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'ActionScope_Goto_Parent');
    });

    it('Goto_Switch', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'ActionScope_Goto_Switch');
    });

    it('Goto', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'ActionScope_Goto');
    });
});
