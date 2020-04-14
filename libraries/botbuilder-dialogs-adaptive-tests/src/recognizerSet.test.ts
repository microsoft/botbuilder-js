/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'mocha';
import * as path from 'path';
import { TestRunner } from './testing';

describe('RecognizerSetTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname,  '../resources/RecognizerSetTests'));

    it('Merge', async () => {
        await testRunner.runTestScript('RecognizerSetTests_Merge');
    });

    it('None', async () => {
        await testRunner.runTestScript('RecognizerSetTests_None');
    });
});
