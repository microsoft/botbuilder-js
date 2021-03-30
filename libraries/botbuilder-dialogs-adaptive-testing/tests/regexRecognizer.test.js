const { TestUtils } = require('../lib');
const { makeResourceExplorer } = require('./utils');

describe('RegexRecognizerTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('RegexRecognizerTests');
    });

    it('Entities', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'RegexRecognizerTests_Entities');
    });
});
