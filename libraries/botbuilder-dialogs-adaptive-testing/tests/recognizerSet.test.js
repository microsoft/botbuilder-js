const path = require('path');
const { TestRunner } = require('../lib');

describe('RecognizerSetTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname,  'resources/RecognizerSetTests'));

    it('Merge', async () => {
        await testRunner.runTestScript('RecognizerSetTests_Merge');
    });

    it('None', async () => {
        await testRunner.runTestScript('RecognizerSetTests_None');
    });
});
