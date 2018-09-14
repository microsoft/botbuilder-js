import { BotFrameworkAdapter, MemoryStorage, ConversationState, TurnContext, MessageFactory, CardFactory, Attachment } from 'botbuilder';
import { DialogSet } from 'botbuilder-dialogs';
import * as restify from 'restify';

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter( { 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});

// Add conversation state middleware
interface DemoState {
    currentLocale?: string;     // remembers the current locale between demos
    demo?: string;              // active demo (if any)
    dialogStack?: any;          // persisted dialog stack when running 'dialog' based demo
    controlState?: object;      // persisted control state when running 'topic' based demo
}
const conversationState = new ConversationState<DemoState>(new MemoryStorage());
adapter.use(conversationState);

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        if (context.activity.type === 'message') {
            // Create dialog context.
            const state = conversationState.get(context);
            const dc = dialogs.createContext(context, state);

            // Check for list to show
            const utterance = (context.activity.text || '').trim().toLowerCase();
            if (utterance.includes('images')) {
                const startImage = Math.floor(Math.random() * 100);
                await dc.endAll().begin('imageList', { filter: { start: startImage }});
            } else {
                await dc.continueDialog();

                // Check to see if anyone replied.
                if (!context.responded) {
                    await context.sendActivity(`To show a list send a reply with "images".`);
                }
            }
        }
    });
});

import { ListControl } from './listControl';

const dialogs = new DialogSet();

dialogs.add('imageList', new ListControl((dc, filter, continueToken) => {
    // Render a page of images to hero cards 
    const page = typeof continueToken === 'number' ? continueToken : 0;
    const cards: Attachment[] = [];
    for (let i = 0; i < 10; i++) {
        const imageNum = i + (page * 10) + 1;
        const card = CardFactory.heroCard(
            `Image ${imageNum}`, 
            [`https://picsum.photos/100/100/?image=${filter.start + imageNum}`]
        );
        cards.push(card);
    }

    // Render cards to user as a carousel
    const activity = MessageFactory.carousel(cards);

    // Return page of results
    return { results: activity, continueToken: page < 4 ? page + 1 : undefined };
}));
