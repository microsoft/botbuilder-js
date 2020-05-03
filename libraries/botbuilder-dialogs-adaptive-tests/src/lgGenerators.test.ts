import 'mocha';
import * as path from 'path';
import { TestRunner } from './testing';

describe('ActionScopeTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname,  '../resources/LGGeneratorTests'));

    it('Break', async () => {
        await testRunner.runTestScript('MultiLangE2E');
    });

    it('Break', async () => {
        await testRunner.runTestScript('LGMiddleWare');
    });
});