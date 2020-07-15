const path = require('path');
const { TestRunner } = require('../lib');

describe('RegexRecognizerTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname,  'resources/RegexRecognizerTests'));

    it('Entities', async () => {
        await testRunner.runTestScript('RegexRecognizerTests_Entities');
    });
});
