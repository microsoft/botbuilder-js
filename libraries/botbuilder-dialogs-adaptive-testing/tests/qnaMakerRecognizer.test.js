const path = require('path');
const nock = require('nock');
const { ComponentRegistration } = require('botbuilder-core');
const { QnAMakerComponentRegistration } = require('botbuilder-ai');
const { AdaptiveComponentRegistration } = require('botbuilder-dialogs-adaptive');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { AdaptiveTestComponentRegistration, TestUtils } = require('../lib');

describe('QnAMakerRecognizerTests', function () {
    this.timeout(5000);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());
    ComponentRegistration.add(new QnAMakerComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, 'resources/QnAMakerRecognizerTests'),
        true,
        false
    );
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
