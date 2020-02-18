const { strictEqual } = require('assert');
const { SkillHttpClient } = require('../../');
const { SimpleCredentialProvider } = require('botframework-connector');

describe('SkillHttpClient', function() {
    it('should construct with required parameters', () => {
        new SkillHttpClient(new SimpleCredentialProvider('', ''), {});
    });

    it('should fail to construct without required parameters', () => {
        try {
            new SkillHttpClient(new SimpleCredentialProvider('', ''));
        } catch (e) {
            strictEqual(e.message, 'conversationIdFactory missing');
        }
    });
});
