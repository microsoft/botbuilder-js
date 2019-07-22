const assert = require('assert');
const { MessageFactory, SkypeMentionNormalizeMiddleware, TurnContext } = require('../lib');

describe(`Mention`, function () {
    this.timeout(5000);

    it(`should remove skype mention`, async function () {
        var mentionJson = '{\"mentioned\": {\"id\": \"recipientid\"},\"text\": \"<at id=\\\"28: 841caffa-9e92-425d-8d84-b503b3ded285\\\">botname</at>\"}';
        var entity = JSON.parse(mentionJson);
        entity.type = 'mention';

        var activity = MessageFactory.text('botname sometext');
        activity.channelId = 'skype';
        activity.entities = [entity];

        SkypeMentionNormalizeMiddleware.normalizeSkypeMentionText(activity);
        TurnContext.removeMentionText(activity, 'recipientid');

        assert(activity.text === 'sometext');
    });

    it(`should remove teams mention`, async function () {
        var mentionJson = '{\"mentioned\": {\"id\": \"recipientid\"},\"text\": \"<at>botname</at>\"}';
        var entity = JSON.parse(mentionJson);
        entity.type = 'mention';

        var activity = MessageFactory.text('<at>botname</at> sometext');
        activity.channelId = 'teams';
        activity.entities = [entity];

        TurnContext.removeMentionText(activity, 'recipientid');

        assert(activity.text === 'sometext');
    });

    it(`should remove slack mention`, async function () {
        var mentionJson = '{\"mentioned\": {\"id\": \"recipientid\"},\"text\": \"@botname\"}';
        var entity = JSON.parse(mentionJson);
        entity.type = 'mention';

        var activity = MessageFactory.text('@botname sometext');
        activity.channelId = 'slack';
        activity.entities = [entity];

        TurnContext.removeMentionText(activity, 'recipientid');

        assert(activity.text === 'sometext');
    });

    it(`should remove GroupMe mention`, async function () {
        var mentionJson = '{\"mentioned\": {\"id\": \"recipientid\"},\"text\": \"@bot name\"}';
        var entity = JSON.parse(mentionJson);
        entity.type = 'mention';

        var activity = MessageFactory.text('@bot name sometext');
        activity.channelId = 'groupme';
        activity.entities = [entity];

        TurnContext.removeMentionText(activity, 'recipientid');

        assert(activity.text === 'sometext');
    });

    it(`should remove Telegram mention`, async function () {
        var mentionJson = '{\"mentioned\": {\"id\": \"recipientid\"},\"text\": \"botname\"}';
        var entity = JSON.parse(mentionJson);
        entity.type = 'mention';

        var activity = MessageFactory.text('botname sometext');
        activity.channelId = 'telegram';
        activity.entities = [entity];

        TurnContext.removeMentionText(activity, 'recipientid');

        assert(activity.text === 'sometext');
    });
});
