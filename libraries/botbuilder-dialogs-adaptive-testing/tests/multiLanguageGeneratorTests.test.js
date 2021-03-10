const path = require('path');
const { ComponentRegistration } = require('botbuilder-core');
const { AdaptiveComponentRegistration } = require('botbuilder-dialogs-adaptive');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { AdaptiveTestComponentRegistration, TestUtils } = require('../lib');

describe('MultiLanguageGeneratorTests', function () {
    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, 'resources/MultiLanguageGeneratorTests'),
        true,
        false
    );

    it('Switch Language Activity', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'SwitchLanguageActivity');
    });

    it('Switch Language Conversation', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'SwitchLanguageConversation');
    });

    it('Switch Language Turn', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'SwitchLanguageTurn');
    });

    it('Switch Language Turn Activity', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'SwitchLanguageTurnActivity');
    });
});
