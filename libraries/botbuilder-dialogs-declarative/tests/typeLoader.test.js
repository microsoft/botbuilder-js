const { Configurable, TextPrompt, Dialog, DialogManager } = require('botbuilder-dialogs');
const { AdaptiveDialog } = require('botbuilder-dialogs-adaptive');
const { ConversationState, UserState } = require('botbuilder');
const { MemoryStorage, TestAdapter } = require('botbuilder-core');
const { TypeFactory, TypeLoader, IResourceProvider, FileResource, FileResourceProvider } = require('../lib');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('TypeLoader', function () {
    this.timeout(5000);

    it('TypeLoader TextPrompt: simple textprompt dialog should prompt for text', async function () {
        const adapter = await declarativeTestCase('00 - TextPrompt/SimplePrompt.main.dialog', null);

        await adapter.send('hi')
                .assertReply('Hello, I\'m Zoidberg. What is your name?');
    });

    it('TypeLoader Steps: should be ran when no other rules', async function () {
        const adapter = await declarativeTestCase('01 - Steps/Steps.main.dialog', null);
        
        await adapter.send('hi')
                .assertReply('Action 1')
                .assertReply('Action 2')
                .assertReply('Action 3');
    });

    it('TypeLoader EndTurn: end turn should wait for user input', async function () {
        const adapter = await declarativeTestCase('02 - EndTurn/EndTurn.main.dialog', null);
        
        await adapter
            .send('hi')
                .assertReply('What\'s up?')
            .send('not much homie')
                .assertReply('Oh I see!');
    });

    it('TypeLoader IfCondition: if name is null then ask, if not will say hi', async function () {
        const adapter = await declarativeTestCase('03 - IfCondition/IfCondition.main.dialog', null);
        
        await adapter
            .send('hi')
                .assertReply("Hello, I'm Zoidberg. What is your name?")
            .send('Wendy')
                .assertReply('Hello Wendy, nice to talk to you!')
    });

    it('TypeLoader TextInput: should prompt for name and then use name in response. Next time prompt should not ask for property that is already in memory', async function () {
        const adapter = await declarativeTestCase('04 - TextInput\\TextInput.main.dialog', null);

        await adapter
            .send('hi')
                .assertReply('Hello, I\'m Zoidberg. What is your name?')
            .send('Carlos')
                .assertReply('Hello Carlos, nice to talk to you!')
    });

    it('TypeLoader DoSteps: if user says joke, then should go into the joke flow; if user says fortune, then should go into the fortune flow', async function () {
        const adapter = await declarativeTestCase('06 - DoSteps/DoSteps.main.dialog', '06 - DoSteps');
        await adapter
            .send('hi')
                .assertReply('Hello, I\'m Zoidberg. What is your name?')
            .send('Rose')
                .assertReply('Hello Rose, nice to talk to you!')
            .send('joke') 
                .assertReply('Why did the chicken cross the road?') 
            .send('why')
                .assertReply('To get to the other side')
            .send('fortune')
                .assertReply('Seeing into the future...')
                .assertReply('I see great things happening...')
                .assertReply('Perhaps even a successful bot demo')
    });

    it('TypeLoader BeginDialog: should extract two intent flows into two dialog files', async function () {
        const adapter = await declarativeTestCase('07 - BeginDialog/BeginDialog.main.dialog', '07 - BeginDialog');
        await adapter
            .send('hi')
                .assertReply('Hello, I\'m Zoidberg. What is your name?')
            .send('Bender')
                .assertReply('Hello Bender, nice to talk to you!')
            .send('tell me a joke') 
                .assertReply('Why did the chicken cross the road?') 
            .send('why?')
                .assertReply('To get to the other side')
            .send('tell my fortune')
                .assertReply('Seeing into the future...')
                .assertReply('I see great things in your future...')
                .assertReply('Potentially a successful demo')
    });

    it('TypeLoader EndDialog: should cancel dialog while saying cancel or never mind', async function () {
        const adapter = await declarativeTestCase('09 - EndDialog/EndDialog.main.dialog', '09 - EndDialog');
        await adapter
            .send('hi')
                .assertReply('Hello, I\'m Zoidberg. What is your name?')
            .send('Alex')
                .assertReply('Hello Alex, nice to talk to you!')
                .assertReply("I'm a joke bot. To get started say \"joke\".")
            .send('tell me a joke') 
                .assertReply('Why did the chicken cross the road?') 
            .send('why?')
                .assertReply('To get to the other side')
            .send('cancel')
                .assertReply('ok.')
    });
});

async function declarativeTestCase(path, resourcesFolder) {
    const json = await readPackageJson(`libraries/botbuilder-dialogs-declarative/tests/resources/${path}`);
    let loader = new TypeLoader();

    if (resourcesFolder) {
        let resourceProvider = new FileResourceProvider();
        resourceProvider.registerDirectory(`libraries/botbuilder-dialogs-declarative/tests/resources`);
        loader = new TypeLoader(null, resourceProvider)
    }
    
    const dialog = await loader.load(json);

    // Create bots DialogManager and bind to state storage
    const bot = new DialogManager();
    bot.conversationState = new ConversationState(new MemoryStorage());
    bot.userState = new UserState(new MemoryStorage());

    const adapter = new TestAdapter(async turnContext => {
        // Route activity to bot.
        await bot.onTurn(turnContext);
    });

    bot.rootDialog = dialog;

    return adapter;
}

function readPackageJson(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, function (err, buffer) {
            if (err) { reject(err); }
            var json = JSON.parse(buffer.toString().trim());
            resolve(json);
          });
    });
}
