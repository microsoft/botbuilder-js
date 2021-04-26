const path = require('path');
const { LuisAdaptiveRecognizer, LuisBotComponent } = require('botbuilder-ai');
const { MockLuisLoader, MockLuisRecognizer, TestUtils, useMockLuisSettings } = require('../lib');
const { makeResourceExplorer } = require('./utils');

describe('ChooseEntity', function () {
    it('ChooseEntity', async function () {
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
});
