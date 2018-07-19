/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, ActivityTypes } from '../../botbuilder/lib';
import { Dialog, DialogTurnResult, DialogContainer } from './dialog';
import { DialogContext } from './dialogContext';


export abstract class RootDialog implements DialogContainer {
    private dialogs: { [id:string]: Dialog; } = {};

    constructor(public readonly id = '') { }

    public readonly parent = undefined;

    public add<T extends Dialog>(dialog: T): T {
        if (!(dialog instanceof Dialog)) { throw new Error(`RootDialog.add(): the added dialog is not an instance of the Dialog class.`) }
        if (this.dialogs.hasOwnProperty(dialog.id)) { throw new Error(`RootDialog.add(): a dialog with an id of '${dialog.id}' has already been added.`) }
        this.dialogs[dialog.id] = dialog;
        return dialog;
    }
    
    public async createContext(context: TurnContext, state: object): Promise<DialogContext> {
        return new DialogContext(this, context, state);
    }

    public find<T extends Dialog = Dialog>(dialogId: string): T|undefined {
        return this.dialogs[dialogId] as T;
    }

    public async dispatch(context: TurnContext, state: object): Promise<void> {
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
        const dc = await this.createContext(context, rootState.dialogState);
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

