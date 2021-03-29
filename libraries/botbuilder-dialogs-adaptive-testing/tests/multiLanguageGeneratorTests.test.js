const { TestUtils } = require('../lib');
const { makeResourceExplorer } = require('./utils');

describe('MultiLanguageGeneratorTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('MultiLanguageGeneratorTests');
    });

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
