/**
 * @module botbuilder-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable @typescript-eslint/ban-types */

import {
    Activity,
    TestAdapter,
    Middleware,
    ConversationState,
    MemoryStorage,
    AutoSaveStateMiddleware,
    TurnContext,
    StatePropertyAccessor,
} from 'botbuilder-core';

import { Dialog, DialogContext, DialogSet, DialogTurnStatus, DialogTurnResult, DialogState } from 'botbuilder-dialogs';

/**
 * A client for testing dialogs in isolation.
 */
export class DialogTestClient {
    private readonly _callback: (turnContext: TurnContext) => Promise<void>;
    private _dialogContext: DialogContext = null;
    private readonly _testAdapter: TestAdapter;

    /**
     * A DialogTurnResult instance with the result of the last turn.
     */
    public dialogTurnResult: DialogTurnResult;

    /**
     * A ConversationState instance for the current test client.
     */
    public conversationState: ConversationState;

    /**
     * Creates a [DialogTestClient](xref:botbuilder-testing.DialogTestClient) to test a [Dialog](xref:botbuilder-dialogs.Dialog) without having to create a full-fledged adapter.
     * ```javascript
     * let client = new DialogTestClient('test', MY_DIALOG, MY_OPTIONS);
     * let reply = await client.sendActivity('first message');
     * assert.strictEqual(reply.text, 'first reply', 'reply failed');
     * ```
     *
     * @param channelId The `channelId` to be used for the test.
     * Use 'emulator' or 'test' if you are uncertain of the channel you are targeting.
     * Otherwise, it is recommended that you use the id for the channel(s) your bot will be using and write a test case for each channel.
     * @param targetDialog The [Dialog](xref:botbuilder-dialogs.Dialog) to be tested. This will be the root dialog for the test client.
     * @param initialDialogOptions Optional. Additional argument(s) to pass to the [Dialog](xref:botbuilder-dialogs.Dialog) being started.
     * @param middlewares Optional. A [Middleware](xref:botbuilder-core.Middleware) list to be added to the test adapter.
     * @param conversationState Optional. A [ConversationState](xref:botbuilder-core.ConversationState) instance to use in the test client.
     */
    public constructor(
        channelId: string,
        targetDialog: Dialog,
        initialDialogOptions?: unknown,
        middlewares?: Middleware[],
        conversationState?: ConversationState
    );
    /**
     * Creates a [DialogTestClient](xref:botbuilder-testing.DialogTestClient) to test a [Dialog](xref:botbuilder-dialogs.Dialog) without having to create a full-fledged adapter.
     * ```javascript
     * let client = new DialogTestClient(MY_DIALOG, MY_OPTIONS);
     * let reply = await client.sendActivity('first message');
     * assert.strictEqual(reply.text, 'first reply', 'reply failed');
     * ```
     *
     * @param testAdapter The [TestAdapter](xref:botbuilder-core.TestAdapter) to use.
     * @param targetDialog The [Dialog](xref:botbuilder-dialogs.Dialog) to be tested. This will be the root dialog for the test client.
     * @param initialDialogOptions Optional. Additional argument(s) to pass to the [Dialog](xref:botbuilder-dialogs.Dialog) being started.
     * @param middlewares Optional. A [Middleware](xref:botbuilder-core.Middleware) list to be added to the test adapter.
     * @param conversationState Optional. A [ConversationState](xref:botbuilder-core.ConversationState) instance to use in the test client.
     */
    public constructor(
        testAdapter: TestAdapter,
        targetDialog: Dialog,
        initialDialogOptions?: unknown,
        middlewares?: Middleware[],
        conversationState?: ConversationState
    );
    /**
     * Creates a [DialogTestClient](xref:botbuilder-testing.DialogTestClient) to test a [Dialog](xref:botbuilder-dialogs.Dialog) without having to create a full-fledged adapter.
     *
     * @param channelOrAdapter The `channelId` or the [TestAdapter](xref:botbuilder-core.TestAdapter) to be used for the test.
     * @param targetDialog The [Dialog](xref:botbuilder-dialogs.Dialog) to be tested. This will be the root dialog for the test client.
     * @param initialDialogOptions Optional. Additional argument(s) to pass to the [Dialog](xref:botbuilder-dialogs.Dialog) being started.
     * @param middlewares Optional. A [Middleware](xref:botbuilder-core.Middleware) list to be added to the test adapter.
     * @param conversationState Optional. A [ConversationState](xref:botbuilder-core.ConversationState) instance to use in the test client.
     */
    public constructor(
        channelOrAdapter: string | TestAdapter,
        targetDialog: Dialog,
        initialDialogOptions?: object,
        middlewares?: Middleware[],
        conversationState?: ConversationState
    ) {
        this.conversationState = conversationState || new ConversationState(new MemoryStorage());

        const dialogState = this.conversationState.createProperty('DialogState');

        this._callback = this.getDefaultCallback(targetDialog, initialDialogOptions || null, dialogState);

        if (typeof channelOrAdapter == 'string') {
            const channelIdToUse: string = channelOrAdapter;
            this._testAdapter = new TestAdapter(this._callback, { channelId: channelIdToUse }).use(
                new AutoSaveStateMiddleware(this.conversationState)
            );
        } else {
            const testAdapterToUse: TestAdapter = channelOrAdapter;
            this._testAdapter = testAdapterToUse;
        }

        this.addUserMiddlewares(middlewares);
    }

    /**
     * Gets a reference for the DialogContext.
     *
     * @remarks
     * This property will be null until at least one activity is sent to DialogTestClient.
     *
     * @returns the dialog context
     */
    public get dialogContext(): DialogContext {
        return this._dialogContext;
    }

    /**
     * Send an activity into the dialog.
     *
     * ```javascript
     * await DialogTest.send('hello').assertReply('hello yourself').startTest();
     * ```
     *
     * @param activity an activity potentially with text
     * @returns a TestFlow that can be used to assert replies etc
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async sendActivity(activity: Partial<Activity> | string): Promise<any> {
        await this._testAdapter.receiveActivity(activity);
        return this._testAdapter.activityBuffer.shift();
    }

    /**
     * Get the next reply waiting to be delivered (if one exists)
     *
     * @returns the next reply
     */
    public getNextReply(): Partial<Activity> {
        return this._testAdapter.activityBuffer.shift();
    }

    private getDefaultCallback(
        targetDialog: Dialog,
        initialDialogOptions: object,
        dialogState: StatePropertyAccessor<DialogState>
    ): (turnContext: TurnContext) => Promise<void> {
        return async (turnContext: TurnContext): Promise<void> => {
            const dialogSet = new DialogSet(dialogState);
            dialogSet.add(targetDialog);

            this._dialogContext = await dialogSet.createContext(turnContext);
            this.dialogTurnResult = await this._dialogContext.continueDialog();
            if (this.dialogTurnResult.status === DialogTurnStatus.empty) {
                this.dialogTurnResult = await this._dialogContext.beginDialog(targetDialog.id, initialDialogOptions);
            }
        };
    }

    /**
     * @private
     */
    private addUserMiddlewares(middlewares: Middleware[]): void {
        if (middlewares != null) {
            middlewares.forEach((middleware): void => {
                this._testAdapter.use(middleware);
            });
        }
    }
}
