const { TestUtils } = require('..');
const { makeResourceExplorer } = require('./utils');

describe('SelectorTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('SelectorTests');
    });

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
