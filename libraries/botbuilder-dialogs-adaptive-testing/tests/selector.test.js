const path = require('path');
const { TestRunner } = require('../lib');

describe('SelectorTests', function() {
    this.timeout(10000);
    const testRunner = new TestRunner(path.join(__dirname,  'resources/SelectorTests'));

    it('ConditionalSelector', async () => {
        await testRunner.runTestScript('SelectorTests_ConditionalSelector');
    });

    it('FirstSelector', async () => {
        await testRunner.runTestScript('SelectorTests_FirstSelector');
    });

    // We don't have MostSpecificSelector yet
    /*
    it('MostSpecificFirstSelector', async () => {
        await testRunner.runTestScript('SelectorTests_MostSpecificFirstSelector');
    });

    it('MostSpecificRandomSelector', async () => {
        await testRunner.runTestScript('SelectorTests_MostSpecificRandomSelector');
    });
    */

    it('Priority', async () => {
        await testRunner.runTestScript('SelectorTests_Priority');
    });

    it('RandomSelector', async () => {
        await testRunner.runTestScript('SelectorTests_RandomSelector');
    });

    it('RunOnce', async () => {
        await testRunner.runTestScript('SelectorTests_RunOnce');
    });

    it('TrueSelector', async () => {
        await testRunner.runTestScript('SelectorTests_TrueSelector');
    });
});