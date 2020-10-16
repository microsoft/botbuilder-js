const path = require('path');
const { TestRunner } = require('../lib');

describe('MultiLanguageRecognizerTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname,  'resources/MultiLanguageRecognizerTests'));

    it('DefaultFallback', async () => {
        await testRunner.runTestScript('MultiLanguageRecognizerTest_DefaultFallback');
    });

    it('EnFallback', async () => {
        await testRunner.runTestScript('MultiLanguageRecognizerTest_EnFallback');
    });

    it('EnGbFallback', async () => {
        await testRunner.runTestScript('MultiLanguageRecognizerTest_EnGbFallback');
    });

    it('EnUsFallback', async () => {
        await testRunner.runTestScript('MultiLanguageRecognizerTest_EnUsFallback');
    });

    it('EnUsFallback_AcitivtyLocaleCasing', async () => {
        await testRunner.runTestScript('MultiLanguageRecognizerTest_EnUsFallback_ActivityLocaleCasing');
    });
});
