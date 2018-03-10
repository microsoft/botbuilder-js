import { Middleware, BotContext, ConversationState } from 'botbuilder';
import { DialogSet, ConfirmPrompt } from 'botbuilder-dialogs';

export class GoodbyeMiddleware implements Middleware {
    private dialogs = new DialogSet();

    constructor(private conversationState: ConversationState, private stackName = 'goodbyeStack') { 
        // Add private dialogs for confirming goodbye
        this.dialogs.add('confirmGoodbye', [
            async function (dc) {
                await dc.prompt('confirmPrompt', `This will end any active tasks. Are you sure?`);
            },
            async function (dc, value: boolean) {
                if (value) {
                    // Clear conversation state
                    await dc.context.sendActivity(`Ok... Goodbye`);
                    conversationState.clear(dc.context);
                } else {
                    await dc.context.sendActivity(`Ok...`);
                }
                return dc.end();
            }
        ]);
        
        this.dialogs.add('confirmPrompt', new ConfirmPrompt());
    }

    public async onProcessRequest(context: BotContext, next: () => Promise<void>) {
        if (context.request.type === 'message') {
            // Create dialog context using our middlewares private dialog stack
            const state = await this.conversationState.read(context);
            if (!Array.isArray(state[this.stackName])) { state[this.stackName] = [] }
            const dc = this.dialogs.createContext(context, state[this.stackName]);

            // Intercept the message if we're prompting the user
            await dc.continue();
            if (context.responded) {
                return;
            }

            // Check for user to say "goodbye"
            const utterance = (context.request.text || '').trim().toLowerCase();
            if (utterance === 'goodbye') {
                // Start confirmation dialog
                await dc.begin('confirmGoodbye');
            } else {
                // Let bot process request
                await next();
            }
        } else {
            // Let bot process request
            await next();
        }
    }
}

