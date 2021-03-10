const { ConversationState, MessageFactory, MemoryStorage, TestAdapter, useBotState, UserState } = require('botbuilder');
const { DialogManager } = require('botbuilder-dialogs');
const {
    ActivityTemplate,
    AdaptiveDialog,
    AttachmentInput,
    AttachmentOutputFormat,
    BeginDialog,
    InputDialog,
    InputState,
    OnBeginDialog,
    OnIntent,
    OnUnknownIntent,
    RegexRecognizer,
    ReplaceDialog,
    SendActivity,
} = require('../lib');

class AttachmentOrNullInput extends AttachmentInput {
    async onRecognizeInput(dc) {
        const input = dc.state.getValue(InputDialog.VALUE_PROPERTY);
        const first = input.length > 0 ? input[0] : undefined;

        // NOTE: this custom AttachmentInput allows for no attachment.
        switch (this.outputFormat.getValue(dc.state)) {
            case AttachmentOutputFormat.all:
                dc.state.setValue(InputDialog.VALUE_PROPERTY, input);
                break;
            case AttachmentOutputFormat.first:
                dc.state.setValue(InputDialog.VALUE_PROPERTY, first);
                break;
            default:
                break;
        }
        return InputState.valid;
    }
}

const createDialogWithCustomInput = () => {
    return new AdaptiveDialog().configure({
        autoEndDialog: false,
        triggers: [
            new OnUnknownIntent().configure({
                actions: [
                    new AttachmentOrNullInput().configure({
                        prompt: new ActivityTemplate('Upload picture'),
                        invalidPrompt: new ActivityTemplate('Invalid'),
                        validations: [
                            "(turn.activity.attachments == null || turn.activity.attachments.count == 0) || (turn.activity.attachments[0].contentType == 'image/jpeg' || turn.activity.attachments[0].contentType == 'image/png')",
                        ],
                        property: 'user.picture',
                    }),
                    new SendActivity('passed'),
                ],
            }),
        ],
    });
};

describe('AdaptiveDialog', function () {
    it('Replace parent', async () => {
        const root = new AdaptiveDialog('root').configure({
            autoEndDialog: false,
            triggers: [
                new OnBeginDialog().configure({
                    actions: [
                        new SendActivity('Replacing this dialog with a child'),
                        new ReplaceDialog('newDialog'),
                        new SendActivity('You should not see these actions since this dialog has been replaced!'),
                    ],
                }),
            ],
        });

        const newDialog = new AdaptiveDialog('newDialog').configure({
            triggers: [
                new OnBeginDialog().configure({
                    actions: [new SendActivity('This dialog (newDialog) will end after this message')],
                }),
            ],
            autoEndDialog: false,
        });

        const dm = new DialogManager(root);
        dm.dialogs.add(root);
        dm.dialogs.add(newDialog);

        const adapter = new TestAdapter(async (context) => {
            await dm.onTurn(context);
        });
        const storage = new MemoryStorage();
        useBotState(adapter, new ConversationState(storage), new UserState(storage));

        await adapter
            .send('hi')
            .assertReply('Replacing this dialog with a child')
            .assertReply('This dialog (newDialog) will end after this message')
            .startTest();
    });

    it('Replace parent complex verify post replace', async () => {
        const outerDialog = new AdaptiveDialog('outer').configure({
            autoEndDialog: false,
            recognizer: new RegexRecognizer().configure({
                intents: [
                    {
                        intent: 'start',
                        pattern: 'start',
                    },
                    {
                        intent: 'where',
                        pattern: 'where',
                    },
                ],
            }),
            triggers: [
                new OnBeginDialog().configure({
                    actions: [new SendActivity("Say 'start' to get started")],
                }),
                new OnIntent().configure({
                    intent: 'start',
                    actions: [
                        new SendActivity('Starting child dialog'),
                        new BeginDialog('root'),
                        new SendActivity('child dialog has ended and returned back'),
                    ],
                }),
                new OnIntent().configure({
                    intent: 'where',
                    actions: [new SendActivity('outer dialog..')],
                }),
            ],
        });

        const rootDialog = new AdaptiveDialog('root').configure({
            autoEndDialog: false,
            triggers: [
                new OnBeginDialog().configure({
                    actions: [
                        new SendActivity('Replacing this dialog with a child'),
                        new ReplaceDialog('newDialog'),
                        new SendActivity('You should not see these actions since this dialog has been replaced!'),
                    ],
                }),
            ],
        });

        const newDialog = new AdaptiveDialog('newDialog').configure({
            triggers: [
                new OnBeginDialog().configure({
                    actions: [new SendActivity('This dialog (newDialog) will end after this message')],
                }),
            ],
        });

        const dm = new DialogManager(outerDialog);
        dm.dialogs.add(rootDialog);
        dm.dialogs.add(newDialog);

        const adapter = new TestAdapter(async (context) => {
            await dm.onTurn(context);
        });
        const storage = new MemoryStorage();
        useBotState(adapter, new ConversationState(storage), new UserState(storage));

        await adapter
            .send('hello')
            .assertReply("Say 'start' to get started")
            .send('where')
            .assertReply('outer dialog..')
            .send('start')
            .assertReply('Starting child dialog')
            .assertReply('Replacing this dialog with a child')
            .assertReply('This dialog (newDialog) will end after this message')
            .assertReply('child dialog has ended and returned back')
            .send('where')
            .assertReply('outer dialog..')
            .startTest();
    });

    it('Custom AttachmentInput dialog with no file', async () => {
        const dm = new DialogManager(createDialogWithCustomInput());
        const adapter = new TestAdapter(async (context) => {
            await dm.onTurn(context);
        });
        const storage = new MemoryStorage();
        useBotState(adapter, new ConversationState(storage), new UserState(storage));

        await adapter.send('hello').assertReply('Upload picture').send('skip').assertReply('passed').startTest();
    });

    it('Custom AttachmentInput dialog with file', async () => {
        const dm = new DialogManager(createDialogWithCustomInput());
        const adapter = new TestAdapter(async (context) => {
            await dm.onTurn(context);
        });
        const storage = new MemoryStorage();
        useBotState(adapter, new ConversationState(storage), new UserState(storage));

        const attachment = { contentType: 'image/png', contentUrl: 'https://contenturl.com', name: 'image.png' };
        const pictureActivity = MessageFactory.attachment(attachment);
        await adapter
            .send('hello')
            .assertReply('Upload picture')
            .send(pictureActivity)
            .assertReply('passed')
            .startTest();
    });
});
