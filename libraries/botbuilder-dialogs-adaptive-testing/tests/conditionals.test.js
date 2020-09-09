const path = require('path');
const { TestRunner } = require('../lib');

describe('ConditionalsTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname, 'resources/ConditionalsTests'));

    it('OnActivityTypes', async () => {
        await testRunner.runTestScript('ConditionalsTests_OnActivityTypes');
    });

    it('OnCancelDialog', async () => {
        await testRunner.runTestScript('ConditionalsTests_OnCancelDialog');
    });

    it('OnChooseIntent', async () => {
        await testRunner.runTestScript('ConditionalsTests_OnChooseIntent');
    });

    it('OnIntent', async () => {
        await testRunner.runTestScript('ConditionalsTests_OnIntent');
    });

    it('OnIntent with entities', async () => {
        await testRunner.runTestScript('ConditionalsTests_OnIntentWithEntities');
    });
});
