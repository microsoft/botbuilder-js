/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'mocha';
import * as path from 'path';
import { TestRunner } from './testing';

describe('SelectorTests', function() {
    this.timeout(10000);
    const testRunner = new TestRunner(path.join(__dirname,  '../resources/SelectorTests'));

    it('ConditionalSelector', async () => {
        await testRunner.runTestScript('SelectorTests_ConditionalSelector');
    });

    it('FirstSelector', async () => {
        await testRunner.runTestScript('SelectorTests_FirstSelector');
    });

    // We don't have MostSpecificSelector yet
    /*
    it('MostSpecificFirstSelector', async () => {
        await testRunner.runTestScript('SelectorTests_MostSpecificFirstSelector');
    });

    it('MostSpecificRandomSelector', async () => {
        await testRunner.runTestScript('SelectorTests_MostSpecificRandomSelector');
    });
    */

    it('Priority', async () => {
        await testRunner.runTestScript('SelectorTests_Priority');
    });

    it('RandomSelector', async () => {
        await testRunner.runTestScript('SelectorTests_RandomSelector');
    });

    // We don't have MostSpecificSelector yet
    /*
    it('RunOnce', async () => {
        await testRunner.runTestScript('SelectorTests_RunOnce');
    });
    */

    it('TrueSelector', async () => {
        await testRunner.runTestScript('SelectorTests_TrueSelector');
    });
});