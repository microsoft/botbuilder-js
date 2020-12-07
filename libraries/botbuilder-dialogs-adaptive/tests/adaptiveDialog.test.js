const {
    ConversationState,
    MessageFactory,
    MemoryStorage,
    TestAdapter,
    useBotState,
    UserState,
} = require('botbuilder-core');
const { DialogManager } = require('botbuilder-dialogs');
const {
    ActivityTemplate,
    AdaptiveDialog,
    AttachmentInput,
    AttachmentOutputFormat,
    InputDialog,
    InputState,
    OnUnknownIntent,
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
