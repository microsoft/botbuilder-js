/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, ActivityTypes } from 'botbuilder';
import { DialogTurnResult } from './dialog';
import { DialogContext } from './dialogContext';
import { DialogSet } from './dialogSet';


export abstract class RootDialogContainer {
    /** The containers dialog set. */
    protected readonly dialogs = new DialogSet();

    public async continue(context: TurnContext, state: object): Promise<void> {
        // Listen for endOfConversation sent
        let conversationEnded = context.activity.type === ActivityTypes.EndOfConversation;
        context.onSendActivities(async (ctx, activities, next) => {
            for (let i = 0; i < activities.length; i++) {
                if (activities[i].type === ActivityTypes.EndOfConversation) { conversationEnded = true }
            }
            return await next();
        });

        // Initialize state object
        let newConversation = false;
        const rootState = state as RootDialogContainerState;
        if (!rootState.dialogState) {
            newConversation = true;
            rootState.dialogState = {};
        }

        // Create dialog context
        const dc = await this.dialogs.createContext(context, rootState.dialogState);
        const wasActive = !!dc.activeDialog; 

        // Signal start of conversation
        if (!context.responded) {
            if (newConversation && !conversationEnded) {
                await this.onConversationBegin(dc);
            }
        } else {
            console.warn(`RootDialogContainer.continue(): the root dialog was called and 'context.responded' is already true.`);
        }

        // Check for interruptions
        let result: DialogTurnResult;
        const isMessage = context.activity.type === ActivityTypes.Message;
        if (!context.responded && !conversationEnded && isMessage) {
            await this.onInterruption(dc);
        }

        // Continue existing dialog
        if (!context.responded && !conversationEnded) {
            await dc.continue();
        }

        // Run fallback logic
        if (!context.responded && !conversationEnded && isMessage) {
            await this.onFallback(dc);
        }

        // Signal end of conversation
        if (conversationEnded) {
            delete rootState.dialogState;
            await this.onConversationEnd(dc);
        }
    }

    protected onConversationBegin(dc: DialogContext): Promise<void> {
        return Promise.resolve();
    }

    protected onInterruption(dc: DialogContext): Promise<void> {
        return Promise.resolve();
    }

    protected onFallback(dc: DialogContext): Promise<void> {
        return Promise.resolve();
    }

    protected onConversationEnd(dc: DialogContext): Promise<void> {
        return Promise.resolve();
    }
}

interface RootDialogContainerState {
    dialogState?: object;
}

