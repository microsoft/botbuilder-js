/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'mocha';
import { TestRunner } from 'botbuilder-dialogs-adaptive';

describe('Conditions', () => {
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
