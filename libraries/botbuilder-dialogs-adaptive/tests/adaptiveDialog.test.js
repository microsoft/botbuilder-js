const { ConversationState, MemoryStorage, TestAdapter, useBotState, UserState } = require('botbuilder-core');
const { DialogManager } = require('botbuilder-dialogs');
const {
    AdaptiveDialog,
    BeginDialog,
    OnBeginDialog,
    OnIntent,
    RegexRecognizer,
    ReplaceDialog,
    SendActivity,
} = require('../lib');

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
});
