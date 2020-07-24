const assert = require('assert');
const { TestAdapter, TurnContext } = require('botbuilder-core');
const { DialogContext, DialogSet } = require('botbuilder-dialogs');
const { BeginSkill } = require('../');
const { BoolExpression, StringExpression } = require('adaptive-expressions');


class MockTelemetryClient {
    telemetryStorage = {};
    trackEvent(telemetry)  {
        telemetryStorage = telemetry;
    }
}

const createMessageActivity = (text) => {
    return {
        type: 'message',
        text: text || 'test activity',
        recipient: user,
        from: bot,
        locale: 'en-us'
    };
};

const createContext = (text) => {
    const activity = createMessageActivity(text);
    return new DialogContext(new DialogSet(), new TurnContext(new TestAdapter(), activity), {});
};

describe('lg telemetry tests', function() {
    it('begin skill -> begin dialig', async function() {
        const dc = createContext('');
        const dialog = new BeginSkill();
        dialog.disabled = new BoolExpression(false);
        dialog.botId = new StringExpression('SkillCallerId');
        dialog.skillHostEndpoint = new StringExpression('http://test.contoso.com/skill/messages');
        dialog.skillAppId = new StringExpression('SkillId');
        dialog.skillEndpoint = new StringExpression('http://testskill.contoso.com/api/messages');
        dialog.telemetryClient = new MockTelemetryClient();

        await dialog.beginDialog(dc);
        const telemetry = dialog.telemetryClient.telemetryStorage;

        assert.equal(telemetry.name, 'GeneratorResult');
    
    });
});