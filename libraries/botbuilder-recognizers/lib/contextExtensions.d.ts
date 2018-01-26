import { IntentSet } from './intentSet';
declare global  {
    interface BotContextExtensions {
        readonly intents: IntentSet;
    }
}
