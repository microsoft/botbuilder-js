const path = require('path');
const { TestRunner } = require('../lib');

describe('LGGeneratorTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname,  'resources/LGGeneratorTests'));

    it('MultiLandE2E', async () => {
        await testRunner.runTestScript('MultiLangE2E');
    });

    it('LGMiddleWare', async () => {
        await testRunner.runTestScript('LGMiddleWare');
    });

    it('LGScopeAccess', async () => {
        await testRunner.runTestScript('LGScopeAccess');
    });

    it('No Language Generator', async () => {
        await testRunner.runTestScript('NoLanguageGeneration');
    });

    it('Customize Language Policy', async () => {
        await testRunner.runTestScript('CustomizeLanguagePolicy');
    });
});