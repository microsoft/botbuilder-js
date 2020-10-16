const path = require('path');
const { TestRunner } = require('../lib');

describe('ValueRecognizerTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname,  'resources/ValueRecognizerTests'));

    it('WithIntent', async () => {
        await testRunner.runTestScript('ValueRecognizerTests_WithIntent');
    });

    it('WithNoIntent', async () => {
        await testRunner.runTestScript('ValueRecognizerTests_WithNoIntent');
    });
});
