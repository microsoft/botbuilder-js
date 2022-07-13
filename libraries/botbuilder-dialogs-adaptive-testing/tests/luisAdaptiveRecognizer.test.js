const path = require('path');
const { LuisAdaptiveRecognizer, LuisBotComponent } = require('botbuilder-ai');
const { MockLuisLoader, MockLuisRecognizer, TestUtils, useMockLuisSettings } = require('../lib');
const { makeResourceExplorer } = require('./utils');

describe('LuisAdaptiveRecognizerTests', function () {
    it('Dynamic lists', async function () {
        const resourceDir = path.join(__dirname, 'resources/LuisAdaptiveRecognizerTests');
        const config = useMockLuisSettings(resourceDir);
        const explorer = makeResourceExplorer('LuisAdaptiveRecognizerTests', LuisBotComponent);
        explorer.registerType(LuisAdaptiveRecognizer.$kind, MockLuisRecognizer, new MockLuisLoader(explorer, config));
        await TestUtils.runTestScript(explorer, 'DynamicLists', undefined, config);
    });

    it('Dynamic lists expression', async function () {
        const resourceDir = path.join(__dirname, 'resources/LuisAdaptiveRecognizerTests');
        const config = useMockLuisSettings(resourceDir);
        const explorer = makeResourceExplorer('LuisAdaptiveRecognizerTests', LuisBotComponent);
        explorer.registerType(LuisAdaptiveRecognizer.$kind, MockLuisRecognizer, new MockLuisLoader(explorer, config));
        await TestUtils.runTestScript(explorer, 'DynamicListsExpression', undefined, config);
    });

    it('ExternalEntities', async function () {
        const resourceDir = path.join(__dirname, 'resources/LuisAdaptiveRecognizerTests');
        const config = useMockLuisSettings(resourceDir);
        const explorer = makeResourceExplorer('LuisAdaptiveRecognizerTests', LuisBotComponent);
        explorer.registerType(LuisAdaptiveRecognizer.$kind, MockLuisRecognizer, new MockLuisLoader(explorer, config));
        await TestUtils.runTestScript(explorer, 'ExternalEntities', undefined, config);
    });

    it('Cached Luis Result', async function () {
        const resourceDir = path.join(__dirname, 'resources/LuisAdaptiveRecognizerTests');
        const config = useMockLuisSettings(resourceDir);
        const explorer = makeResourceExplorer('LuisAdaptiveRecognizerTests', LuisBotComponent);
        explorer.registerType(LuisAdaptiveRecognizer.$kind, MockLuisRecognizer, new MockLuisLoader(explorer, config));
        await TestUtils.runTestScript(explorer, 'CacheLuisRecognizer', undefined, config);
    });
});
