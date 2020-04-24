/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'mocha';
import * as path from 'path';
import { TestRunner } from './testing';

describe('SettingsStateTests', function() {
    this.timeout(10000);
    const testRunner = new TestRunner(path.join(__dirname,  '../resources/SettingsStateTests'));
    process.env['MicrosoftAppId'] = 'MICROSOFT_APP_ID';
    process.env['MicrosoftAppPassword'] = 'MICROSOFT_APP_PASSWORD';
    process.env['ApplicationInsightsInstrumentationKey'] = '00000000-0000-0000-0000-000000000000';

    it('SettingsTest', async () => {
        await testRunner.runTestScript('SettingsStateTests_SettingsTest');
    });

    it('TestTurnStateAcrossBoundaries', async () => {
        await testRunner.runTestScript('SettingsStateTests_TestTurnStateAcrossBoundaries');
    });
});