const path = require('path');
const { ComponentRegistration } = require('botbuilder-core');
const { AdaptiveComponentRegistration } = require('botbuilder-dialogs-adaptive');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { AdaptiveTestComponentRegistration, TestUtils } = require('../lib');

describe('ActionScopeTests', function () {
    this.timeout(5000);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, 'resources/FunctionsTests'),
        true,
        false
    );

    it('HasPendingActions', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'hasPendingActions');
    });

    it('IsDialogActive', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'isDialogActive');
    });
});
