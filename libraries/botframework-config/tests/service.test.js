let assert = require('assert');
let bf = require('../lib');
let fs = require('fs');
let path = require('path');
let txtfile = require('read-text-file');

describe('Service Tests', () => {
    it('Luis.getEndpoint() returns correct url for region', async () => {
        let luis = new bf.LuisService({ region: 'westus' });
        assert.equal(luis.getEndpoint(), `https://westus.api.cognitive.microsoft.com`);

        luis = new bf.LuisService({ region: 'virginia' });
        assert.equal(luis.getEndpoint(),  `https://virginia.api.cognitive.microsoft.us`);

        luis = new bf.LuisService({ region: 'usgovvirginia' });
        assert.equal(luis.getEndpoint(),  `https://virginia.api.cognitive.microsoft.us`);

        luis = new bf.LuisService({ region: 'usgoviowa' });
        assert.equal(luis.getEndpoint(),  `https://usgoviowa.api.cognitive.microsoft.us`);
    });

    it('QNAMaker corretly adds suffix', () => {
        let qna = new bf.QnaMakerService({
            hostname: 'https://myservice.azurewebsites.net'
        });
        assert.equal(qna.hostname, 'https://myservice.azurewebsites.net/qnamaker');
        qna = new bf.QnaMakerService({
            hostname: 'https://myservice.azurewebsites.net/sdfasdfsadfsdf?x=13'
        });
        assert.equal(qna.hostname, 'https://myservice.azurewebsites.net/qnamaker');
    });

    it('QnAMaker correctly does not add suffix when already hostname endind with \/qnamaker', () => {
        let qnaWithQnamakerHostname = new bf.QnaMakerService({
            hostname: 'https://MyServiceThatDoesntNeedAppending.azurewebsites.net/qnamaker'
        });
        assert.equal(qnaWithQnamakerHostname.hostname, 'https://MyServiceThatDoesntNeedAppending.azurewebsites.net/qnamaker');
    });

    it('QnAMaker should throw error without hostname', () => {
        function createQnaWithoutHostname() {
            new bf.QnaMakerService({});
        }

        let noHostnameError = new TypeError('QnAMakerService requires source parameter to have a hostname.');

        assert.throws(() => createQnaWithoutHostname(), noHostnameError);
    });
});

