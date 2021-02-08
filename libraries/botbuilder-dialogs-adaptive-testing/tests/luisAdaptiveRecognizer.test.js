const path = require('path');
const { ComponentRegistration } = require('botbuilder-core');
const { LuisComponentRegistration, LuisAdaptiveRecognizer } = require('botbuilder-ai');
const { AdaptiveComponentRegistration } = require('botbuilder-dialogs-adaptive');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const {
    AdaptiveTestComponentRegistration,
    MockLuisLoader,
    MockLuisRecognizer,
    TestUtils,
    useMockLuisSettings,
} = require('../lib');

describe('LuisAdaptiveRecognizerTests', function () {
    this.timeout(5000);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());
    ComponentRegistration.add(new LuisComponentRegistration());

    it('Dynamic lists', async () => {
        const resourceDir = path.join(__dirname, 'resources/LuisAdaptiveRecognizerTests');
        const config = useMockLuisSettings(resourceDir);
        const explorer = new ResourceExplorer().addFolder(
            path.join(__dirname, 'resources/LuisAdaptiveRecognizerTests'),
            true,
            false
        );
        explorer.registerType(LuisAdaptiveRecognizer.$kind, MockLuisRecognizer, new MockLuisLoader(explorer, config));
        await TestUtils.runTestScript(explorer, 'DynamicLists', undefined, config);
    });

    it('Dynamic lists expression', async () => {
        const resourceDir = path.join(__dirname, 'resources/LuisAdaptiveRecognizerTests');
        const config = useMockLuisSettings(resourceDir);
        const explorer = new ResourceExplorer().addFolder(
            path.join(__dirname, 'resources/LuisAdaptiveRecognizerTests'),
            true,
            false
        );
        explorer.registerType(LuisAdaptiveRecognizer.$kind, MockLuisRecognizer, new MockLuisLoader(explorer, config));
        await TestUtils.runTestScript(explorer, 'DynamicListsExpression', undefined, config);
    });

    it('ExternalEntities', async () => {
        const resourceDir = path.join(__dirname, 'resources/LuisAdaptiveRecognizerTests');
        const config = useMockLuisSettings(resourceDir);
        const explorer = new ResourceExplorer().addFolder(
            path.join(__dirname, 'resources/LuisAdaptiveRecognizerTests'),
            true,
            false
        );
        explorer.registerType(LuisAdaptiveRecognizer.$kind, MockLuisRecognizer, new MockLuisLoader(explorer, config));
        await TestUtils.runTestScript(explorer, 'ExternalEntities', undefined, config);
    });
});
