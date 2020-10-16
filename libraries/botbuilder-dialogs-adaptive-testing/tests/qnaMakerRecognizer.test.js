const path = require('path');
const nock = require('nock');
const { TestRunner } = require('../lib');

describe('QnAMakerRecognizerTests', function() {
    this.timeout(5000);
    const testRunner = new TestRunner(path.join(__dirname, 'resources/QnAMakerRecognizerTests'));
    const hostname = 'https://dummy-hostname.azurewebsites.net';

    it('returns answer', async () => {
        nock(hostname).post(/knowledgebases/).replyWithFile(200, path.join(__dirname, 'resources/QnAMakerRecognizerTests/QnaMaker_ReturnsAnswer.json'));
        await testRunner.runTestScript('QnAMakerRecognizerTests_ReturnsAnswer');
    });

    it('returns answer with intent', async () => {
        nock(hostname).post(/knowledgebases/).replyWithFile(200, path.join(__dirname, 'resources/QnAMakerRecognizerTests/QnaMaker_ReturnsAnswerWithIntent.json'));
        await testRunner.runTestScript('QnAMakerRecognizerTests_ReturnsAnswerWithIntent');
    });

    it('returns no answer', async () => {
        nock(hostname).post(/knowledgebases/).replyWithFile(200, path.join(__dirname, 'resources/QnAMakerRecognizerTests/QnaMaker_ReturnsNoAnswer.json'));
        await testRunner.runTestScript('QnAMakerRecognizerTests_ReturnsNoAnswer');
    });
});
