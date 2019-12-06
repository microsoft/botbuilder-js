const { AdaptiveDialog, RegExpRecognizer, OnIntent, OnUnknownIntent, SendActivity, TextInput, IfCondition, EndTurn } = require('../lib');
const { TestAdapter, ConversationState, MemoryStorage } = require('botbuilder-core');
const { DialogManager } = require('botbuilder-dialogs');

describe('Conditions', function () {
    this.timeout(5000);

    it('OnIntent', async function () {
        const rootDialog = new AdaptiveDialog();
        rootDialog.autoEndDialog = false;
        rootDialog.recognizer = new RegExpRecognizer().addIntent('JokeIntent', /tell .*joke/i);
        rootDialog.triggers.push(new OnIntent('#JokeIntent', [], [
            new SendActivity('Why did the chicken cross the road?'),
            new EndTurn(),
            new SendActivity('To get to the other side.')
        ]));

        const bot = new DialogManager();
        bot.rootDialog = rootDialog;
        bot.conversationState = new ConversationState(new MemoryStorage());

        const testAdapter = new TestAdapter(async function (turnContext) {
            await bot.onTurn(turnContext);
        });

        await testAdapter.send('tell a joke')
            .assertReply('Why did the chicken cross the road?')
            .send('why?')
            .assertReply('To get to the other side.')
            .startTest();
    });

    it('OnIntent with extra condition', async function () {
        const rootDialog = new AdaptiveDialog();
        rootDialog.autoEndDialog = false;
        rootDialog.recognizer = new RegExpRecognizer().addIntent('JokeIntent', /tell .*joke/i);
        rootDialog.triggers.push(new OnIntent('#JokeIntent', [], [
            new SendActivity('{dialog.username}, do you know why did the chicken cross the road?'),
            new EndTurn(),
            new SendActivity('To get to the other side.')
        ], 'dialog.username != null'));
        rootDialog.triggers.push(new OnUnknownIntent([
            new IfCondition('dialog.username == null', [
                new TextInput('dialog.username', `Hi! What's your name?`)
            ]),
            new SendActivity(`Hi {dialog.username}. It's nice to meet you.`)
        ]));

        const bot = new DialogManager();
        bot.rootDialog = rootDialog;
        bot.conversationState = new ConversationState(new MemoryStorage());

        const testAdapter = new TestAdapter(async function (turnContext) {
            await bot.onTurn(turnContext);
        });

        await testAdapter.send('tell a joke')
            .assertReply(`Hi! What's your name?`)
            .send('Bob')
            .assertReply(`Hi Bob. It's nice to meet you.`)
            .send('tell a joke')
            .assertReply('Bob, do you know why did the chicken cross the road?')
            .send('why?')
            .assertReply('To get to the other side.')
            .startTest();
    });

    it('OnUnknownIntent', async function () {
        const rootDialog = new AdaptiveDialog();
        rootDialog.autoEndDialog = false;
        rootDialog.recognizer = new RegExpRecognizer().addIntent('JokeIntent', /tell .*joke/i);
        rootDialog.triggers.push(new OnIntent('#JokeIntent', [], [
            new SendActivity('Why did the chicken cross the road?'),
            new EndTurn(),
            new SendActivity('To get to the other side.')
        ]));
        rootDialog.triggers.push(new OnUnknownIntent([
            new SendActivity('Hello.')
        ]));

        const bot = new DialogManager();
        bot.rootDialog = rootDialog;
        bot.conversationState = new ConversationState(new MemoryStorage());

        const testAdapter = new TestAdapter(async function (turnContext) {
            await bot.onTurn(turnContext);
        });

        await testAdapter.send('hi')
            .assertReply('Hello.')
            .startTest();
    });

    it('OnUnknownIntent with extra condition', async function () {
        const rootDialog = new AdaptiveDialog();
        rootDialog.autoEndDialog = false;
        rootDialog.triggers.push(new OnUnknownIntent([
            new TextInput('dialog.username', `Hi! What's your name?`),
            new SendActivity(`Thanks {dialog.username}!`)
        ], 'dialog.username == null'));
        rootDialog.triggers.push(new OnUnknownIntent([
            new SendActivity(`Hi {dialog.username}. It's nice to meet you.`)
        ], 'dialog.username != null'));

        const bot = new DialogManager();
        bot.rootDialog = rootDialog;
        bot.conversationState = new ConversationState(new MemoryStorage());

        const testAdapter = new TestAdapter(async function (turnContext) {
            await bot.onTurn(turnContext);
        });

        await testAdapter.send('hi')
            .assertReply(`Hi! What's your name?`)
            .send('Bob')
            .assertReply('Thanks Bob!')
            .send('hi')
            .assertReply(`Hi Bob. It's nice to meet you.`)
            .startTest();
    });
});