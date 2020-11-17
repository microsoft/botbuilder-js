const path = require('path');
const { ComponentRegistration } = require('botbuilder-core');
const { AdaptiveComponentRegistration } = require('botbuilder-dialogs-adaptive');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { AdaptiveTestComponentRegistration, TestUtils } = require('../lib');

describe('RecognizerSetTests', function () {
    this.timeout(5000);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, 'resources/RecognizerSetTests'),
        true,
        false
    );

    it('Merge', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'RecognizerSetTests_Merge');
    });

    it('None', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'RecognizerSetTests_None');
    });
});
