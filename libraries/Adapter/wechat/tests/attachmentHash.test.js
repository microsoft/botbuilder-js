const { AttachmentHash } = require('../lib/attachmentHash');
const { TextEncoder } = require('util');
const assert = require('assert');
const testString = 'test string to get hash';
const bytes = new TextEncoder().encode(testString);
const attachmentHash = new AttachmentHash();

describe('My hash library', () => {
    it('should be able to computer hash correctly', () => {
        assert.equal(attachmentHash.computerStringHash(testString), 'e16b52d76ad74bb8d4b507515cd9adb8');
    });
    it('shoule be same result', () => {
        assert.equal(attachmentHash.computerBytesHash(bytes), attachmentHash.computerStringHash(testString));
    });
});