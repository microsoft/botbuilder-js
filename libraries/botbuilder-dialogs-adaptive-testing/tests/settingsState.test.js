const path = require('path');
const { ComponentRegistration } = require('botbuilder-core');
const { AdaptiveComponentRegistration } = require('botbuilder-dialogs-adaptive');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { AdaptiveTestComponentRegistration, TestUtils } = require('../lib');

describe('SettingsStateTests', function () {
    this.timeout(10000);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, 'resources/SettingsStateTests'),
        true,
        false
    );

    beforeEach(() => {
        process.env['MicrosoftAppId'] = 'MICROSOFT_APP_ID';
        process.env['MicrosoftAppPassword'] = 'MICROSOFT_APP_PASSWORD';
        process.env['ApplicationInsights:InstrumentationKey'] = '00000000-0000-0000-0000-000000000000';
    });

    afterEach(() => {
        delete process.env['MicrosoftAppId'];
        delete process.env['MicrosoftAppPassword'];
        delete process.env['ApplicationInsights:InstrumentationKey'];
    });

    it('SettingsTest', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'SettingsStateTests_SettingsTest');
    });

    it('TestTurnStateAcrossBoundaries', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'SettingsStateTests_TestTurnStateAcrossBoundaries');
    });
});
