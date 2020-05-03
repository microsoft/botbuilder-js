import 'mocha';
import * as path from 'path';
import { TestRunner } from './testing';

describe('ActionScopeTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname,  '../resources/LGGeneratorTests'));

    it('MultiLandE2E', async () => {
        await testRunner.runTestScript('MultiLangE2E');
    });

    it('LGMiddleWare', async () => {
        await testRunner.runTestScript('LGMiddleWare');
    });

    it('LGScopeAccess', async () => {
        await testRunner.runTestScript('LGScopeAccess');
    });
});