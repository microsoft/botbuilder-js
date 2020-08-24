const path = require('path');
const { TestRunner } = require('../lib');

describe('ActionScopeTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname,  'resources/InjectLGTests'));

    it('InjectLGTest', async () => {
        await testRunner.runTestScript('inject');
    });

});
