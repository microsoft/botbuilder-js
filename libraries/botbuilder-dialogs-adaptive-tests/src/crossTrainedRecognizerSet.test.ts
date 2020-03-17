/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'mocha';
import { TestRunner } from './testing';

describe('CrossTrainedRecognizerSetTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner('resources/CrossTrainedRecognizerSetTests');

    it('AllNone', async () => {
        await testRunner.runTestScript('CrossTrainedRecognizerSetTests_AllNone');
    });

    it('CircleDefer', async () => {
        await testRunner.runTestScript('CrossTrainedRecognizerSetTests_CircleDefer');
    });

    it('DoubleDefer', async () => {
        await testRunner.runTestScript('CrossTrainedRecognizerSetTests_DoubleDefer');
    });

    it('DoubleIntent', async () => {
        await testRunner.runTestScript('CrossTrainedRecognizerSetTests_DoubleIntent');
    });

    it('NoneWithIntent', async () => {
        await testRunner.runTestScript('CrossTrainedRecognizerSetTests_NoneWithIntent');
    });
});
