const { TestUtils } = require('../lib');
const { makeResourceExplorer } = require('./utils');

describe('LGGeneratorTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('LGGeneratorTests');
    });

    it('MultiLandE2E', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'MultiLangE2E');
    });

    it('LGMiddleWare', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'LGMiddleWare');
    });

    it('LGScopeAccess', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'LGScopeAccess');
    });

    it('No Language Generator', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'NoLanguageGeneration');
    });

    it('Customize Language Policy', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'CustomizeLanguagePolicy');
    });

    it('LocaleInExpr', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'LocaleInExpr');
    });

    it('Manually set locale', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'manuallySetLocale');
    });
});
