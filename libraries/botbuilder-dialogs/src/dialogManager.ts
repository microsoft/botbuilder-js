/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext, BotState, ConversationState, UserState, ActivityTypes, BotStateSet, TurnContextStateCollection, Activity } from 'botbuilder-core';
import { DialogContext, DialogState } from './dialogContext';
import { DialogTurnResult, Dialog, DialogTurnStatus } from './dialog';
import { Configurable } from './configurable';
import { DialogSet } from './dialogSet';
import { DialogStateManagerConfiguration, DialogStateManager } from './memory';
import { DialogEvents } from './dialogEvents';
import { DialogTurnStateConstants } from './dialogTurnStateConstants';
import { isSkillClaim } from './prompts/skillsHelpers';
import { isFromParentToSkill, getActiveDialogContext, shouldSendEndOfConversationToParent } from './dialogHelper';

const LAST_ACCESS = '_lastAccess';
const CONVERSATION_STATE = 'ConversationState';
const USER_STATE = 'UserState';

export interface DialogManagerResult {
    turnResult: DialogTurnResult;
}

export interface DialogManagerConfiguration {
    /**
     * State property used to persist the bots dialog stack.
     */
    conversationState: BotState;

    /**
     * Root dialog to start from [onTurn()](#onturn) method.
     */
    rootDialog: Dialog;

    /**
     * Optional. Bots persisted user state.
     */
    userState?: UserState;

    /**
     * Optional. Number of milliseconds to expire the bots conversation state after.
     */
    expireAfter?: number;

    /**
     * Optional. Path resolvers and memory scopes used for conversations with the bot.
     */
    stateConfiguration?: DialogStateManagerConfiguration;
}

/**
 * Class which runs the dialog system.
 */
export class DialogManager extends Configurable {
    private _rootDialogId: string;
    private readonly _dialogStateProperty: string;
    private readonly _initialTurnState: TurnContextStateCollection = new TurnContextStateCollection();

    /**
     * Creates an instance of the DialogManager class.
     * 
     * @param rootDialog Optional, root dialog to use.
     * @param dialogStateProperty Optional, alternate name for the dialogState property. (Default is "DialogStateProperty")
     */
    public constructor(rootDialog?: Dialog, dialogStateProperty?: string) {
        super();
        if (rootDialog) { this.rootDialog = rootDialog; }
        this._dialogStateProperty = dialogStateProperty || 'DialogStateProperty';
        this._initialTurnState.set(DialogTurnStateConstants.dialogManager, this);
    }

    /**
     * Bots persisted conversation state.
     */
    public conversationState: ConversationState;

    /**
     * Optional. Bots persisted user state.
     */
    public userState?: UserState;

    /**
     * Values that will be copied to the `TurnContext.turnState` at the beginning of each turn.
     */
    public get initialTurnState(): TurnContextStateCollection {
        return this._initialTurnState;
    }

    /**
     * Root dialog to start from [onTurn()](#onturn) method.
     */
    public set rootDialog(value: Dialog) {
        this.dialogs = new DialogSet();
        if (value) {
            this._rootDialogId = value.id;
            this.dialogs.telemetryClient = value.telemetryClient;
            this.dialogs.add(value);
        } else {
            this._rootDialogId = undefined;
        }
    }

    /**
     * Gets the root dialog ID.
     * 
     * @returns The root dialog ID.
     */
    public get rootDialog(): Dialog {
        return this._rootDialogId ? this.dialogs.find(this._rootDialogId) : undefined;
    }

    /**
     * Global dialogs that you want to have be callable.
     */
    public dialogs: DialogSet = new DialogSet();

    /**
     * Optional. Path resolvers and memory scopes used for conversations with the bot.
     */
    public stateConfiguration?: DialogStateManagerConfiguration;

    /**
     * Optional. Number of milliseconds to expire the bots conversation state after.
     */
    public expireAfter?: number;

    /**
     * Set configuration settings.
     * 
     * @param config Configuration settings to apply.
     * @returns The cofigured dialogManager context.
     */
    public configure(config: Partial<DialogManagerConfiguration>): this {
        return super.configure(config);
    }

    /**
     * Runs dialog system in the context of an ITurnContext.
     * 
     * @param context Context for the current turn of conversation with the user.
     * @returns Result of the running the logic against the activity.
     */
    public async onTurn(context: TurnContext): Promise<DialogManagerResult> {
        // Ensure properly configured
        if (!this._rootDialogId) { throw new Error(`DialogManager.onTurn: the bot's 'rootDialog' has not been configured.`); }

        // Copy initial turn state to context
        this.initialTurnState.forEach((value, key): void => {
            context.turnState.set(key, value);
        });

        const botStateSet = new BotStateSet();

        if (!this.conversationState) {
            this.conversationState = context.turnState.get(CONVERSATION_STATE);
        } else {
            context.turnState.set(CONVERSATION_STATE, this.conversationState);
        }

        if (!this.conversationState) {
            throw new Error(`DialogManager.onTurn: the bot's 'conversationState' has not been configured.`);
        }
        botStateSet.add(this.conversationState);

        if (!this.userState) {
            this.userState = context.turnState.get(USER_STATE);
        } else {
            context.turnState.set(USER_STATE, this.userState);
        }

        if (this.userState) {
            botStateSet.add(this.userState);
        }

        // Get last access
        const lastAccessProperty = this.conversationState.createProperty(LAST_ACCESS);
        const lastAccess = new Date(await lastAccessProperty.get(context, new Date().toISOString()));

        // Check for expired conversation
        const now = new Date();
        if (this.expireAfter != undefined && (now.getTime() - lastAccess.getTime()) >= this.expireAfter) {
            // Clear conversation state
            await this.conversationState.clear(context);
        }

        // Update last access time
        await lastAccessProperty.set(context, lastAccess.toISOString());

        // get dialog stack 
        const dialogsProperty = this.conversationState.createProperty(this._dialogStateProperty);
        const dialogState: DialogState = await dialogsProperty.get(context, {});

        // Create DialogContext
        const dc = new DialogContext(this.dialogs, context, dialogState);

        // promote initial TurnState into dc.services for contextual services
        this._initialTurnState.forEach((value, key): void => {
            dc.services.set(key, value);
        });

        // map TurnState into root dialog context.services
        context.turnState.forEach((value, key): void => {
            dc.services.set(key, value);
        });

        // Configure dialog state manager and load scopes
        const dialogStateManager = new DialogStateManager(dc, this.stateConfiguration);
        await dialogStateManager.loadAllScopes();

        let turnResult: DialogTurnResult;
        /**
         * Loop as long as we are getting valid onError handled we should continue executing the actions for the turn.
         * NOTE: We loop around this block because each pass through we either complete the turn and break out of the loop
         * or we have had an exception AND there was an onError action which captured the error. We need to continue the
         * turn based on the actions the onError handler introduced.
         */
        let endOfTurn = false;
        while (!endOfTurn) {
            try {
                const claimIdentity = context.turnState.get(context.adapter.BotIdentityKey);
                if (claimIdentity && isSkillClaim(claimIdentity.claims)) {
                    // The bot is running as a skill.
                    turnResult = await this.handleSkillOnTurn(dc);
                } else {
                    // The bot is running as a root bot.
                    turnResult = await this.handleBotOnTurn(dc);
                }

                // turn successfully completed, break the loop
                endOfTurn = true;
            } catch (err) {
                const handled = await dc.emitEvent(DialogEvents.error, err, true, true);
                if (!handled) {
                    throw err;
                }
            }
        }

        // Save any memory changes
        await dialogStateManager.saveAllChanges();

        // Save BotState changes
        await botStateSet.saveAllChanges(dc.context, false);

        return { turnResult: turnResult };
    }

    /**
     * Helper to send a trace activity with a memory snapshot of the active dialog DC.
     * 
     * @param dc Context for the current turn of conversation with the user.
     * @param traceLabel Trace label to set for the activity.
     */
    private async sendStateSnapshotTrace(dc: DialogContext, traceLabel: string): Promise<void> {
        // send trace of memory
        const snapshot: object = getActiveDialogContext(dc).state.getMemorySnapshot();
        await dc.context.sendActivity({
            type: ActivityTypes.Trace,
            name: 'BotState',
            valueType: 'https://www.botframework.com/schemas/botState',
            value: snapshot,
            label: traceLabel
        });
    }

    /**
     * @private
     * 
     * @param dc Context for the current turn of conversation with the user.
     * @returns A Promise representing the asynchronous operation.
     */
    private async handleSkillOnTurn(dc: DialogContext): Promise<DialogTurnResult> {
        // The bot is running as a skill.
        const turnContext = dc.context;

        // Process remote cancellation.
        if (turnContext.activity.type === ActivityTypes.EndOfConversation && dc.activeDialog && isFromParentToSkill(turnContext)) {
            // Handle remote cancellation request from parent.
            const activeDialogContext = getActiveDialogContext(dc);

            const remoteCancelText = 'Skill was canceled through an EndOfConversation activity from the parent.';
            await turnContext.sendTraceActivity(`DialogManager.onTurn()`, undefined, undefined, remoteCancelText);

            // Send cancellation message to the top dialog in the stack to ensure all the parents are canceled in the right order. 
            return await activeDialogContext.cancelAllDialogs(true);
        }

        // Handle reprompt
        // Process a reprompt event sent from the parent.
        if (turnContext.activity.type === ActivityTypes.Event && turnContext.activity.name == DialogEvents.repromptDialog) {
            if (!dc.activeDialog) {
                return { status: DialogTurnStatus.empty };
            }

            await dc.repromptDialog();
            return { status: DialogTurnStatus.waiting };
        }

        // Continue execution
        // - This will apply any queued up interruptions and execute the current/next step(s).
        var turnResult = await dc.continueDialog();
        if (turnResult.status == DialogTurnStatus.empty) {
            // restart root dialog
            var startMessageText = `Starting ${ this._rootDialogId }.`;
            await turnContext.sendTraceActivity('DialogManager.onTurn()', undefined, undefined, startMessageText);
            turnResult = await dc.beginDialog(this._rootDialogId);
        }

        await this.sendStateSnapshotTrace(dc, 'Skill State');

        if (shouldSendEndOfConversationToParent(turnContext, turnResult)) {
            var endMessageText = `Dialog ${ this._rootDialogId } has **completed**. Sending EndOfConversation.`;
            await turnContext.sendTraceActivity('DialogManager.onTurn()', turnResult.result, undefined, endMessageText);

            // Send End of conversation at the end.
            const activity: Partial<Activity> = { type: ActivityTypes.EndOfConversation, value: turnResult.result, locale: turnContext.activity.locale };
            await turnContext.sendActivity(activity);
        }

        return turnResult;
    }

    /**
     * @private
     * 
     * @param dc Context for the current turn of conversation with the user.
     * @returns The DialogTurnResult.
     */
    private async handleBotOnTurn(dc: DialogContext): Promise<DialogTurnResult> {
        let turnResult: DialogTurnResult;

        // the bot is running as a root bot. 
        if (!dc.activeDialog) {
            // start root dialog
            turnResult = await dc.beginDialog(this._rootDialogId);
        } else {
            // Continue execution
            // - This will apply any queued up interruptions and execute the current/next step(s).
            turnResult = await dc.continueDialog();

            if (turnResult.status == DialogTurnStatus.empty) {
                // restart root dialog
                turnResult = await dc.beginDialog(this._rootDialogId);
            }
        }

        await this.sendStateSnapshotTrace(dc, 'Bot State');

        return turnResult;
    }
}
