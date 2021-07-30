/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { LanguageGeneratorManager, languageGeneratorManagerKey } from 'botbuilder-dialogs-adaptive';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { getActiveDialogContext } from 'botbuilder-dialogs/lib/dialogHelper';

import {
    BotStateSet,
    ConversationState,
    ConversationStateKey,
    TurnContext,
    TurnContextStateCollection,
    UserState,
    UserStateKey,
} from 'botbuilder-core';

import {
    Dialog,
    DialogContext,
    DialogSet,
    DialogState,
    DialogStateManager,
    DialogStateManagerConfiguration,
} from 'botbuilder-dialogs';

export type DialogContextInspector = (dc: DialogContext) => void;

/**
 * Class for inspecting current dialog context.
 */
export class DialogInspector {
    private _rootDialogId: string;
    private readonly _dialogStateProperty: string;

    /**
     * Initializes a new instance of the `DialogInspector` class.
     *
     * @param {Dialog} rootDialog Root dialog to use.
     * @param {ResourceExplorer} resourceExplorer Resource explorer for expression access to .lg templates.
     * @param {string} dialogStateProperty Alternate name for the dialogState property. (Default is "DialogState").
     */
    public constructor(rootDialog?: Dialog, resourceExplorer?: ResourceExplorer, dialogStateProperty?: string) {
        if (!resourceExplorer) {
            // Add language generator for function access
            this.initialTurnState.set(languageGeneratorManagerKey, new LanguageGeneratorManager(resourceExplorer));
        }

        if (rootDialog) {
            this.rootDialog = rootDialog;
        }

        this._dialogStateProperty = dialogStateProperty ?? 'DialogState';
    }

    /**
     * Gets or sets the ConversationState.
     */
    public conversationState: ConversationState;

    /**
     * Gets or sets the UserState.
     */
    public userState: UserState;

    /**
     * Gets initialTurnState collection to copy into the turnState on every turn.
     */
    public readonly initialTurnState = new TurnContextStateCollection();

    /**
     * Gets root dialog to use to start conversation.
     *
     * @returns {Dialog} The root dialog.
     */
    public get rootDialog(): Dialog | undefined {
        if (this._rootDialogId) {
            return this.dialogs.find(this._rootDialogId);
        }
        return undefined;
    }

    /**
     * Sets root dialog to use to start conversation.
     *
     * @param {Dialog} dialog The root dialog.
     */
    public set rootDialog(dialog: Dialog | undefined) {
        this.dialogs = new DialogSet();
        if (dialog) {
            this._rootDialogId = dialog.id;
            this.dialogs.telemetryClient = dialog.telemetryClient;
            this.dialogs.add(dialog);
        } else {
            this._rootDialogId = undefined;
        }
    }

    /**
     * Gets or sets global dialogs that you want to have be callable.
     */
    public dialogs = new DialogSet();

    /**
     * Gets or sets the DialogStateManagerConfiguration.
     */
    public stateConfiguration: DialogStateManagerConfiguration;

    /**
     * Inspects a dialogs memory.
     *
     * @param {TurnContext} context Turn context.
     * @param {DialogContextInspector} inspector Inspector for analyzing/modifying dialog context.
     */
    public async inspect(context: TurnContext, inspector: DialogContextInspector): Promise<void> {
        // This class just lets you load & save memory in parallel
        const botStateSet = new BotStateSet();

        // Some of the memory scopes expect to find things like storage in the turn state
        this.initialTurnState.forEach((value, key) => {
            context.turnState.set(key, value);
        });

        // At a minimum you need ConversationState. UserState is optional.
        if (!this.conversationState) {
            this.conversationState = context.turnState.get(ConversationStateKey);
        } else {
            context.turnState.set(ConversationStateKey, this.conversationState);
        }

        if (!this.conversationState) {
            throw new Error(`The bot's 'conversationState' has not been configured.`);
        }
        botStateSet.add(this.conversationState);

        if (!this.userState) {
            this.userState = context.turnState.get(UserStateKey);
        } else {
            context.turnState.set(UserStateKey, this.userState);
        }

        if (this.userState) {
            botStateSet.add(this.userState);
        }

        // get dialog stack
        const dialogsProperty = this.conversationState.createProperty(this._dialogStateProperty);
        const dialogState: DialogState = await dialogsProperty.get(context, { dialogStack: [] });

        // create DialogContext
        const dc = new DialogContext(this.dialogs, context, dialogState);

        // promote initial turnState into dc.services for contextual services
        this.initialTurnState.forEach((value, key) => {
            dc.services.set(key, value);
        });

        // map TurnState into root dialog context.services
        context.turnState.forEach((value, key) => {
            dc.services.set(key, value);
        });

        // get the DialogStateManager configuration
        // - this configures all of the memory scopes and makes sure all of their memory has been loaded.
        const dialogStateManager = new DialogStateManager(dc, this.stateConfiguration);
        await dialogStateManager.loadAllScopes();

        // find the DC for the active dialog
        const activeDc = getActiveDialogContext(dc);

        inspector(activeDc);

        // save all state scopes to their respective botState locations.
        await dialogStateManager.saveAllChanges();
        await botStateSet.saveAllChanges(dc.context, false);
    }
}
