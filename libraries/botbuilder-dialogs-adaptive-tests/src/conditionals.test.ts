/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'mocha';
import * as path from 'path';
import { TestRunner } from './testing';

describe('ConditionalsTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname, '../resources/ConditionalsTests'));

    it('OnIntent', async () => {
        await testRunner.runTestScript('ConditionalsTests_OnIntent');
    });

    it('OnIntent with entities', async () => {
        await testRunner.runTestScript('ConditionalsTests_OnIntentWithEntities');
    });

    it('OnActivityTypes', async () => {
        await testRunner.runTestScript('ConditionalsTests_OnActivityTypes');
    });

    it('OnChooseIntent', async () => {
        await testRunner.runTestScript('ConditionalsTests_OnChooseIntent');
    });
});
