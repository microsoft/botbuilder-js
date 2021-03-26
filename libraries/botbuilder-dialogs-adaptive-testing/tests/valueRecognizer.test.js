const { TestUtils } = require('..');
const { makeResourceExplorer } = require('./utils');

describe('ValueRecognizerTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('ValueRecognizerTests');
    });

    it('WithIntent', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'ValueRecognizerTests_WithIntent');
    });

    it('WithNoIntent', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'ValueRecognizerTests_WithNoIntent');
    });
});
