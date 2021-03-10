const path = require('path');
const { ComponentRegistration } = require('botbuilder-core');
const { AdaptiveComponentRegistration } = require('botbuilder-dialogs-adaptive');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { AdaptiveTestComponentRegistration, TestUtils } = require('../lib');

describe('MultiLanguageRecognizerTests', function () {
    this.timeout(5000);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, 'resources/MultiLanguageRecognizerTests'),
        true,
        false
    );

    it('DefaultFallback', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'MultiLanguageRecognizerTest_DefaultFallback');
    });

    it('EnFallback', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'MultiLanguageRecognizerTest_EnFallback');
    });

    it('EnGbFallback', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'MultiLanguageRecognizerTest_EnGbFallback');
    });

    it('EnUsFallback', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'MultiLanguageRecognizerTest_EnUsFallback');
    });

    it('EnUsFallback_AcitivtyLocaleCasing', async () => {
        await TestUtils.runTestScript(
            resourceExplorer,
            'MultiLanguageRecognizerTest_EnUsFallback_ActivityLocaleCasing'
        );
    });

    it('LanguagePolicy', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'MultiLanguageRecognizerTest_LanguagePolicy');
    });

    it('Locale case insensitivity', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'MultiLanguageRecognizerTest_LocaleCaseInsensitivity');
    });
});
