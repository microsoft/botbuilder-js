import { StringExpression } from 'adaptive-expressions';
import * as assert from 'assert';
import {
    ConversationState,
    UserState,
    TurnContext,
    TestAdapter,
    MemoryStorage,
    Activity,
    ChannelAccount,
    ConversationAccount,
} from 'botbuilder';
import { DialogContext, DialogSet } from 'botbuilder-dialogs';
import { jwt } from 'botbuilder-test-utils';
import { getValue, getComputeId } from '../../lib/actions/actionHelpers';

jwt.mocha();

async function createTestDc(): Promise<DialogContext> {
    const storage = new MemoryStorage();
    const convoState = new ConversationState(storage);
    const userState = new UserState(storage);

    const dialogState = convoState.createProperty('dialogs');
    const dialogs = new DialogSet(dialogState);

    const beginMessage: Partial<Activity> = {
        text: `begin`,
        type: 'message',
        channelId: 'test',
        from: <ChannelAccount>{ id: 'user' },
        recipient: <ChannelAccount>{ id: 'bot' },
        conversation: <ConversationAccount>{ id: 'convo1' },
    };

    const context = new TurnContext(new TestAdapter(), beginMessage);
    context.turnState.set('ConversationState', convoState);
    context.turnState.set('UserState', userState);

    const dc = await dialogs.createContext(context);
    await dc.state.loadAllScopes();

    return dc;
}

describe('Action Helpers', function () {
    it('getValue should correctly retrieve an expression value from DialogContext.State', async function () {
        const dc = await createTestDc();

        dc.state.setValue('user.result', 'this is the result');

        const stringExpression = new StringExpression('=user.result');

        const result = getValue(dc, stringExpression);

        assert.strictEqual(result, 'this is the result');
    });

    it('getValue should return null if no expression provided', async function () {
        const dc = await createTestDc();

        const resultNull = getValue(dc, null);

        assert.strictEqual(resultNull, null);
    });

    it('getComputeId should join ids of various types into strings, separated by commas', function () {
        const result = getComputeId('someClassName', ['first', 'second', null, undefined, {}, 6, ['a', {}], 7]);
        assert.strictEqual(result, 'someClassName[first,second,,,{},6,a,[object Object],7]');
    });

    it('getComputeId should concatenate long strings and follow them with ellipses', function () {
        const result = getComputeId('someClassName', [
            'first',
            'this is an unnecessarily long string that should get concatenated and followed by an ellipses. You know, one of these: ...',
            'third',
            {
                anotherOne: 'it should also shorten this object and string',
            },
            'fifth',
        ]);
        assert.strictEqual(
            result,
            'someClassName[first,this is an unnecessarily long ...,third,{"anotherOne":"it should also ...,fifth]'
        );
    });
});
