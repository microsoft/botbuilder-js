const { ok, strictEqual } = require('assert');
const { createHash } = require('crypto');
const { stub } = require('sinon');
const {
    ActivityTypes,
    ConversationState,
    MemoryStorage,
    TestAdapter,
    SkillConversationIdFactoryBase,
    StatusCodes,
    TurnContext
} = require('botbuilder-core');
const { BoolExpression, StringExpression } = require('adaptive-expressions');
const { DialogManager, DialogTurnStatus } = require('botbuilder-dialogs');
const { BeginSkill, SkillExtensions } = require('../lib')


class SimpleConversationIdFactory extends SkillConversationIdFactoryBase {
    constructor(opts = { useCreateSkillConversationId: false }) {
        super();
        this._conversationRefs = new Map();
        this.useCreateSkillConversationId = opts.useCreateSkillConversationId;
    }

    async createSkillConversationIdWithOptions(opts) {
        if (this.useCreateSkillConversationId) {
            return super.createSkillConversationIdWithOptions();
        }
        const key = createHash('md5').update(opts.activity.conversation.id + opts.activity.serviceUrl).digest('hex');

        const ref = this._conversationRefs.has(key);
        if (!ref) {
            this._conversationRefs.set(key, {
                conversationReference: TurnContext.getConversationReference(opts.activity),
                oAuthScope: opts.fromBotOAuthScope
            });
        }
        return key;
    }

    async createSkillConversationId(convRef) {
        const key = createHash('md5').update(convRef.conversation.id + convRef.serviceUrl).digest('hex');

        const ref = this._conversationRefs.has(key);
        if (!ref) {
            this._conversationRefs.set(key, {
                conversationReference: convRef
            });
        }
        return key;
    }

    async getConversationReference(skillConversationId) { return this._conversationRefs.get(skillConversationId) }

    async getSkillConversationReference(skillConversationId) { return this.getConversationReference(skillConversationId) }

    async deleteConversationReference() { /* not used in BeginSkill */ }
}

describe('BeginSkill', function() {
    this.timeout(3000);

    let activitySent; // Activity
    let fromBotIdSent; // string
    let toBotIdSent; // string
    let toUriSent; // string (URI)

    // Callback to capture the parameters sent to the skill
    const captureAction = (fromBotId, toBotId, toUri, serviceUrl, conversationId, activity) => {
        // Capture values sent to the skill so we can assert the right parameters were used.
        fromBotIdSent = fromBotId;
        toBotIdSent = toBotId;
        toUriSent = toUri;
        activitySent = activity;
    }

    // Create BotFrameworkHttpClient and postActivityStub
    const [skillClient, postActivityStub] = createSkillClientAndStub(captureAction);

    // Setup dialog manager
    const conversationState = new ConversationState(new MemoryStorage());
    const dm = new DialogManager();
    dm.conversationState = conversationState;
    SkillExtensions.useSkillClient(dm, skillClient);
    SkillExtensions.useSkillConverationIdFactory(dm, new SimpleConversationIdFactory());

    // Setup skill dialog
    const dialog = new BeginSkill();
    setSkillDialogOptions(dialog);
    dm.rootDialog = dialog;

    it('should call skill via beginDialog()', async () => {
        // Send initial activity
        const adapter = new TestAdapter(async (context) => {
            const { turnResult } = await dm.onTurn(context);

            // Assert results and data sent to the SkillClient for first turn
            strictEqual(fromBotIdSent, 'SkillCallerId');
            strictEqual(toBotIdSent, 'SkillId');
            strictEqual(toUriSent, 'http://testskill.contoso.com/api/messages');
            strictEqual(activitySent.text, 'test');
            strictEqual(turnResult.status, DialogTurnStatus.waiting);
            ok(postActivityStub.calledOnce);
        });

        await adapter.send('test');
    });
});

function setSkillDialogOptions(dialog) {
    dialog.disabled = new BoolExpression(false);
    dialog.botId = new StringExpression('SkillCallerId');
    dialog.skillHostEndpoint = new StringExpression('http://test.contoso.com/skill/messages');
    dialog.skillAppId = new StringExpression('SkillId');
    dialog.skillEndpoint = new StringExpression('http://testskill.contoso.com/api/messages');
}

/**
 * @remarks
 * captureAction should match the below signature:
 * `(fromBotId: string, toBotId: string, toUrl: string, serviceUrl: string, conversationId: string, activity: Activity) => void`
 * @param {Function} captureAction 
 * @param {StatusCodes} returnStatusCode Defaults to StatusCodes.OK
 * @returns [BotFrameworkHttpClient, postActivityStub]
 */
function createSkillClientAndStub(captureAction, returnStatusCode = StatusCodes.OK) {
    // This require should not fail as this method should only be called after verifying that botbuilder is resolvable.
    const { BotFrameworkHttpClient } = require('../../botbuilder/lib');

    if (captureAction && typeof captureAction !== 'function') {
        throw new TypeError(`Failed test arrangement - createSkillClientAndStub() received ${typeof captureAction} instead of undefined or a function.`);
    }

    // Create ExpectedReplies object for response body
    const dummyActivity = { type: ActivityTypes.Message, attachments: [], entities: [] };
    dummyActivity.text = 'dummy activity';
    const activityList = { activities: [dummyActivity] };

    // Create wrapper for captureAction
    function wrapAction(...args) {
        captureAction(...args);
        return { status: returnStatusCode, body: activityList };
    }
    // Create client and stub
    const skillClient = new BotFrameworkHttpClient({});
    const postActivityStub = stub(skillClient, 'postActivity');

    if (captureAction) {
        postActivityStub.callsFake(wrapAction);
    } else {
        postActivityStub.returns({ status: returnStatusCode, body: activityList });
    }

    return [ skillClient, postActivityStub ];
}