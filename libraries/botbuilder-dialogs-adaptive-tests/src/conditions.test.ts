/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'mocha';
import { TestRunner } from './testing';

describe('Conditions', function() {
    this.timeout(5000);
    const testRunner = new TestRunner('resources/conditionsTests');

    it('OnIntent', async () => {
        await testRunner.runTestScript('OnIntent');
    });

    it('OnIntent with entities', async () => {
        await testRunner.runTestScript('OnIntentWithEntities');
    });

    it('OnActivityTypes', async () => {
        await testRunner.runTestScript('OnActivityTypes');
    });
});
