const { TestUtils } = require('../lib');
const { makeResourceExplorer } = require('./utils');

describe('MiscTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('MiscTests');
    });

    it('IfCondition_EndDialog', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'IfCondition_EndDialog');
    });

    it('Rule_Reprompt', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Rule_Reprompt');
    });
});
