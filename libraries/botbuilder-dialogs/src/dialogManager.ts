/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, Activity, TurnContext, ActivityTypes, StoreItems, ConversationReference, ChannelAccount } from 'botbuilder-core';
import { DialogManagerAdapter } from './internal';
import { DialogState, DialogContext } from './dialogContext';
import { DialogTurnResult, Dialog, DialogTurnStatus } from './dialog';
import { Configurable } from './configurable';
import { DialogSet } from './dialogSet';

export interface PersistedState {
    userState: {
        eTag?: string;
    };
    conversationState: {
        eTag?: string;
        _dialogs?: DialogState;
        _lastAccess?: string;
    };
}

export interface DialogManagerResult {
    turnResult: DialogTurnResult;
    activities?: Partial<Activity>[];
    newState?: PersistedState;
}

export interface PersistedStateKeys {
    userState: string;
    conversationState: string;
}

export interface BotConfiguration {
    /**
     * Root dialog to start from [onTurn()](#onturn) or [run()](#run) method.
     */
    rootDialog?: Dialog;

    /**
     * (Optional) number of milliseconds to expire the bots state after.
     */
    expireAfter?: number;

    /**
     * (Optional) storage provider that will be used to read and write the bots state..
     */
    storage?: Storage;
}

export class DialogManager extends Configurable  {
	public namespace = '';
    private main: DialogSet;
    private mainId: string;

    constructor(rootDialog?: Dialog, storage?: Storage) {
        super();
        if (rootDialog) { this.rootDialog = rootDialog }
        if (storage) { this.storage = storage }
    }

    /**
     * Root dialog to start from [onTurn()](#onturn) or [run()](#run) method.
     */
    public set rootDialog(dialog: Dialog) {
        this.mainId = dialog.id;
        this.main = new DialogSet();
        this.main.add(dialog);
    }

    public get rootDialog(): Dialog {
        return this.mainId ? this.main.find(this.mainId) : undefined;
    }

    /**
     * (Optional) number of milliseconds to expire the bots state after.
     */
    public expireAfter?: number;

    /**
     * (Optional) storage provider that will be used to read and write the bots state..
     */
    public storage?: Storage;

    public configure(config: BotConfiguration): this {
        return super.configure(config);
    }

    public async onTurn(context: TurnContext, state?: PersistedState): Promise<DialogManagerResult> {
        // Log start of turn
        console.log('------------:');

        // Load state from storage if needed
        let saveState = false;
        const keys = DialogManager.getKeys(context);
        if (!state) {
            if (!this.storage) { throw new Error(`DialogManager: unable to load the bots state. Bot.storage not assigned.`) }
            state = await DialogManager.loadState(this.storage, keys);
            saveState = true;
        }

        // Clone state to preserve original state
        const newState = JSON.parse(JSON.stringify(state));

        // Check for expired conversation
        const now  = new Date();
        if (typeof this.expireAfter == 'number' && newState.conversationState._lastAccess) {
            const lastAccess = new Date(newState.conversationState._lastAccess);
            if (now.getTime() - lastAccess.getTime() >= this.expireAfter) {
                // Clear conversation state
                state.conversationState = { eTag: newState.conversationState.eTag }
            }
        }
        newState.conversationState._lastAccess = now.toISOString();

        // Ensure dialog stack populated
        if (!newState.conversationState._dialogs) {
            newState.conversationState._dialogs = { dialogStack: [] }
        }

        // Create DialogContext
        const dc = new DialogContext(this.main, context, newState.conversationState._dialogs);

        // Dispatch "activityReceived" event
        // - This will queue up any interruptions.
        await dc.emitEvent('activityReceived', undefined, true, true);

        // Continue execution
        // - This will apply any queued up interruptions and execute the current/next step(s).
        let result = await dc.continueDialog();
        if (result.status == DialogTurnStatus.empty) {
            result = await dc.beginDialog(this.mainId);
        }

        // Save snapshot of final state for the turn
        context.turnState.set(DialogManager.PersistedStateSnapshotKey, newState);

        // Save state if loaded from storage
        if (saveState) {
            await DialogManager.saveState(this.storage, keys, newState, state, '*');
            return { turnResult: result };
        } else {
            return { turnResult: result, newState: newState };
        }
    }

    public async run(activity: Partial<Activity>, state?: PersistedState): Promise<DialogManagerResult> {
        // Initialize context object
        const adapter = new DialogManagerAdapter();
        const context = new TurnContext(adapter, activity);
        const result = await this.onTurn(context, state);
        result.activities = adapter.activities;
        return result;
    }


    //---------------------------------------------------------------------------------------------
    // State loading
    //---------------------------------------------------------------------------------------------

    static PersistedStateSnapshotKey = Symbol('PersistedStateSnapshot');

    static async loadState(storage: Storage, keys: PersistedStateKeys): Promise<PersistedState> {
        const data = await storage.read([keys.userState, keys.conversationState]);
        return {
            userState: data[keys.userState] || {},
            conversationState: data[keys.conversationState] || {}
        };
    }

    static async saveState(storage: Storage, keys: PersistedStateKeys, newState: PersistedState, oldState?: PersistedState, eTag?: string): Promise<void> {
        // Check for state changes
        let save = false;
        const changes: StoreItems = {};
        if (oldState) {
            if (JSON.stringify(newState.userState) != JSON.stringify(oldState.userState)) {
                if (eTag) { newState.userState.eTag = eTag }
                changes[keys.userState] = newState.userState;
                save = true;
            }
            if (JSON.stringify(newState.conversationState) != JSON.stringify(oldState.conversationState)) {
                if (eTag) { newState.conversationState.eTag = eTag }
                changes[keys.conversationState] = newState.conversationState;
                save = true;
            }
        } else {
            if (eTag) {
                newState.userState.eTag = eTag;
                newState.conversationState.eTag = eTag;
            }
            changes[keys.userState] = newState.userState;
            changes[keys.conversationState] = newState.conversationState;
            save = true;
        }

        // Save changes
        if (save) {
            await storage.write(changes);
        }
    }

    static getKeys(context: TurnContext): PersistedStateKeys {
        // Patch User ID if needed
        const activity = context.activity;
        const reference = TurnContext.getConversationReference(activity);
        if (!reference.user) { reference.user = {} as ChannelAccount }
        if (activity.type == ActivityTypes.ConversationUpdate) {
            const users = (activity.membersAdded || activity.membersRemoved || []).filter((u) => u.id != activity.recipient.id);
            const found = reference.user.id ? users.filter((u) => u.id == reference.user.id) : [];
            if (found.length == 0 && users.length > 0) {
                reference.user.id = users[0].id;
            }
        }

        // Return keys
        return DialogManager.getKeysForReference(reference);

    }

    static getKeysForReference(reference: Partial<ConversationReference>, namespace: string = ''): PersistedStateKeys {
        // Get channel, user, and conversation ID's
        const channelId: string = reference.channelId;
        let userId: string = reference.user && reference.user.id ? reference.user.id : undefined;
        const conversationId: string = reference.conversation && reference.conversation.id ? reference.conversation.id : undefined;

        // Verify ID's found
        if (!userId) { throw new Error(`DialogManager: unable to load/save the bots state. The users ID couldn't be found.`) }
        if (!conversationId) { throw new Error(`DialogManager: unable to load/save the bots state. The conversations ID couldn't be found.`) }

        // Return storage keys
        return {
            userState: `${channelId}/users/${userId}`,
            conversationState: `${channelId}/conversations/${conversationId}/${namespace}`
        };
    }
}