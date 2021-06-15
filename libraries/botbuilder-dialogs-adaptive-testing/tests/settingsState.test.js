const { TestUtils } = require('..');
const { makeResourceExplorer } = require('./utils');

describe('SettingsStateTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('SettingsStateTests');
    });

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
