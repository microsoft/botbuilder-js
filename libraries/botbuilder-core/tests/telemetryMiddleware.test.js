// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License

const assert = require('assert');
const { TestAdapter, TelemetryLoggerMiddleware, ActivityTypes } = require('../');
const { TeamsChannelData } = require('../../botframework-schema/');

describe(`TelemetryMiddleware`, function () {
    this.timeout(5000);
    it(`telemetry should log send and receive activities`, function (done) {
        var callCount = 0;
        var telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                switch (++callCount) {
                    case 1:
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgReceiveEvent);
                        assert(telemetry.properties);
                        assert('fromId' in telemetry.properties);
                        assert('conversationName' in telemetry.properties);
                        assert('locale' in telemetry.properties);
                        assert('recipientId' in telemetry.properties);
                        assert('recipientName' in telemetry.properties);
                        assert('fromName' in telemetry.properties);
                        assert('text' in telemetry.properties);
                        assert(telemetry.properties.text === 'foo');
                        break;

                    case 2:
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgSendEvent)
                        assert(telemetry.properties);
                        assert('replyActivityId' in telemetry.properties);
                        assert('recipientId' in telemetry.properties);
                        assert('conversationName' in telemetry.properties);
                        assert('locale' in telemetry.properties);
                        assert('recipientName' in telemetry.properties);
                        break;
                    case 3:
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgSendEvent);
                        assert(telemetry.properties);
                        assert('replyActivityId' in telemetry.properties);
                        assert('recipientId' in telemetry.properties);
                        assert('conversationName' in telemetry.properties);
                        assert('locale' in telemetry.properties);
                        assert('recipientName' in telemetry.properties);
                        assert(telemetry.properties.text === 'echo:foo');
                        break;
                    case 4:
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgReceiveEvent);
                        assert(telemetry.properties);
                        assert('fromId' in telemetry.properties);
                        assert('conversationName' in telemetry.properties);
                        assert('locale' in telemetry.properties);
                        assert('recipientId' in telemetry.properties);
                        assert('recipientName' in telemetry.properties);
                        assert('fromName' in telemetry.properties);
                        assert('text' in telemetry.properties);
                        assert(telemetry.properties.text === 'bar');
                        break;
                    case 5:
                        // console.log('callcount:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgSendEvent);
                        assert(telemetry.properties);
                        assert('replyActivityId' in telemetry.properties);
                        assert('recipientId' in telemetry.properties);
                        assert('conversationName' in telemetry.properties);
                        assert('locale' in telemetry.properties);
                        assert('recipientName' in telemetry.properties);
                        break;
                    case 6:
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgSendEvent);
                        assert(telemetry.properties);
                        assert('replyActivityId' in telemetry.properties);
                        assert('recipientId' in telemetry.properties);
                        assert('conversationName' in telemetry.properties);
                        assert('locale' in telemetry.properties);
                        assert('recipientName' in telemetry.properties);
                        assert(telemetry.properties.text === 'echo:bar');
                        break;
                    default:
                        assert(false);
                        break;
                }
            }
        }
        let myLogger = new TelemetryLoggerMiddleware(telemetryClient, true);
        var conversationId = null;
        var adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            var typingActivity = {
                type: ActivityTypes.Typing,
                relatesTo: context.activity.relatesTo
            };
            await context.sendActivity(typingActivity);
            await context.sendActivity(`echo:${context.activity.text}`);
        }).use(myLogger);

        adapter
            .send('foo')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:foo')
            .send('bar')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:bar')
            .then(done);
    });

    it(`telemetry null telemetryClient`, function (done) {
        var callCount = 0;
        let myLogger = new TelemetryLoggerMiddleware(null, true);
        var conversationId = null;
        var adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            var typingActivity = {
                type: ActivityTypes.Typing,
                relatesTo: context.activity.relatesTo
            };
            await context.sendActivity(typingActivity);
            await context.sendActivity(`echo:${context.activity.text}`);
        }).use(myLogger);

        adapter
            .send('foo')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:foo')
            .send('bar')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:bar')
            .then(done);
    });

    it(`telemetry should not log PII properties for send and receive activities`, function (done) {
        var callCount = 0;
        var telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                switch (++callCount) {
                    case 1:
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgReceiveEvent);
                        assert(telemetry.properties);
                        assert('fromId' in telemetry.properties);
                        assert('conversationName' in telemetry.properties);
                        assert('locale' in telemetry.properties);
                        assert('recipientId' in telemetry.properties);
                        assert('recipientName' in telemetry.properties);
                        assert(!('fromName' in telemetry.properties));
                        assert(!('text' in telemetry.properties));
                        break;

                    case 2:
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgSendEvent)
                        assert(telemetry.properties);
                        assert('replyActivityId' in telemetry.properties);
                        assert('recipientId' in telemetry.properties);
                        assert('conversationName' in telemetry.properties);
                        assert('locale' in telemetry.properties);
                        assert(!('recipientName' in telemetry.properties));
                        break;
                    case 3:
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgSendEvent);
                        assert(telemetry.properties);
                        assert('replyActivityId' in telemetry.properties);
                        assert('recipientId' in telemetry.properties);
                        assert('conversationName' in telemetry.properties);
                        assert('locale' in telemetry.properties);
                        assert(!('recipientName' in telemetry.properties));
                        assert(!('text' in telemetry.properties));
                        break;
                    case 4:
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgReceiveEvent);
                        assert(telemetry.properties);
                        assert('fromId' in telemetry.properties);
                        assert('conversationName' in telemetry.properties);
                        assert('locale' in telemetry.properties);
                        assert('recipientId' in telemetry.properties);
                        assert('recipientName' in telemetry.properties);
                        assert(!('fromName' in telemetry.properties));
                        assert(!('text' in telemetry.properties));
                        break;
                    default:
                        break;
                }
            }
        }
        let myLogger = new TelemetryLoggerMiddleware(telemetryClient, false);
        var conversationId = null;
        var adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            var typingActivity = {
                type: ActivityTypes.Typing,
                relatesTo: context.activity.relatesTo
            };
            await context.sendActivity(typingActivity);
            await context.sendActivity(`echo:${context.activity.text}`);
        }).use(myLogger);

        adapter
            .send('foo')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:foo')
            .send('bar')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:bar')
            .then(done());
    });



    it(`telemetry should log update activities`, function (done) {
        var callCount = 0;
        let activityToUpdate = null;
        var telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                switch (++callCount) {
                    case 4:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgUpdateEvent)
                        assert(telemetry.properties);
                        assert('recipientId' in telemetry.properties);
                        assert('conversationName' in telemetry.properties);
                        assert('conversationId' in telemetry.properties);
                        assert('locale' in telemetry.properties);
                        assert('text' in telemetry.properties);
                        assert(telemetry.properties.text === "new response");
                        break;
                    default:
                        //Everything passes through
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        break;
                }
            }
        }
        let myLogger = new TelemetryLoggerMiddleware(telemetryClient, true);
        var adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            if (context.activity.text === 'update') {
                activityToUpdate.text = 'new response';
                await context.updateActivity(activityToUpdate);
            } else {
                var activity = createReply(context.activity, 'response');
                const response = await context.sendActivity(activity);
                activity.id = response.id;

                // clone the activity, so we can use it to do an update
                activityToUpdate = JSON.parse(JSON.stringify(activity));
            }

        }).use(myLogger);

        adapter
            .send('foo')
            .delay(100)
            .send('update')
            .delay(100)
            .then(done());
    });

    it(`telemetry should log delete activities`, function (done) {
        var callCount = 0;
        var conversationId = null;
        var activityId = null;
        var telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                switch (++callCount) {
                    case 4:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgDeleteEvent)
                        assert(telemetry.properties);
                        assert('recipientId' in telemetry.properties);
                        assert('conversationName' in telemetry.properties);
                        assert('conversationId' in telemetry.properties);
                        break;
                    default:
                        //Everything passes through
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        break;
                }
            }
        }
        let myLogger = new TelemetryLoggerMiddleware(telemetryClient, true);
        var adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            if (context.activity.text === 'deleteIt') {
                await context.deleteActivity(activityId);
            } else {
                var activity = createReply(context.activity, 'response');
                var response = await context.sendActivity(activity);
                activityId = response.id;
            }
        }).use(myLogger);

        adapter.send('foo')
            .assertReply('response')
            .send('deleteIt')
            .delay(500)
            .then(done());
    });

    it(`telemetry override RECEIVE with custom derived logger class`, function (done) {
        var callCount = 0;
        var telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                switch (++callCount) {
                    case 1:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgReceiveEvent);
                        assert(telemetry.properties);
                        assert('foo' in telemetry.properties);
                        assert(telemetry.properties.foo === 'bar');
                        assert('ImportantProperty' in telemetry.properties);
                        assert(telemetry.properties.ImportantProperty === 'ImportantValue');
                        break;

                    case 2:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === "MyReceive");
                        assert(telemetry.properties);
                        assert('fromId' in telemetry.properties);
                        assert('conversationName' in telemetry.properties);
                        assert(telemetry.properties.conversationName === 'OVERRIDE');
                        assert('locale' in telemetry.properties);
                        assert('recipientId' in telemetry.properties);
                        assert('recipientName' in telemetry.properties);
                        assert('fromName' in telemetry.properties);
                        assert('text' in telemetry.properties);
                        assert(telemetry.properties.text === 'foo');
                        break;

                    case 3:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgSendEvent)
                        assert(telemetry.properties);
                        assert('replyActivityId' in telemetry.properties);
                        assert('recipientId' in telemetry.properties);
                        assert('conversationName' in telemetry.properties);
                        assert('locale' in telemetry.properties);
                        assert('recipientName' in telemetry.properties);
                        break;

                    case 4:
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgSendEvent);
                        assert(telemetry.properties);
                        assert('replyActivityId' in telemetry.properties);
                        assert('recipientId' in telemetry.properties);
                        assert('conversationName' in telemetry.properties);
                        assert('locale' in telemetry.properties);
                        assert('recipientName' in telemetry.properties);
                        assert(telemetry.properties.text === 'echo:foo');
                        break;
                    default:
                        break;
                }
            }
        }
        let myLogger = new overrideReceiveLogger(telemetryClient, true);
        var conversationId = null;
        var adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            var typingActivity = {
                type: ActivityTypes.Typing,
                relatesTo: context.activity.relatesTo
            };
            await context.sendActivity(typingActivity);
            await context.sendActivity(`echo:${context.activity.text}`);
        }).use(myLogger);

        adapter
            .send('foo')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:foo')
            .send('bar')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:bar')
            .then(done);
    });

    it(`telemetry override SEND with custom derived logger class`, function (done) {
        var callCount = 0;
        var telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                switch (++callCount) {
                    case 1:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgReceiveEvent);
                        assert(telemetry.properties);
                        assert('fromId' in telemetry.properties);
                        assert('conversationName' in telemetry.properties);
                        assert('locale' in telemetry.properties);
                        assert('recipientId' in telemetry.properties);
                        assert('recipientName' in telemetry.properties);
                        assert('fromName' in telemetry.properties);
                        assert('text' in telemetry.properties);
                        assert(telemetry.properties.text === 'foo');
                        break;

                    case 2:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgSendEvent);
                        assert(telemetry.properties);
                        assert('foo' in telemetry.properties);
                        assert(telemetry.properties.foo === 'bar');
                        assert('ImportantProperty' in telemetry.properties);
                        assert(telemetry.properties.ImportantProperty === 'ImportantValue');
                        break;

                    case 3:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === "MySend");
                        assert(telemetry.properties);
                        assert('replyActivityId' in telemetry.properties);
                        assert('recipientId' in telemetry.properties);
                        assert('conversationName' in telemetry.properties);
                        assert('locale' in telemetry.properties);
                        assert('recipientName' in telemetry.properties);
                        break;

                    default:
                        break;
                }
            }
        }
        let myLogger = new overrideSendLogger(telemetryClient, true);
        var conversationId = null;
        var adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            var typingActivity = {
                type: ActivityTypes.Typing,
                relatesTo: context.activity.relatesTo
            };
            await context.sendActivity(typingActivity);
            await context.sendActivity(`echo:${context.activity.text}`);
        }).use(myLogger);

        adapter
            .send('foo')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:foo')
            .send('bar')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:bar')
            .then(done);
    });

    it(`telemetry override UPDATE with custom derived logger class`, function (done) {
        var callCount = 0;
        var telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                switch (++callCount) {
                    case 4:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgUpdateEvent);
                        assert(telemetry.properties);
                        assert('foo' in telemetry.properties);
                        assert(telemetry.properties.foo === 'bar');
                        assert('ImportantProperty' in telemetry.properties);
                        assert(telemetry.properties.ImportantProperty === 'ImportantValue');
                        break;

                    case 5:
                        // console.log('Call number:' + callCount);
                        // console.log(telemetry);
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgDeleteEvent);
                        assert(telemetry.properties);
                        assert('foo' in telemetry.properties);
                        assert(telemetry.properties.foo === 'bar');
                        assert('ImportantProperty' in telemetry.properties);
                        assert(telemetry.properties.ImportantProperty === 'ImportantValue');
                        break;

                    default:
                        break;
                }
            }
        }
        let myLogger = new overrideUpdateDeleteLogger(telemetryClient, true);
        var conversationId = null;
        var adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            if (context.activity.text === 'update') {
                activityToUpdate.text = 'new response';
                await context.updateActivity(activityToUpdate);
            } else {
                var activity = createReply(context.activity, 'response');
                const response = await context.sendActivity(activity);
                activity.id = response.id;

                // clone the activity, so we can use it to do an update
                activityToUpdate = JSON.parse(JSON.stringify(activity));
            }

        }).use(myLogger);

        adapter
            .send('foo')
            .delay(100)
            .send('update')
            .delay(100)
            .then(done());
    });

    it(`telemetry should log channel specific properties`, function (done) {
        var callCount = 0;
        var telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                switch (++callCount) {
                    case 1:
                        assert(telemetry.name === TelemetryLoggerMiddleware.botMsgReceiveEvent);
                        assert(telemetry.properties);
                        assert('TeamsTeamInfo' in telemetry.properties);
                        assert('TeamsTenantId' in telemetry.properties);
                        assert('TeamsUserAadObjectId' in telemetry.properties);
                        assert(telemetry.properties.TeamsTeamInfo === '{"id":"teamid"}');
                        assert(telemetry.properties.TeamsTenantId === 'tenantid');
                        assert(telemetry.properties.TeamsUserAadObjectId === 'aadObjectId'); 
                        break;                    
                    default:
                        assert(false);
                        break;
                }
            }
        }
        let myLogger = new TelemetryLoggerMiddleware(telemetryClient, true);
        
        var adapter = new TestAdapter(async (context) => { 
            await context.sendActivity('foo');
        }).use(myLogger);

        var teamsChannelData = { 
            teamsChannelId: 'teamsChannelId', 
            teamsTeamId: 'teamid',
            channel: { id: 'channelid' },
            team: { id: 'teamid' },
            tenant: { id: 'tenantid' }
        }

        var activity = {
            type: ActivityTypes.Message,
            channelId: 'msteams',
            text: 'test',
            channelData: teamsChannelData,
            from: { id: 'fromId', name: 'fromName', aadObjectId: 'aadObjectId' },
        };

        adapter
            .send(activity)
            .then(done);
    });

});

class overrideReceiveLogger extends TelemetryLoggerMiddleware {
    async onReceiveActivity(activity) {
        this.telemetryClient.trackEvent({
            name: TelemetryLoggerMiddleware.botMsgReceiveEvent,
            properties: {
                "foo": "bar",
                "ImportantProperty": "ImportantValue"
            }
        });
        this.telemetryClient.trackEvent({
            name: "MyReceive",
            properties: await this.fillReceiveEventProperties(activity, { "conversationName": "OVERRIDE" })
        });
    }
}

class overrideSendLogger extends TelemetryLoggerMiddleware {
    async onSendActivity(activity) {
        this.telemetryClient.trackEvent({
            name: TelemetryLoggerMiddleware.botMsgSendEvent,
            properties: {
                "foo": "bar",
                "ImportantProperty": "ImportantValue"
            }
        });
        this.telemetryClient.trackEvent({
            name: "MySend",
            properties: await this.fillSendEventProperties(activity)
        });
    }
}

class overrideUpdateDeleteLogger extends TelemetryLoggerMiddleware {
    async onUpdateActivity(activity) {
        this.telemetryClient.trackEvent({
            name: TelemetryLoggerMiddleware.botMsgUpdateEvent,
            properties: {
                "foo": "bar",
                "ImportantProperty": "ImportantValue"
            }
        });
    }
    async onDeleteActivity(activity) {
        this.telemetryClient.trackEvent({
            name: TelemetryLoggerMiddleware.botMsgDeleteEvent,
            properties: {
                "foo": "bar",
                "ImportantProperty": "ImportantValue"
            }
        });
    }
}

function createReply(activity, text, locale = null) {
    return {
        type: ActivityTypes.Message,
        from: { id: activity.recipient.id, name: activity.recipient.name },
        recipient: { id: activity.from.id, name: activity.from.name },
        replyToId: activity.id,
        serviceUrl: activity.serviceUrl,
        channelId: activity.channelId,
        conversation: { isGroup: activity.conversation.isGroup, id: activity.conversation.id, name: activity.conversation.name },
        text: text || '',
        locale: locale || activity.locale
    };
}
