const botbuilder = require('botbuilder-core');
const prompts = require('botbuilder-prompts');
const BotFrameworkAdapter = require('botbuilder-services').BotFrameworkAdapter;
const restify = require('restify');

// Create server
let server = restify.createServer();
server.getMessagePipelineToBot(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter and listen to our servers '/api/messages' route.
const botFrameworkAdapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});
server.post('/api/messages', botFrameworkAdapter.listen());

// Setup bot
const bot = new botbuilder.Bot(botFrameworkAdapter)
    .use(new botbuilder.ConsoleLogger())
    .use(new botbuilder.MemoryStorage())
    .use(new botbuilder.BotStateManager())
    .onReceive((context) => {
        if (context.request.type === botbuilder.ActivityTypes.message) {
            // Check to see if the user said cancel or menu
            const utterance = (context.request.text || '').trim();
            if (/^cancel/i.test(utterance)) {
                endDemo(context);
            } else if (/^menu/i.test(utterance)) {
                menu(context);
            } else {
                // Route incoming message to active prompt
                return prompts.Prompt.routeTo(context).then((handled) => {
                    // If no active prompt then start the task
                    if (!handled) { startDemo(context) }
                });
            }
        }
    });

function startDemo(context) {
    context.reply(`The Bot Builder SDK has a rich set of built-in prompts that simplify asking the user a series of questions. This demo will walk you through using each prompt. Just follow the prompts and you can quit at any time by saying 'cancel' or say 'menu' to jump to a specific prompt.`)
    textDemo(context);
}

function endDemo(context) {
    Prompt.cancelActivePrompt(context);
    context.reply(`End of demo... Say 'hi' to start the demo over.`);
}

//-------------------------------------
// Menu
//-------------------------------------

function menu(context) {
    const prompt = selectDemo
        .choices(`TextPrompt|NumberPrompt|ChoicePrompt|ConfirmPrompt|AttachmentPrompt`.split('|'))
        .reply(`Select a demo to jump to.`);
    context.begin(prompt);
}

const selectDemo = new prompts.ChoicePrompt('selectDemo', (context, results) => {
    switch (results.value) {
        case 'TextPrompt':
            return textDemo(context);
        case 'NumberPrompt':
            return numberDemo(context);
        case 'ChoicePrompt':
            return choiceDemo(context);
        case 'ConfirmPrompt':
            return confirmDemo(context);
        case 'AttachmentPrompt':
            return attachmentDemo(context);
    }
});

//-------------------------------------
// TextPrompt
//-------------------------------------

function textDemo(context) {
    const prompt = textPrompt.reply(`TextPrompt:\n\nEnter some text and I'll say it back.`);
    context.begin(prompt);
}

const textPrompt = new prompts.TextPrompt('textPrompt', (context, result) => {
    const text = result.value;
    context.reply(`You entered "${text}"`);
    numberDemo(context);
});

//-------------------------------------
// NumberPrompt
//-------------------------------------

function numberDemo(context) {
    const prompt = numberPrompt.reply(`NumberPrompt:\n\nNow enter a number.`);
    context.begin(prompt);
}

const numberPrompt = new prompts.NumberPrompt('numberPrompt', (context, result) => {
    const value = result.value;
    context.reply(`You entered "${value}"`);
    rangeDemo(context);    
});

function rangeDemo(context) {
    context.reply(`The NumberPrompt let's you constrain the allowed input in a number of ways.`);
    const prompt = rangePrompt.set({ minValue: 1, maxValue: 100, integerOnly: true })
                             .reply(`NumberPrompt:\n\nEnter an integer between 1 and 100.`);
    context.begin(prompt);
}

const rangePrompt = new prompts.NumberPrompt('rangePrompt', (context, result) => {
    const value = result.value;
    context.reply(`You entered "${value}"`);
    choiceDemo(context);
});

//-------------------------------------
// ChoicePrompt
//-------------------------------------

function choiceDemo(context) {
    context.reply(`Bot Builder includes a rich ChoicePrompt class that lets you offer a user a list choices to pick from. The choices can be presented to the user using a range of styles.`);
    const prompt = selectStyle.choices(`auto|none|inline|list|suggestedActions`.split('|'))
                              .reply(`ChoicePrompt:\n\nChoose a list style (the default is auto.)`);
    context.begin(prompt);
}

const selectStyle = new prompts.ChoicePrompt('selectStyle', (context, result) => {
    const style = result.value;
    const prompt = choicePrompt
        .set({ listStyle: prompts.ListStyle[style] })
        .choices(`option A|option B|option C`.split('|'))
        .reply(`ChoicePrompt:\n\nNow pick an option.`);
    context.begin(prompt);
});

const choicePrompt = new prompts.ChoicePrompt('choicePrompt', (context, result) => {
    const choice = result.value;
    context.reply(`You chose "${choice}"`);
    confirmDemo(context);
});

//-------------------------------------
// ConfirmPrompt
//-------------------------------------

function confirmDemo(context) {
    const prompt = confirmPrompt.reply(`ConfirmPrompt:\n\nSimple yes/no questions are possible. Answer yes or no now.`);
    context.begin(prompt);
}

const confirmPrompt = new prompts.ConfirmPrompt('confirmPrompt', (context, result) => {
    const selected = result.value ? 'yes' : 'no';
    context.reply(`You chose "${selected}"`);
    attachmentDemo(context);
});

//-------------------------------------
// AttachmentPrompt
//-------------------------------------

function attachmentDemo(context) {
    const prompt = attachmentPrompt.reply(`AttachmentPrompt:\n\nYour bot can wait on the user to upload an image or video. Send me an image and I'll send it back to you.`);
    context.begin(prompt);
}

const attachmentPrompt = new prompts.AttachmentPrompt('attachmentPrompt', (context, result) => {
    const attachments = result.value;
    const msg = botbuilder.MessageStyler.carousel(attachments, `You sent ${attachments.length} attachment(s).`);
    context.reply(msg);
    endDemo(context);
});


// END OF LINE
