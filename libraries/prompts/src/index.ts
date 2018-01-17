/**
 * @module botbuilder-prompts
 */
/** second comment block */
export * from './attachmentPrompt';
export * from './choicePrompt';
export * from './confirmPrompt';
export * from './numberPrompt';
export * from './prompt';
export * from './textPrompt';

import { PromptState } from './prompt';

declare global {
    export interface ConversationState {
        /** Tracks the bots active prompt. */
        activePrompt?: PromptState;
    }
}
