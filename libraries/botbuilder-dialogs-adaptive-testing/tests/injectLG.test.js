const { TestUtils } = require('../lib');
const { makeResourceExplorer } = require('./utils');

describe('ActionScopeTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('InjectLGTests');
    });

    it('InjectLGTest', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'inject');
    });
});
