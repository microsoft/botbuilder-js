const path = require('path');
const { ComponentRegistration } = require('botbuilder-core');
const { AdaptiveComponentRegistration } = require('botbuilder-dialogs-adaptive');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { AdaptiveTestComponentRegistration, TestUtils } = require('../lib');

describe('LGGeneratorTests', function () {
    this.timeout(5000);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, 'resources/LGGeneratorTests'),
        true,
        false
    );

    it('MultiLandE2E', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'MultiLangE2E');
    });

    it('LGMiddleWare', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'LGMiddleWare');
    });

    it('LGScopeAccess', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'LGScopeAccess');
    });

    it('No Language Generator', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'NoLanguageGeneration');
    });

    it('Customize Language Policy', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'CustomizeLanguagePolicy');
    });

    it('LocaleInExpr', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'LocaleInExpr');
    });

    it('Manually set locale', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'manuallySetLocale');
    });
});
