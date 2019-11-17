/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ConversationState, UserState, MemoryStorage, ConversationReference, ConversationAccount, ActivityTypes, TurnContext, Storage, Activity, ConversationIdentityType } from 'botbuilder-core';
import { DialogManager, Dialog, DialogStateManagerConfiguration, DialogTurnStatus, DialogTurnResult } from 'botbuilder-dialogs';
import { AdaptiveTestAdapter } from './adaptiveTestAdapter';

export class AdaptiveTest {
    private testRunning = false;
    private testEventHandled = false;
    private testResults: DialogTurnResult;
    private convoId = 0;

    public constructor(channelId = 'test', userId = 'user', botId = 'bot') {
        // Initialize conversation ref
        this.conversationReference = {
            channelId: channelId,
            serviceUrl: 'https://example.org/test',
            user: { id: userId, name: userId },
            bot: { id: botId, name: botId }
        };

        // Initialize state storage to use memory storage by default.
        this.stateStorage = new MemoryStorage();

        // Wire up users adapter
        // - Once the users dialog ends the test is complete.
        this.userAdapter = new AdaptiveTestAdapter(async (context) => {
            const results = await this.userDialogManager.onTurn(context);
            const finished = results.turnResult.status == DialogTurnStatus.complete || 
                             this.botAdapter.store.length == 0;
            if (finished) {
                // Was the test found?
                if (!this.testEventHandled) { throw new Error(`AdaptiveTest: test event not handled.`) }

                // Save test results for return by runTest()
                this.testResults = results.turnResult;

                // Signal test completion
                this.testRunning = false;
            } else {
                this.testEventHandled = true;
            }
        }, async (activity) => await this.botAdapter.store.queueActivity(activity));
        
        // Wire up bots adapter
        this.botAdapter = new AdaptiveTestAdapter(async (context) => {
            await this.botDialogManager.onTurn(context);
        }, async (activity) => await this.userAdapter.store.queueActivity(activity));
        
    }

    public async runTest(event: string, newConversation = true, locale = 'en-us'): Promise<DialogTurnResult> {
        // Ensure we're not running a test
        if (this.testRunning) { throw new Error(`AdaptiveTest: test already running.`) }

        try {
            // Initialize test state
            this.testRunning = true;
            this.testEventHandled = false;
            this.testResults = undefined;
            if (newConversation) { this.convoId++ }

            // Queue up initial test activity
            // - The user will be the recipient for this initial message.
            const convoId = `convo${this.convoId}`;
            const activity: Partial<Activity> = { type: ActivityTypes.Event, name: event };
            TurnContext.applyConversationReference(activity, this.conversationReference, false);
            activity.conversation = { id: convoId, name: convoId, isGroup: false } as ConversationAccount;
            activity.locale = locale;
            await this.userAdapter.store.queueActivity(activity, false);

            // Begin activity delivery pump
            while (this.testRunning) {
                // Deliver user activities
                await this.userAdapter.flushActivities();

                // Deliver bots activities
                await this.botAdapter.flushActivities();
                if (this.userAdapter.store.length == 0) {
                    // Bot didn't say anything so queue a 'silence' event
                    const activity = { type: ActivityTypes.Event, name: 'silence' };
                    TurnContext.applyConversationReference(activity, this.conversationReference, false);
                    await this.userAdapter.store.queueActivity(activity, false);
                }
            }

            return this.testResults;
        } finally {
            this.testRunning = false;
        }
    }

    public readonly conversationReference: Partial<ConversationReference>;

    public readonly userAdapter: AdaptiveTestAdapter;

    public readonly botAdapter: AdaptiveTestAdapter;

    public readonly userDialogManager = new DialogManager();
    public readonly botDialogManager = new DialogManager();

    public set userDialog(value: Dialog) {
        this.userDialogManager.rootDialog = value;
    }

    public get userDialog(): Dialog {
        return this.userDialogManager.rootDialog;
    }

    public set botDialog(value: Dialog) {
        this.botDialogManager.rootDialog = value;
    }

    public get botDialog(): Dialog {
        return this.botDialogManager.rootDialog;
    }

    public set stateConfiguration(value: DialogStateManagerConfiguration) {
        this.userDialogManager.stateConfiguration = value;
        this.botDialogManager.stateConfiguration = value;
    }

    public set stateStorage(value: Storage) {
        // Create new state objects that use passed in storage.
        // - We need to use 'namespaces' to separate the users conversation state
        //   from the bots.
        this.userDialogManager.conversationState = new ConversationState(value, 'user');
        this.userDialogManager.userState = new UserState(value, 'user');
        this.botDialogManager.conversationState = new ConversationState(value, 'bot');
        this.botDialogManager.userState = new UserState(value, 'bot');
    }

    static create(userDialog: Dialog, botDialog: Dialog, channelId?: string, userId?: string, botId?: string): AdaptiveTest {
        const test = new AdaptiveTest(channelId, userId, botId);
        test.userDialog = userDialog;
        test.botDialog = botDialog;
        return test;
    }
}

