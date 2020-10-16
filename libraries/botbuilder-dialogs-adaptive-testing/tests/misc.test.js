const path = require('path');
const { TestRunner } = require('../lib');

describe('MiscTests', function() {
    this.timeout(10000);
    const testRunner = new TestRunner(path.join(__dirname,  'resources/MiscTests'));

    it('IfCondition_EndDialog', async () => {
        await testRunner.runTestScript('IfCondition_EndDialog');
    });

    it('Rule_Reprompt', async () => {
        await testRunner.runTestScript('Rule_Reprompt');
    });
});