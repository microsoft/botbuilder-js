const { BoolExpression } = require('adaptive-expressions');
const { ConversationState, UserState, MemoryStorage, TestAdapter } = require('botbuilder');
const { DialogManager } = require('botbuilder-dialogs');
const {
    AdaptiveDialog,
    OnBeginDialog,
    SendActivity,
    LanguageGeneratorExtensions,
    TemplateEngineLanguageGenerator,
    RegexRecognizer,
    IntentPattern,
    TextInput,
    OnIntent,
} = require('botbuilder-dialogs-adaptive');

describe('Memory - Memory Scopes', function () {
    this.timeout(5000);

    it('DialogContextMemoryScope test', async function () {
        const dialog = new AdaptiveDialog('adaptiveDialog');
        const dialog2 = new AdaptiveDialog('adaptiveDialog2');

        dialog.triggers.push(new OnBeginDialog([dialog2]));
        dialog2.triggers.push(
            new OnBeginDialog([
                new SendActivity('${dialogcontext.activeDialog}').configure({ id: 'action1' }),
                new SendActivity('${dialogcontext.parent}'),
                new SendActivity("${contains(dialogcontext.stack, 'foo')}"),
                new SendActivity("${contains(dialogcontext.stack, 'adaptiveDialog')}"),
                new SendActivity("${contains(dialogcontext.stack, 'adaptiveDialog2')}"),
            ])
        );

        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const userState = new UserState(storage);
        const dm = new DialogManager(dialog);
        dm.userState = userState;
        dm.conversationState = convoState;
        LanguageGeneratorExtensions.useLanguageGeneration(dm);

        await new TestAdapter(async (context) => {
            return dm.onTurn(context);
        })
            .send('hi')
            .assertReply('action1')
            .assertReply('adaptiveDialog2')
            .assertReply('false')
            .assertReply('true')
            .assertReply('true')
            .startTest();
    });

    it('DialogContextMemoryScope interruption test', async function () {
        const root = new AdaptiveDialog('rootDialog');

        root.autoEndDialog = new BoolExpression(false);
        root.generator = new TemplateEngineLanguageGenerator();
        root.recognizer = new RegexRecognizer();
        root.recognizer.intents.push(new IntentPattern('why', 'why'));

        root.triggers.push(
            new OnBeginDialog([
                new SendActivity('Hello'),
                new TextInput('user.name', 'What is your name?').configure({
                    alwaysPrompt: new BoolExpression(true),
                    id: 'askForName',
                }),
                new SendActivity('I have ${user.name}'),
            ])
        );
        root.triggers.push(
            new OnIntent(
                'why',
                [],
                [new SendActivity('I need your name to complete the sample')],
                "contains(dialogcontext.stack, 'askForName')"
            )
        );
        root.triggers.push(new OnIntent('why', [], [new SendActivity('why what?')]));

        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const userState = new UserState(storage);
        const dm = new DialogManager(root);
        dm.userState = userState;
        dm.conversationState = convoState;
        LanguageGeneratorExtensions.useLanguageGeneration(dm);

        await new TestAdapter(async (context) => {
            return dm.onTurn(context);
        })
            .send('hello')
            .assertReply('Hello')
            .assertReply('What is your name?')
            .send('why')
            .assertReply('I need your name to complete the sample')
            .assertReply('What is your name?')
            .send('tom')
            .assertReply('I have tom')
            .send('why')
            .assertReply('why what?')
            .startTest();
    });
});
