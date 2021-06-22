const assert = require('assert');
const { SkillHttpClient } = require('../../');
const { SimpleCredentialProvider } = require('botframework-connector');

describe('SkillHttpClient', function () {
    it('should construct with required parameters', function () {
        new SkillHttpClient(new SimpleCredentialProvider('', ''), {});
    });

    it('should fail to construct without required parameters', function () {
        assert.throws(
            () => new SkillHttpClient(new SimpleCredentialProvider('', '')),
            new Error('conversationIdFactory missing')
        );
    });
});
