const { TestUtils } = require('..');
const { makeResourceExplorer } = require('./utils');

describe('SelectorTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('SelectorTests');
    });

    it('ConditionalSelector', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'SelectorTests_ConditionalSelector');
    });

    it('FirstSelector', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'SelectorTests_FirstSelector');
    });

    it('MostSpecificFirstSelector', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'SelectorTests_MostSpecificFirstSelector');
    });

    it('MostSpecificRandomSelector', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'SelectorTests_MostSpecificRandomSelector');
    });

    it('Priority', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'SelectorTests_Priority');
    });

    it('Priority', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'SelectorTests_Float_Priority');
    });

    it('RandomSelector', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'SelectorTests_RandomSelector');
    });

    it('RunOnce', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'SelectorTests_RunOnce');
    });

    it('TrueSelector', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'SelectorTests_TrueSelector');
    });
});
