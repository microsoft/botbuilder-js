const { MockLuisLoader, MockLuisRecognizer, TestUtils, useMockLuisSettings } = require('../lib');
const { makeResourceExplorer } = require('./utils');
const path = require('path');
const { LuisAdaptiveRecognizer, LuisBotComponent } = require('botbuilder-ai');

describe('ConditionalsTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('ConditionalsTests');
    });

    it('OnActivityTypes', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'ConditionalsTests_OnActivityTypes');
    });

    it('OnCancelDialog', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'ConditionalsTests_OnCancelDialog');
    });

    it('OnChooseEntity', async function () {
        const resourceDir = path.join(__dirname, 'resources/ChooseEntityTests');
        const config = useMockLuisSettings(resourceDir);
        const resourceExplorer = makeResourceExplorer('ChooseEntityTests', LuisBotComponent);
        resourceExplorer.registerType(
            LuisAdaptiveRecognizer.$kind,
            MockLuisRecognizer,
            new MockLuisLoader(resourceExplorer, config)
        );
        await TestUtils.runTestScript(resourceExplorer, 'ChooseEntity', undefined, config);
    });

    it('OnChooseIntent', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'ConditionalsTests_OnChooseIntent');
    });

    it('OnIntent', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'ConditionalsTests_OnIntent');
    });

    it('OnIntent with entities', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'ConditionalsTests_OnIntentWithEntities');
    });

    it('OnRepromptDialog', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'ConditionalsTests_OnRepromptDialog');
    });
});
