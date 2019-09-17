const { VerificationHelper } = require('../lib/VerificationHelper');
const { MessageCryptography } = require('../lib/messageCryptography');
const assert = require('assert');
const secretInfo = {
    Token: 'bmwipabotwx',
    EncodingAesKey: 'P7PIjIGpA7axbjbffRoWYq7G0BsIaEpqdawIir4KqCt',
    AppId: 'wx77f941c869071d99',
    Signature: '4e17212123b3ce5a6b11643dc658af83fdb54c7d',
    Timestamp: '1562066088',
    Nonce: '236161902',
    Msg_signature: 'f3187a0efd9709c8f6550190147f43c279e9bc43',
};
const secretInfoAESKeyError = {
    Token: 'bmwipabotwx',
    EncodingAesKey: 'bmwipabotwx',
    AppId: 'wx77f941c869071d99',
    Signature: '4e17212123b3ce5a6b11643dc658af83fdb54c7',
    Timestamp: '1562066088',
    Nonce: '236161902',
    Msg_signature: '4e17212123b3ce5a6b11643dc658af83fdb54c7',
};
const secretInfoMsgSignatureError = {
    Token: 'bmwipabotwx',
    EncodingAesKey: 'P7PIjIGpA7axbjbffRoWYq7G0BsIaEpqdawIir4KqCt',
    AppId: 'wx77f941c869071d99',
    Signature: '4e17212123b3ce5a6b11643dc658af83fdb54c7d',
    Timestamp: '1562066088',
    Nonce: '236161902',
    Msg_signature: '4e17212123b3ce5a6b11643dc658af83fdb54c7d',
};
const secretInfoAppIdError = {
    Token: 'bmwipabotwx',
    EncodingAesKey: 'P7PIjIGpA7axbjbffRoWYq7G0BsIaEpqdawIir4KqCt',
    AppId: 'wx77f941c8',
    Signature: '4e17212123b3ce5a6b11643dc658af83fdb54c7d',
    Timestamp: '1562066088',
    Nonce: '236161902',
    Msg_signature: 'f3187a0efd9709c8f6550190147f43c279e9bc43',
};
const requestRaw = {
    Encrypt: '8VfmSJqZFzMlnaDohVD7I0T+9LIG1fT8kl221jOyL9TwkTJ38AZ9A6kMxvADvvxfg+azCEOEXtdVElhLs/roYyf25YfGH4kZp0O2t6XngOzwClG9HAhUV29OomouAqVpZ1ySqV60THKQ8E25N+fYF8RnXboae0r/ZTGnUJPuPwPVtbBj1dIGuFjpls+mnaSyg6Ag04FF5GcqO7exfEugQtNS44yQbmel/EKmxtvzz9CClJ3QnsHUODCMj5e6lYNSM7b84s+OBtKKsD0ObRnrAN5IfFLbDqK6twKlwTqHM0O1icSmfFo2MHT2+iizTcJfpbFnQeIj1zlSQdexvQ8fH9JwoSaHjQad/CyQ4D/PSxYi2Thu2ZFt5C2/NJ0ixL++GlOZpdaL/SQvxsVPrqsNhp7tteT69EVbpZux7c+eib4='
};
const xmlDecryptString = '<xml><ToUserName><![CDATA[gh_d13df7f4ef38]]></ToUserName><FromUserName><![CDATA[of3ss6NTm25BKyE9KfDPD-ALSeWg]]></FromUserName><CreateTime>1562066088</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[hi]]></Content><MsgId>22363405356629000</MsgId></xml>';

describe('My Message Cryptography', () => {
    it('should be able to decrypt the message correctly', () => {
        assert.equal(MessageCryptography.DecryptMessage(requestRaw, secretInfo).replace(/(\r\n|\n|\r)/gm,''), xmlDecryptString);
    });
    it('should throw error if the encodingAesKey is invalid', () => {
        assert.throws(
            () => {
                MessageCryptography.DecryptMessage(requestRaw, secretInfoAESKeyError);
            },
            /^Error: Invalid EncodingAESKey.$/
        );
    });
    it('should throw error if signature information is invalid', () => {
        assert.throws(
            () => {
                MessageCryptography.DecryptMessage(requestRaw, secretInfoMsgSignatureError);
            },
            /^Error: Signature verification failed.$/
        );
    });
    it('should throw error if the AppId is invalid', () => {
        assert.throws(
            () => {
                MessageCryptography.DecryptMessage(requestRaw, secretInfoAppIdError);
            },
            /^Error: AppId is invalid.$/
        );
    });
});