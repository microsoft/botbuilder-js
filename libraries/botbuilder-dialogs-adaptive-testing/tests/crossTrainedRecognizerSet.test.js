const path = require('path');
const { ComponentRegistration } = require('botbuilder-core');
const { AdaptiveComponentRegistration } = require('botbuilder-dialogs-adaptive');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { AdaptiveTestComponentRegistration, TestUtils } = require('../lib');

describe('CrossTrainedRecognizerSetTests', function () {
    this.timeout(5000);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, 'resources/CrossTrainedRecognizerSetTests'),
        true,
        false
    );

    it('AllNone', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_AllNone');
    });

    it('CircleDefer', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_CircleDefer');
    });

    it('DoubleDefer', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_DoubleDefer');
    });

    it('DoubleIntent', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_DoubleIntent');
    });

    it('Empty', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_Empty');
    });

    it('NoneWithIntent', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_NoneWithIntent');
    });

    it('EntitiesWithNoneIntent', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_NoneIntentWithEntities');
    });
});
