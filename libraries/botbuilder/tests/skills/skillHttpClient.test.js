const assert = require('assert');
const { SkillHttpClient } = require('../../');
const { SimpleCredentialProvider } = require('botframework-connector');

describe('SkillHttpClient', function() {
    it('should construct with required parameters', () => {
        new SkillHttpClient(new SimpleCredentialProvider('', ''), {});
    });

    it('should fail to construct without required parameters', () => {
        assert.throws(
            () => new SkillHttpClient(new SimpleCredentialProvider('', '')),
            Error('conversationIdFactory missing')
        );
    });
});
