const assert = require('assert');
const { MemoryStorage } = require('botbuilder-core');
const { WeChatAdapter } = require('../');
const { EchoBot } = require('./bot');
const bot = new EchoBot();
const settings = {
    AppId: 'wx77f941c869071d99',
    AppSecret: 'ae88532259999efbd5edd91a08703e7c',
    Token: 'bmwipabotwx',
    EncodingAESKey: 'P7PIjIGpA7axbjbffRoWYq7G0BsIaEpqdawIir4KqCt',
    UploadTemporaryMedia: true
};
const reference = {
    activityId: '1234',
    channelId: 'test',
    serviceUrl: 'https://example.org/channel',
    user: { id: 'user', name: 'User Name' },
    bot: { id: 'bot', name: 'Bot Name' },
    conversation: {
        id: 'convo1',
        properties: {
            'foo': 'bar'
        }
    }
};
const secretInfo = {
    Token: 'bmwipabotwx',
    EncodingAesKey: 'P7PIjIGpA7axbjbffRoWYq7G0BsIaEpqdawIir4KqCt',
    AppId: 'wx77f941c869071d99',
    Signature: '4e17212123b3ce5a6b11643dc658af83fdb54c7d',
    Timestamp: '1562066088',
    Nonce: '236161902',
    Msg_signature: 'f3187a0efd9709c8f6550190147f43c279e9bc43',
};
const storage = new MemoryStorage();
const WeChatAdapterTest = new WeChatAdapter(storage, settings);
const incomingMessage = '<xml><ToUserName><![CDATA[gh_d13df7f4ef38]]></ToUserName><Encrypt><![CDATA[8VfmSJqZFzMlnaDohVD7I0T+9LIG1fT8kl221jOyL9TwkTJ38AZ9A6kMxvADvvxfg+azCEOEXtdVElhLs/roYyf25YfGH4kZp0O2t6XngOzwClG9HAhUV29OomouAqVpZ1ySqV60THKQ8E25N+fYF8RnXboae0r/ZTGnUJPuPwPVtbBj1dIGuFjpls+mnaSyg6Ag04FF5GcqO7exfEugQtNS44yQbmel/EKmxtvzz9CClJ3QnsHUODCMj5e6lYNSM7b84s+OBtKKsD0ObRnrAN5IfFLbDqK6twKlwTqHM0O1icSmfFo2MHT2+iizTcJfpbFnQeIj1zlSQdexvQ8fH9JwoSaHjQad/CyQ4D/PSxYi2Thu2ZFt5C2/NJ0ixL++GlOZpdaL/SQvxsVPrqsNhp7tteT69EVbpZux7c+eib4=]]></Encrypt></xml>';

class MockRequest {
    constructor(body, headers) {
        this.body = body;
        this.headers = headers || {};
    }
}
class MockResponse {
    constructor() {
        this.ended = false;
        this.statusCode = undefined;
        this.body = undefined;
    }

    status(status) {
        this.statusCode = status;
    }

    send(body) {
        assert(!this.ended, `response.send() called after response.end().`);
        this.body = body;
    }

    end() {
        assert(!this.ended, `response.end() called twice.`);
        assert(this.statusCode !== undefined, `response.end() called before response.send().`);
        this.ended = true;
    }
}

describe('WeChatAdapter', () => {
    it('should processActivity()', async () => {
        const req = new MockRequest(incomingMessage);
        const res = new MockResponse();
        await WeChatAdapterTest.processActivity(req, res, async (context) => {
            await bot.run(context);
        }, secretInfo, false);
    });

    it('should processActivity()', async () => {
        const req = new MockRequest(incomingMessage);
        const res = new MockResponse();
        await WeChatAdapterTest.processActivity(req, res, async (context) => {
            await bot.run(context);
        }, secretInfo, true);
    });

    it('should continueConversation()', (done) => {
        let called = false;
        WeChatAdapterTest.continueConversation(reference, (context) => {
            assert(context, `context not passed.`);
            assert(context.activity, `context has no request.`);
            assert(context.activity.type === 'event', `request has invalid type.`);
            assert(context.activity.from && context.activity.from.id === reference.user.id, `request has invalid from.id.`);
            assert(context.activity.recipient && context.activity.recipient.id === reference.bot.id, `request has invalid recipient.id.`);
            called = true;
        }).then(() => {
            assert(called, `bot logic not called.`);
            done();
        });
    });
});