/**
 * @module botbuilder-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */


import { Activity, TestAdapter, Middleware, ConversationState, MemoryStorage, AutoSaveStateMiddleware, StatePropertyAccessor, TurnContext } from 'botbuilder-core';
import { Dialog, DialogSet, DialogTurnStatus, DialogTurnResult } from 'botbuilder-dialogs';

/**
 * A client for testing dialogs in isolation.
 */
export class DialogTestClient {

    private readonly _callback: (turnContext: TurnContext) => Promise<void>;
    private readonly _testAdapter: TestAdapter;
    public dialogTurnResult: DialogTurnResult;

    /**
     * Create a DialogTestClient to test a dialog without having to create a full-fledged adapter.
     * 
     * ```javascript
     * let client = new DialogTestClient(MY_DIALOG, MY_OPTIONS);
     * let reply = client.sendActivity('first message');
     * assert(reply.text == 'first reply','reply failed');
     * ```
     * 
     * @param targetDialog The dialog to be tested. This will be the root dialog for the test client.
     * @param initialDialogOptions (Optional) additional argument(s) to pass to the dialog being started.
     * @param middlewares (Optional) The test adapter to use. If this parameter is not provided, the test client will use a default TestAdapter
     * @param testAdapter (Optional) A list of middlewares to be added to the test adapter.
     * @param callback (Optional) The bot turn processing logic for the test. If this value is not provided, the test client will create a default BotCallbackHandler
     */
    constructor(targetDialog: Dialog, initialDialogOptions?: any, middlewares?: Middleware[], testAdapter?: TestAdapter, callback?: (turnContext: TurnContext) => Promise<void>) {
        let convoState = new ConversationState(new MemoryStorage());

        let dialogState = convoState.createProperty('DialogState');

        this._callback = callback || this.getDefaultCallback(targetDialog, initialDialogOptions || null, dialogState);

        this._testAdapter = testAdapter || new TestAdapter(this._callback).use(new AutoSaveStateMiddleware(convoState));

        this.addUserMiddlewares(middlewares);

    }

    /**
     * Send an activity into the dialog.
     * @returns a TestFlow that can be used to assert replies etc
     * @param activity an activity potentially with text
     * 
     * ```javascript
     * DialogTest.send('hello').assertReply('hello yourself').then(done);
     * ```
     */
    public async sendActivity(activity: Partial<Activity> | string): Promise<any> {
        await this._testAdapter.receiveActivity(activity);
        return this._testAdapter.activityBuffer.shift();
    }

    /**
     * Get the next reply waiting to be delivered (if one exists)
     */
    public async getNextReply(): Promise<any> {
        return this._testAdapter.activityBuffer.shift();
    }

    private getDefaultCallback(targetDialog: Dialog, initialDialogOptions: any, dialogState: StatePropertyAccessor) {

        return async(turnContext: TurnContext) => {

          const dialogSet = new DialogSet(dialogState);
          dialogSet.add(targetDialog);

          const dialogContext = await dialogSet.createContext(turnContext);
          this.dialogTurnResult = await dialogContext.continueDialog();
          if (this.dialogTurnResult.status === DialogTurnStatus.empty) {
              await dialogContext.beginDialog(targetDialog.id, initialDialogOptions);
          }
        }
    }

    private addUserMiddlewares(middlewares: Middleware[]): void {
        if (middlewares != null) {
            middlewares.forEach((middleware) => {
                this._testAdapter.use(middleware);
            });
        }
    }
    
}