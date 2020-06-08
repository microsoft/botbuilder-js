/* eslint-disable @typescript-eslint/explicit-function-return-type */
import 'mocha';
import * as path from 'path';
import * as nock from 'nock';
import { TestRunner } from './testing';

describe('LuisAdaptiveRecognizerTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname, '../resources/LuisAdaptiveRecognizerTests'));
    const endpoint = 'https://westus.api.cognitive.microsoft.com';

    it('Simple intent and entity', async () => {
        nock(endpoint).post(/.*/).replyWithFile(200, path.join(__dirname, '../resources/LuisAdaptiveRecognizerTests/responses/SingleIntent_SimpleEntity.json'));
        await testRunner.runTestScript('SimpleIntentEntity');
    });

    it('Dynamic lists', async () => {
        const luisAppId = 'DynamicLists';
        const querypath = `/luis/v2\\.0/apps/${ luisAppId }\\?verbose=(true|false)&staging=false&spellCheck=false&log=true`;
        const uri = new RegExp(querypath);
        nock(endpoint).post(uri, `"a"`).replyWithFile(200, path.join(__dirname, '../resources/LuisAdaptiveRecognizerTests/responses/DynamicLists_a.json'));
        nock(endpoint).post(uri, `"one"`).replyWithFile(200, path.join(__dirname, '../resources/LuisAdaptiveRecognizerTests/responses/DynamicLists_one.json'));
        nock(endpoint).post(uri, `"three"`).replyWithFile(200, path.join(__dirname, '../resources/LuisAdaptiveRecognizerTests/responses/DynamicLists_three.json'));
        nock(endpoint).post(uri, `"word1"`).replyWithFile(200, path.join(__dirname, '../resources/LuisAdaptiveRecognizerTests/responses/DynamicLists_word1.json'));
        await testRunner.runTestScript('DynamicLists');
    });
});