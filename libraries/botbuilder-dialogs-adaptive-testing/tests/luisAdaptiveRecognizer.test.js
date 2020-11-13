const path = require('path');
const nock = require('nock');
const { ComponentRegistration } = require('botbuilder-core');
const { LuisComponentRegistration } = require('botbuilder-ai');
const { AdaptiveComponentRegistration } = require('botbuilder-dialogs-adaptive');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { AdaptiveTestComponentRegistration, TestUtils } = require('../lib');

describe('LuisAdaptiveRecognizerTests', function () {
    this.timeout(5000);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());
    ComponentRegistration.add(new LuisComponentRegistration());

    const endpoint = 'https://westus.api.cognitive.microsoft.com';

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, 'resources/LuisAdaptiveRecognizerTests'),
        true,
        false
    );

    it('Simple intent and entity', async () => {
        nock(endpoint)
            .post(/.*/)
            .replyWithFile(
                200,
                path.join(__dirname, 'resources/LuisAdaptiveRecognizerTests/responses/SingleIntent_SimpleEntity.json')
            );
        await TestUtils.runTestScript(resourceExplorer, 'SimpleIntentEntity');
    });

    it('Dynamic lists', async () => {
        const luisAppId = 'DynamicLists';
        const querypath = `/luis/v2\\.0/apps/${luisAppId}\\?verbose=(true|false)&staging=false&spellCheck=false&log=true`;
        const uri = new RegExp(querypath);
        nock(endpoint)
            .post(uri, `"a"`)
            .replyWithFile(
                200,
                path.join(__dirname, 'resources/LuisAdaptiveRecognizerTests/responses/DynamicLists_a.json')
            );
        nock(endpoint)
            .post(uri, `"one"`)
            .replyWithFile(
                200,
                path.join(__dirname, 'resources/LuisAdaptiveRecognizerTests/responses/DynamicLists_one.json')
            );
        nock(endpoint)
            .post(uri, `"three"`)
            .replyWithFile(
                200,
                path.join(__dirname, 'resources/LuisAdaptiveRecognizerTests/responses/DynamicLists_three.json')
            );
        nock(endpoint)
            .post(uri, `"word1"`)
            .replyWithFile(
                200,
                path.join(__dirname, 'resources/LuisAdaptiveRecognizerTests/responses/DynamicLists_word1.json')
            );
        await TestUtils.runTestScript(resourceExplorer, 'DynamicLists');
    });
});
