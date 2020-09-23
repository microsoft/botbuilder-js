const path = require('path');
const { TestRunner } = require('../lib');

describe('CrossTrainedRecognizerSetTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname,  'resources/CrossTrainedRecognizerSetTests'));

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

    it('Empty', async () => {
        await testRunner.runTestScript('CrossTrainedRecognizerSetTests_Empty');
    });

    it('NoneWithIntent', async () => {
        await testRunner.runTestScript('CrossTrainedRecognizerSetTests_NoneWithIntent');
    });

    it('EntitiesWithNoneIntent', async () => {
        await testRunner.runTestScript('CrossTrainedRecognizerSetTests_NoneIntentWithEntities');
    });
});
