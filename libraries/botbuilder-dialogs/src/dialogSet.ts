/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    BotTelemetryClient,
    StatePropertyAccessor,
    TurnContext,
    StringUtils,
    NullTelemetryClient,
} from 'botbuilder-core';

import { Dialog } from './dialog';
import { DialogContext, DialogState } from './dialogContext';

export interface DialogDependencies {
    /**
     * Returns a dialogs child dialog dependencies so they can be added to a containers dialog set.
     */
    getDependencies(): Dialog[];
}

/**
 * A related set of dialogs that can all call each other.
 *
 * @remarks
 * The constructor for the dialog set should be passed a state property that will be used to
 * persist the dialog stack for the set:
 *
 * ```JavaScript
 * const { ConversationState, MemoryStorage, ActivityTypes } = require('botbuilder');
 * const { DialogSet, Dialog, DialogTurnStatus } = require('botbuilder-dialogs');
 *
 * const convoState = new ConversationState(new MemoryStorage());
 * const dialogState = convoState.createProperty('dialogState');
 * const dialogs = new DialogSet(dialogState);
 * ```
 *
 * The bot can add dialogs or prompts to the set using the [add()](#add) method:
 *
 * ```JavaScript
 * class GreetingDialog extends Dialog {
 *     async beginDialog(dc, options) {
 *         await dc.context.sendActivity(`Hi! I'm a bot.`);
 *         return await dc.endDialog();
 *     }
 * }
 *
 * dialogs.add(new GreetingDialog('greeting'));
 * ```
 *
 * To interact with the sets dialogs you can call [createContext()](#createcontext) with the
 * current `TurnContext`. That will create a `DialogContext` that can be used to start or continue
 * execution of the sets dialogs:
 *
 * ```JavaScript
 * // Create DialogContext for the current turn
 * const dc = await dialogs.createContext(turnContext);
 *
 * // Try to continue executing an active multi-turn dialog
 * const result = await dc.continueDialog();
 *
 * // Send greeting if no other dialogs active
 * if (result.status == DialogTurnStatus.empty && dc.context.activity.type == ActivityTypes.Message) {
 *     await dc.beginDialog('greeting');
 * }
 * ```
 */
export class DialogSet {
    private readonly dialogs: { [id: string]: Dialog } = {};
    private readonly dialogState: StatePropertyAccessor<DialogState>;
    private _telemetryClient: BotTelemetryClient;
    private _version: string;

    /**
     * Creates a new DialogSet instance.
     *
     * @remarks
     * If the `dialogState` property is not passed in, calls to [createContext()](#createcontext)
     * will return an error.  You will need to create a `DialogContext` for the set manually and
     * pass in your own state object for persisting the sets dialog stack:
     *
     * ```JavaScript
     * const dc = new DialogContext(dialogs, turnContext, state);
     * ```
     * @param dialogState (Optional) state property used to persist the sets dialog stack.
     */
    public constructor(dialogState?: StatePropertyAccessor<DialogState>) {
        this.dialogState = dialogState;
    }

    /**
     * Returns a 32-bit hash of the all the `Dialog.version` values in the set.
     *
     * @remarks
     * This hash is persisted to state storage and used to detect changes to a dialog set.
     */
    public getVersion(): string {
        if (!this._version) {
            let versions = '';
            for (const id in this.dialogs) {
                const v = this.dialogs[id].getVersion();
                if (v) {
                    versions += `|${v}`;
                }
            }
            this._version = StringUtils.hash(versions);
        }

        return this._version;
    }

    /**
     * Adds a new dialog or prompt to the set.
     *
     * @remarks
     * If the `Dialog.id` being added already exists in the set, the dialogs id will be updated to
     * include a suffix which makes it unique. So adding 2 dialogs named "duplicate" to the set
     * would result in the first one having an id of "duplicate" and the second one having an id
     * of "duplicate2".
     * @param dialog The dialog or prompt to add.
     * If a telemetryClient is present on the dialog set, it will be added to each dialog.
     */
    public add<T extends Dialog>(dialog: T): this {
        if (!(dialog instanceof Dialog)) {
            throw new Error(`DialogSet.add(): Invalid dialog being added.`);
        }

        // Ensure new version hash is computed
        this._version = undefined;

        // Ensure dialogs ID is unique.
        if (this.dialogs.hasOwnProperty(dialog.id)) {
            // If we are trying to add the same exact instance, it's not a name collision.
            // No operation required since the instance is already in the dialog set.
            if (this.dialogs[dialog.id] === dialog) {
                return this;
            }

            // If we are adding a new dialog with a conflicting name, add a suffix to avoid
            // dialog name collisions.
            let nextSuffix = 2;
            while (true) {
                const suffixId = dialog.id + nextSuffix.toString();
                if (!this.dialogs.hasOwnProperty(suffixId)) {
                    dialog.id = suffixId;
                    break;
                } else {
                    nextSuffix++;
                }
            }
        }

        // If a telemetry client has already been set on this dialogSet, also set it on new dialogs as they are added.
        if (this._telemetryClient) {
            dialog.telemetryClient = this._telemetryClient;
        }

        // Save dialog reference
        this.dialogs[dialog.id] = dialog;

        // Automatically add any child dependencies the dialog might have
        if (typeof ((dialog as any) as DialogDependencies).getDependencies == 'function') {
            ((dialog as any) as DialogDependencies).getDependencies().forEach((child: Dialog): void => {
                this.add(child);
            });
        }

        return this;
    }

    /**
     * Creates a dialog context which can be used to work with the dialogs in the set.
     * @param context Context for the current turn of conversation with the user.
     */
    public async createContext(context: TurnContext): Promise<DialogContext> {
        if (!this.dialogState) {
            throw new Error(
                `DialogSet.createContext(): the dialog set was not bound to a stateProperty when constructed.`
            );
        }
        const state: DialogState = await this.dialogState.get(context, { dialogStack: [] } as DialogState);

        return new DialogContext(this, context, state);
    }

    /**
     * Finds a dialog that was previously added to the set using [add()](#add).
     *
     * @remarks
     * This example finds a dialog named "greeting":
     *
     * ```JavaScript
     * const dialog = dialogs.find('greeting');
     * ```
     * @param dialogId ID of the dialog or prompt to lookup.
     */
    public find(dialogId: string): Dialog | undefined {
        return this.dialogs.hasOwnProperty(dialogId) ? this.dialogs[dialogId] : undefined;
    }

    /**
     * Set the telemetry client for this dialog set and apply it to all current dialogs.
     */
    public get telemetryClient(): BotTelemetryClient {
        return this._telemetryClient;
    }

    /**
     * Set the telemetry client for this dialog set and apply it to all current dialogs.
     * Future dialogs added to the set will also inherit this client.
     */
    public set telemetryClient(client: BotTelemetryClient) {
        this._telemetryClient = client ?? new NullTelemetryClient();
        Object.values(this.dialogs).forEach((dialog) => (dialog.telemetryClient = this._telemetryClient));
    }

    /**
     * Gets the Dialogs of the set.
     *
     * @returns {Dialog} An array of [Dialog](xref:botbuilder-dialogs.Dialog).
     */
    public getDialogs(): Dialog[] {
        return Object.values(this.dialogs);
    }
}
