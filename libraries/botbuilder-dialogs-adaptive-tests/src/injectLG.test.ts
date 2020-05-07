/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'mocha';
import * as path from 'path';
import { TestRunner } from './testing';

describe('ActionScopeTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname,  '../resources/InjectLGTests'));

    it('InjectLGTest', async () => {
        await testRunner.runTestScript('inject');
    });

});