const assert = require('assert');
const { ActivityTypes } = require('botbuilder-core');
const {
    OnActivity,
    OnAssignEntity,
    OnBeginDialog,
    OnCancelDialog,
    OnChooseEntity,
    OnChooseIntent,
    OnChooseProperty,
    OnCommandActivity,
    OnCommandResultActivity,
    OnContinueConversation,
    OnConversationUpdateActivity,
    OnDialogEvent,
    OnEndOfActions,
    OnEndOfConversationActivity,
    OnError,
    OnEventActivity,
    OnHandoffActivity,
    OnInstallationUpdateActivity,
    OnIntent,
    OnInvokeActivity,
    OnMessageActivity,
    OnMessageDeleteActivity,
    OnMessageReactionActivity,
    OnMessageUpdateActivity,
    OnQnAMatch,
    OnRepromptDialog,
    OnTypingActivity,
    OnUnknownIntent,
    OnCondition,
    AdaptiveEvents,
} = require('../lib');

const assertExpression = (condition, expectedExpression) => {
    const exp = condition.getExpression();
    assert.strictEqual(exp.toString(), expectedExpression);
};

describe('ConditionalsTests', function () {
    it('verify getExpression', function () {
        const conditions = [
            new OnActivity(),
            new OnAssignEntity(),
            new OnBeginDialog(),
            new OnCancelDialog(),
            new OnCancelDialog(),
            new OnChooseEntity(),
            new OnChooseIntent(),
            new OnChooseProperty(),
            new OnCommandActivity(),
            new OnCommandResultActivity(),
            new OnContinueConversation(),
            new OnConversationUpdateActivity(),
            new OnDialogEvent(),
            new OnEndOfActions(),
            new OnEndOfConversationActivity(),
            new OnError(),
            new OnEventActivity(),
            new OnHandoffActivity(),
            new OnInstallationUpdateActivity(),
            new OnIntent('test'),
            new OnInvokeActivity(),
            new OnMessageActivity(),
            new OnMessageDeleteActivity(),
            new OnMessageReactionActivity(),
            new OnMessageUpdateActivity(),
            new OnQnAMatch(),
            new OnRepromptDialog(),
            new OnTypingActivity(),
            new OnUnknownIntent(),
        ];
        conditions.forEach((condition) => {
            assert.strictEqual(condition.getExpression(), condition.getExpression());
        });
    });

    it('OnCondition with conditioan', function () {
        assertExpression(
            new OnActivity('event', [], 'turn.test == 1'),
            "((turn.activity.type == 'event') && ((turn.dialogEvent.name == 'activityReceived') && (turn.test == 1)))"
        );
        assertExpression(
            new OnAssignEntity('property', 'entity', 'operation', [], 'turn.test == 1'),
            "(((turn.dialogEvent.name == 'assignEntity') && (turn.test == 1)) && (turn.dialogEvent.value.property == 'property') && (turn.dialogEvent.value.entity.name == 'entity') && (turn.dialogEvent.value.operation == 'operation'))"
        );
        assertExpression(
            new OnBeginDialog([], 'turn.test == 1'),
            "((turn.dialogEvent.name == 'beginDialog') && (turn.test == 1))"
        );
        assertExpression(
            new OnCancelDialog([], 'turn.test == 1'),
            "((turn.dialogEvent.name == 'cancelDialog') && (turn.test == 1))"
        );
        assertExpression(
            new OnChooseEntity('property', 'entity', [], 'turn.test == 1'),
            "(((turn.dialogEvent.name == 'chooseEntity') && (turn.test == 1)) && (turn.dialogEvent.value.property == 'property') && (turn.dialogEvent.value.entity.name == 'entity'))"
        );
        assertExpression(
            new OnCommandActivity([], 'turn.test == 1'),
            `((turn.activity.type == '${ActivityTypes.Command}') && ((turn.dialogEvent.name == '${AdaptiveEvents.activityReceived}') && (turn.test == 1)))`
        );
        assertExpression(
            new OnCommandResultActivity([], 'turn.test == 1'),
            `((turn.activity.type == '${ActivityTypes.CommandResult}') && ((turn.dialogEvent.name == '${AdaptiveEvents.activityReceived}') && (turn.test == 1)))`
        );
        assertExpression(new OnCondition('turn.test == 1'), '(turn.test == 1)');
        assertExpression(
            new OnContinueConversation([], 'turn.test == 1'),
            "((turn.activity.name == 'ContinueConversation') && ((turn.activity.type == 'event') && ((turn.dialogEvent.name == 'activityReceived') && (turn.test == 1))))"
        );
        assertExpression(
            new OnConversationUpdateActivity([], 'turn.test == 1'),
            "((turn.activity.type == 'conversationUpdate') && ((turn.dialogEvent.name == 'activityReceived') && (turn.test == 1)))"
        );
        assertExpression(
            new OnDialogEvent('DialogEvent', [], 'turn.test == 1'),
            "((turn.dialogEvent.name == 'DialogEvent') && (turn.test == 1))"
        );
        assertExpression(
            new OnEndOfActions([], 'turn.test == 1'),
            "((turn.dialogEvent.name == 'endOfActions') && (turn.test == 1))"
        );
        assertExpression(
            new OnEndOfConversationActivity([], 'turn.test == 1'),
            "((turn.activity.type == 'endOfConversation') && ((turn.dialogEvent.name == 'activityReceived') && (turn.test == 1)))"
        );
        assertExpression(new OnError([], 'turn.test == 1'), "((turn.dialogEvent.name == 'error') && (turn.test == 1))");
        assertExpression(
            new OnEventActivity([], 'turn.test == 1'),
            "((turn.activity.type == 'event') && ((turn.dialogEvent.name == 'activityReceived') && (turn.test == 1)))"
        );
        assertExpression(
            new OnHandoffActivity([], 'turn.test == 1'),
            "((turn.activity.type == 'handoff') && ((turn.dialogEvent.name == 'activityReceived') && (turn.test == 1)))"
        );
        assertExpression(
            new OnInstallationUpdateActivity([], 'turn.test == 1'),
            "((turn.activity.type == 'installationUpdate') && ((turn.dialogEvent.name == 'activityReceived') && (turn.test == 1)))"
        );
        assertExpression(
            new OnIntent('Intent', ['@foo', '@@bar', 'turn.recognized.entities.blat', 'gronk'], [], 'turn.test == 1'),
            "(((turn.recognized.intent == 'Intent') && (exists(@foo) && exists(@@bar) && exists(turn.recognized.entities.blat) && exists(@gronk))) && ((turn.dialogEvent.name == 'recognizedIntent') && (turn.test == 1)))"
        );
        assertExpression(
            new OnInvokeActivity([], 'turn.test == 1'),
            "((turn.activity.type == 'invoke') && ((turn.dialogEvent.name == 'activityReceived') && (turn.test == 1)))"
        );
        assertExpression(
            new OnMessageActivity([], 'turn.test == 1'),
            "((turn.activity.type == 'message') && ((turn.dialogEvent.name == 'activityReceived') && (turn.test == 1)))"
        );
        assertExpression(
            new OnMessageDeleteActivity([], 'turn.test == 1'),
            "((turn.activity.type == 'messageDelete') && ((turn.dialogEvent.name == 'activityReceived') && (turn.test == 1)))"
        );
        assertExpression(
            new OnMessageReactionActivity([], 'turn.test == 1'),
            "((turn.activity.type == 'messageReaction') && ((turn.dialogEvent.name == 'activityReceived') && (turn.test == 1)))"
        );
        assertExpression(
            new OnMessageUpdateActivity([], 'turn.test == 1'),
            "((turn.activity.type == 'messageUpdate') && ((turn.dialogEvent.name == 'activityReceived') && (turn.test == 1)))"
        );
        assertExpression(
            new OnQnAMatch([], 'turn.test == 1'),
            "((turn.recognized.intent == 'QnAMatch') && ((turn.dialogEvent.name == 'recognizedIntent') && (turn.test == 1)))"
        );
        assertExpression(
            new OnRepromptDialog([], 'turn.test == 1'),
            "((turn.dialogEvent.name == 'repromptDialog') && (turn.test == 1))"
        );
        assertExpression(
            new OnTypingActivity([], 'turn.test == 1'),
            "((turn.activity.type == 'typing') && ((turn.dialogEvent.name == 'activityReceived') && (turn.test == 1)))"
        );
        assertExpression(
            new OnUnknownIntent([], 'turn.test == 1'),
            "((turn.dialogEvent.name == 'unknownIntent') && (turn.test == 1))"
        );
    });
});
