const { TestUtils } = require('../lib');
const { makeResourceExplorer } = require('./utils');

describe('ConditionalsTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('ConditionalsTests');
    });

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
