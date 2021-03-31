const nock = require('nock');
const path = require('path');
const { QnAMakerBotComponent } = require('botbuilder-ai');
const { TestUtils } = require('../lib');
const { makeResourceExplorer } = require('./utils');

describe('QnAMakerRecognizerTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('QnAMakerRecognizerTests', QnAMakerBotComponent);
    });

    const hostname = 'https://dummy-hostname.azurewebsites.net';

    it('returns answer', async () => {
        nock(hostname)
            .post(/knowledgebases/)
            .replyWithFile(200, path.join(__dirname, 'resources/QnAMakerRecognizerTests/QnaMaker_ReturnsAnswer.json'));
        await TestUtils.runTestScript(resourceExplorer, 'QnAMakerRecognizerTests_ReturnsAnswer');
    });

    it('returns answer with intent', async () => {
        nock(hostname)
            .post(/knowledgebases/)
            .replyWithFile(
                200,
                path.join(__dirname, 'resources/QnAMakerRecognizerTests/QnaMaker_ReturnsAnswerWithIntent.json')
            );
        await TestUtils.runTestScript(resourceExplorer, 'QnAMakerRecognizerTests_ReturnsAnswerWithIntent');
    });

    it('returns no answer', async () => {
        nock(hostname)
            .post(/knowledgebases/)
            .replyWithFile(
                200,
                path.join(__dirname, 'resources/QnAMakerRecognizerTests/QnaMaker_ReturnsNoAnswer.json')
            );
        await TestUtils.runTestScript(resourceExplorer, 'QnAMakerRecognizerTests_ReturnsNoAnswer');
    });
});
