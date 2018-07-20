/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, ActivityTypes } from 'botbuilder';
import { Dialog, DialogTurnResult, DialogContainer } from './dialog';
import { DialogContext } from './dialogContext';


export abstract class DialogDispatcher implements DialogContainer {
    private dialogs: { [id:string]: Dialog; } = {};

    constructor(public readonly id = '') { }

    public readonly parent = undefined;

    public add<T extends Dialog>(dialog: T): T {
        if (!(dialog instanceof Dialog)) { throw new Error(`RootDialog.add(): the added dialog is not an instance of the Dialog class.`) }
        if (this.dialogs.hasOwnProperty(dialog.id)) { throw new Error(`RootDialog.add(): a dialog with an id of '${dialog.id}' has already been added.`) }
        dialog.parent = this;
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
        const dState = state as DispatcherState;
        if (!dState.dialogState) {
            newConversation = true;
            dState.dialogState = {};
        }

        // Create dialog context
        const dc = await this.createContext(context, dState.dialogState);

        // Signal start of conversation
        if (!context.responded) {
            if (newConversation && !conversationEnded) {
                await this.onConversationBegin(dc);
            }
        } else {
            console.warn(`RootDialogContainer.continue(): the root dialog was called and 'context.responded' is already true.`);
        }

        // Dispatch activity
        if (!conversationEnded && !context.responded) {
            // Check for interruptions and handle non-message activities
            await this.onActivity(dc);
            if (!conversationEnded && !context.responded) {
                // Continue existing dialog
                await dc.continue();
                if (!conversationEnded && !context.responded && context.activity.type === ActivityTypes.Message) {
                    // Run fallback logic
                    await this.onNoResponse(dc);
                }
            }
        }

        // Signal end of conversation
        if (conversationEnded) {
            delete dState.dialogState;
            await this.onConversationEnd(dc);
        }
    }

    protected onActivity(dc: DialogContext): Promise<void> {
        switch (dc.context.activity.type) {
            case ActivityTypes.ContactRelationUpdate:
                return this.onContactRelationUpdate(dc);
            case ActivityTypes.ConversationUpdate:
                return this.onConversationUpdate(dc);
            case ActivityTypes.Event:
                return this.onEvent(dc);
            case ActivityTypes.Invoke:
                return this.onInvoke(dc);
            case ActivityTypes.Message:
                return this.onMessage(dc);
        }
    }

    protected onContactRelationUpdate(dc: DialogContext): Promise<void> {
        return Promise.resolve();
    }

    protected onConversationBegin(dc: DialogContext): Promise<void> {
        return Promise.resolve();
    }

    protected onConversationEnd(dc: DialogContext): Promise<void> {
        return Promise.resolve();
    }

    protected onConversationUpdate(dc: DialogContext): Promise<void> {
        return Promise.resolve();
    }

    protected onEvent(dc: DialogContext): Promise<void> {
        return Promise.resolve();
    }

    protected onInvoke(dc: DialogContext): Promise<void> {
        return Promise.resolve();
    }

    protected onMessage(dc: DialogContext): Promise<void> {
        return Promise.resolve();
    }

    protected onNoResponse(dc: DialogContext): Promise<void> {
        return Promise.resolve();
    }
}

interface DispatcherState {
    dialogState?: object;
}

