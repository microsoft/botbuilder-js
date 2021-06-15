/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'mocha';
import * as path from 'path';
import { TestRunner } from './testing';

describe('SettingsStateTests', function() {
    this.timeout(10000);
<<<<<<< HEAD:libraries/botbuilder-dialogs-adaptive-tests/src/settingsState.test.ts
    const testRunner = new TestRunner(path.join(__dirname,  '../resources/SettingsStateTests'));
    process.env['MicrosoftAppId'] = 'MICROSOFT_APP_ID';
    process.env['MicrosoftAppPassword'] = 'MICROSOFT_APP_PASSWORD';
    process.env['ApplicationInsightsInstrumentationKey'] = '00000000-0000-0000-0000-000000000000';
=======
    const testRunner = new TestRunner(path.join(__dirname,  'resources/SettingsStateTests'));

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
>>>>>>> 7dd1ecc3 (fix conflict):libraries/botbuilder-dialogs-adaptive-testing/tests/settingsState.test.js

    it('SettingsTest', async () => {
        await testRunner.runTestScript('SettingsStateTests_SettingsTest');
    });

    it('TestTurnStateAcrossBoundaries', async () => {
        await testRunner.runTestScript('SettingsStateTests_TestTurnStateAcrossBoundaries');
    });
});
