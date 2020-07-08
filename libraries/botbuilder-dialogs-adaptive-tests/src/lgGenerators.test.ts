import 'mocha';
import * as path from 'path';
import { TestRunner } from './testing';

describe('ActionScopeTests', function() {
    this.timeout(5000000);
    const testRunner = new TestRunner(path.join(__dirname,  '../resources/LGGeneratorTests'));

    it('LocaleInExpr', async () => {
        await testRunner.runTestScript('LocaleInExpr');
    });

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