const path = require('path');
const { ComponentRegistration } = require('botbuilder-core');
const { AdaptiveComponentRegistration } = require('botbuilder-dialogs-adaptive');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { AdaptiveTestComponentRegistration, TestUtils } = require('../lib');

describe('ValueRecognizerTests', function () {
    this.timeout(5000);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, 'resources/ValueRecognizerTests'),
        true,
        false
    );

    it('WithIntent', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'ValueRecognizerTests_WithIntent');
    });

    it('WithNoIntent', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'ValueRecognizerTests_WithNoIntent');
    });
});
