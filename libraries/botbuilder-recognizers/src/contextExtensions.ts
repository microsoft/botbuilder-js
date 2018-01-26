/**
 * @module botbuilder-recognizers
 */
/** second comment block */
import { BotContext } from 'botbuilder';
import { IntentSet } from './intentSet';

declare global {
    export interface BotContextExtensions {
        readonly intents: IntentSet;
    }
}

Object.defineProperty(BotContext.prototype, 'intents', {
    get: function getIntents() {
        const context: BotContext = this as any;
        if (!context.has('intents')) {
            context.set('intents', new IntentSet());
        }
        return context.get('intents');
    }
});
