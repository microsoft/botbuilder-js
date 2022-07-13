const { TestUtils } = require('..');
const { makeResourceExplorer } = require('./utils');

describe('SettingsStateTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('SettingsStateTests');
    });

    process.env['MicrosoftAppId'] = 'MICROSOFT_APP_ID';
    process.env['MicrosoftAppPassword'] = 'MICROSOFT_APP_PASSWORD';
    process.env['ApplicationInsights:InstrumentationKey'] = '00000000-0000-0000-0000-000000000000';

    it('SettingsTest', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'SettingsStateTests_SettingsTest');
    });

    it('TestTurnStateAcrossBoundaries', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'SettingsStateTests_TestTurnStateAcrossBoundaries');
    });
});
