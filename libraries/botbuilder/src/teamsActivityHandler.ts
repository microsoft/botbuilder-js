/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { InvokeResponse } from './botFrameworkAdapter';

import {
    Activity,
    ActivityTypes,
    ActivityHandler,
    TurnContext
} from 'botbuilder-core';

import {
    AppBasedLinkQuery,
    FileConsentCardResponse,
    MessagingExtensionAction,
    MessagingExtensionActionResponse,
    MessagingExtensionQuery,
    MessagingExtensionResponse,
    O365ConnectorCardActionQuery,
    SigninStateVerificationQuery,
    TaskModuleRequest,
    TaskModuleResponse
} from 'botbuilder-core';
import {
    InvokeResponseTyped
} from './teamsInvoke';

/**
 * InvokeActivityHandlers are used to handle Invoke Activities from the Microsoft Teams channel.
 * The handlers are wrapped in lambda, which will send the InvokeResponse to Teams if a handler returns an InvokeResponse.
 * ```javascript
 * const fileConsentHandler = async (context, next) => {
 *      // do something that returns an InvokeResponse
 *      // then `await next()` to continue processing
 *      const invokeResponse = await processFileConsent();
 *      await next();
 *      return invokeResponse;
 * }
 * 
 * bot.onAcceptFileConsent(fileConsentHandler);
 * ```
 */
export declare type InvokeActivityHandler = (context: TurnContext, next: () => Promise<void>) => Promise<InvokeResponse>;

export class TeamsActivityHandler extends ActivityHandler {


    /**
     * Receives invoke activities with Activity name of 'fileConsent/invoke'. Handlers registered here run before
     * `onTeamsFileConsentAccept` and `onTeamsFileConsentDecline`.
     * Developers are not passed a pointer to the next `onTeamsFileConsent` handler because the _wrapper_ around
     * the handler will call next on the developers behalf.
     * @remarks
     * It is important that only ONE onTeamsFileConsent handler is registered, otherwise the handlers for
     * onTeamsFileConsentAccept and onTeamsFileConsentDecline will run more than once.
     * This method wraps the given handler and sends an InvokeResponse on behalf of the user.
     * @param handler (context: TurnContext, fileConsentCardResponse: FileConsentCardResponse) => Promise<void> 
     */
    public onTeamsFileConsent(
        handler: (context: TurnContext, fileConsentCardResponse: FileConsentCardResponse) => Promise<void>
        ): this {
            return this.on('TeamsFileConsent', async (context, next) => {
                await handler(context, context.activity.value.action);
                if (context.activity.value.action === 'accept') {
                    await this.handle(context, 'TeamsFileConsentAccept', next);
                } else {
                    await this.handle(context, 'TeamsFileConsentDecline', next);
                }
                await TeamsActivityHandler.sendInvokeResponse(context, TeamsActivityHandler.createInvokeResponse());
        });
    }

    /**
     * Receives invoke activities with Activity name of 'fileConsent/invoke' with confirmation from user
     * @remarks
     * This type of invoke activity occur during the File Consent flow.
     * @param handler (context: TurnContext, value: FileConsentCardResponse, next: () => Promise<void>) => Promise<void>
     */
    public onTeamsFileConsentAccept(
        handler: (context: TurnContext, fileConsentCardResponse: FileConsentCardResponse, next: () => Promise<void>) => Promise<void>
    ): this {
        return this.on('TeamsFileConsentAccept', async (context, next) => {
            await handler(context, context.activity.value, next);
        });
    }

    /**
     * Receives invoke activities with Activity name of 'fileConsent/invoke' with decline from user
     * @remarks
     * This type of invoke activity occur during the File Consent flow.
     * @param handler (context: TurnContext, value: FileConsentCardResponse, next: () => Promise<void>) => Promise<void>
     */
    public onTeamsFileConsentDecline(
        handler: (context: TurnContext, fileConsentCardResponse: FileConsentCardResponse, next: () => Promise<void>) => Promise<void>
    ): this {
        return this.on('TeamsFileConsentDecline', async (context, next) => {
            await handler(context, context.activity.value, next);
        });
    }

    /**
     * Receives invoke activities with Activity name of 'actionableMessage/executeAction'
     * @param handler (context: TurnContext, value: O365ConnectorCardActionQuery, next: () => Promise<void>) => Promise<void>
     */
    public onTeamsO365ConnectorCardAction(
        handler: (context: TurnContext, query: O365ConnectorCardActionQuery, next: () => Promise<void>) => Promise<void>): this {
        return this.on('TeamsO365ConnectorCardAction', async (context, next) => {
            await handler(context, context.activity.value, next);
            await TeamsActivityHandler.sendInvokeResponse(context, TeamsActivityHandler.createInvokeResponse());
        });
    }

    /**
     * Receives invoke activities with Activity name of 'signin/verifyState'
     * @param handler (context: TurnContext, value: SigninStateVerificationQuery, next: () => Promise<void>) => Promise<InvokeResponse>
     */
    public onTeamsSigninVerifyState(
        handler: (context: TurnContext, value: SigninStateVerificationQuery, next: () => Promise<void>) => Promise<InvokeResponse>): this {
        return this.on('TeamsSigninVerifyState', async (context, next) => {
            const invokeResponse = await handler(context, context.activity.value, next);
            await TeamsActivityHandler.sendTeamsInvokeResponse(context, invokeResponse, 'onTeamsSigninVerifyState');
        });
    }

    /**
     * Receives invoke activities with Activity name of 'composeExtension/queryLink'
     * @remarks
     * Used in creating a Search-based Message Extension.
     * @param handler (context: TurnContext, value: AppBasedLinkQuery, next: () => Promise<void>) => Promise<InvokeResponseTyped<MessagingExtensionResponse>>
     */
    public onAppBasedLinkQuery(
        handler: (context: TurnContext, value: AppBasedLinkQuery, next: () => Promise<void>) => Promise<InvokeResponseTyped<MessagingExtensionResponse>>): this {
        return this.on('AppBasedLinkQuery', async (context, next) => {
            const invokeResponse = await handler(context, context.activity.value, next);
            await TeamsActivityHandler.sendTeamsTypedInvokeResponse(context, invokeResponse, 'onAppBasedLinkQuery');
        })
    }

    /**
     * Receives invoke activities with Activity name of 'task/fetch'
     * @param handler (context: TurnContext, value: TaskModuleRequest, next: () => Promise<void>) => Promise<InvokeResponseTyped<TaskModuleResponse>>
     */
    public onTaskModuleFetch(
        handler: (context: TurnContext, value: TaskModuleRequest, next: () => Promise<void>) => Promise<InvokeResponseTyped<TaskModuleResponse>>): this {
        return this.on('TaskModuleFetch', async (context, next) => {
            const invokeResponse = await handler(context, context.activity.value, next);
            await TeamsActivityHandler.sendTeamsTypedInvokeResponse(context, invokeResponse, 'onTaskModuleFetch');
        })
    }

    /**
     * Receives invoke activities with Activity name of 'task/submit'
     * @param handler (context: TurnContext, value: TaskModuleRequest, next: () => Promise<void>) => Promise<InvokeResponseTyped<TaskModuleResponse>>
     */
    public onTaskModuleSubmit(
        handler: (context: TurnContext, value: TaskModuleRequest, next: () => Promise<void>) => Promise<InvokeResponseTyped<TaskModuleResponse>>): this {
        return this.on('TaskModuleSubmit', async (context, next) => {
            const invokeResponse = await handler(context, context.activity.value, next);
            await TeamsActivityHandler.sendTeamsTypedInvokeResponse(context, invokeResponse, 'onTaskModuleFetch');
        })
    }

    /**
     * Receives invoke activities with the name 'composeExtension/query'.
     * @remarks
     * Used in creating a Search-based Message Extension.
     * @param handler (context: TurnContext, value: MessagingExtensionQuery, next: () => Promise<void>) => Promise<InvokeResponseTyped<MessagingExtensionResponse>>
     */
    public onMessagingExtensionQuery(
        handler: (context: TurnContext, value: MessagingExtensionQuery, next: () => Promise<void>) => Promise<InvokeResponseTyped<MessagingExtensionResponse>>): this {
        return this.on('ComposeExtension/Query', async (context, next) => {
            const invokeResponse = await handler(context, context.activity.value, next);
            await TeamsActivityHandler.sendTeamsTypedInvokeResponse(context, invokeResponse, 'onMessagingExtensionQuery');
        });
    }

    /**
     * Receives invoke activities with the name 'composeExtension/selectItem'.
     * @remarks
     * Used in creating a Search-based Message Extension.
     * @param handler (context: TurnContext, value: MessagingExtensionQuery, next: () => Promise<void>) => Promise<InvokeResponseTyped<MessagingExtensionResponse>>
     */
    public onSelectItem(
        handler: (context: TurnContext, value: MessagingExtensionQuery, next: () => Promise<void>) => Promise<InvokeResponseTyped<MessagingExtensionResponse>>): this {
        return this.on('ComposeExtension/SelectItem', async (context, next) => {
            const invokeResponse = await handler(context, context.activity.value, next);
            await TeamsActivityHandler.sendTeamsTypedInvokeResponse(context, invokeResponse, 'onSelectItem');
        });
    }

    /**
     * Receives invoke activities with the name 'composeExtension/submitAction'.
     * @remarks
     * This invoke activity is received when a user 
     * @param handler (context: TurnContext, value: MessagingExtensionAction, next: () => Promise<void>) => Promise<InvokeResponseTyped<MessagingExtensionActionResponse>>
     */
    public onMessagingExtensionSubmit(
        handler: (context: TurnContext, value: MessagingExtensionAction, next: () => Promise<void>) => Promise<InvokeResponseTyped<MessagingExtensionActionResponse>>): this {
        return this.on('ComposeExtension/SubmitAction', async (context, next) => {
            const invokeResponse = await handler(context, context.activity.value, next);
            await TeamsActivityHandler.sendTeamsTypedInvokeResponse(context, invokeResponse, 'onMessagingExtensionSubmit');
        });
    }

    /**
     * Receives invoke activities with the name 'composeExtension/submitAction' with the 'botMessagePreview' property present on activity.value.
     * The value for 'botMessagePreview' is 'edit'.
     * @remarks
     * This invoke activity is received when a user 
     * @param handler (context: TurnContext, value: MessagingExtensionAction, next: () => Promise<void>) => Promise<InvokeResponseTyped<MessagingExtensionActionResponse>>
     */
    public onBotMessagePreviewEdit(
        handler: (context: TurnContext, value: MessagingExtensionAction, next: () => Promise<void>) => Promise<InvokeResponseTyped<MessagingExtensionActionResponse>>): this {
        return this.on('ComposeExtension/SubmitAction/BotMessagePreviewEdit', async (context, next) => {
            const invokeResponse = await handler(context, context.activity.value, next);
            await TeamsActivityHandler.sendTeamsTypedInvokeResponse(context, invokeResponse, 'onBotMessagePreviewEdit');
        });
    }

    /**
     * Receives invoke activities with the name 'composeExtension/submitAction' with the 'botMessagePreview' property present on activity.value.
     * The value for 'botMessagePreview' is 'send'.
     * @remarks
     * This invoke activity is received when a user 
     * @param handler (context: TurnContext, value: MessagingExtensionAction, next: () => Promise<void>) => Promise<InvokeResponseTyped<MessagingExtensionActionResponse>>
     */
    public onBotMessagePreviewSend(
        handler: (context: TurnContext, value: MessagingExtensionAction, next: () => Promise<void>) => Promise<InvokeResponseTyped<MessagingExtensionActionResponse>>): this {
        return this.on('ComposeExtension/SubmitAction/BotMessagePreviewSend', async (context, next) => {
            const invokeResponse = await handler(context, context.activity.value, next);
            await TeamsActivityHandler.sendTeamsTypedInvokeResponse(context, invokeResponse, 'onBotMessagePreviewSend');
        });
    }

    /**
     * Receives invoke activities with the name 'composeExtension/fetchTask' 
     * @param handler (context: TurnContext, value: MessagingExtensionAction, next: () => Promise<void>) => Promise<InvokeResponseTyped<MessagingExtensionActionResponse>>
     */
    public onMessagingExtensionFetchTask(
        handler: (context: TurnContext, value: MessagingExtensionAction, next: () => Promise<void>) => Promise<InvokeResponseTyped<MessagingExtensionActionResponse>>): this {
        return this.on('ComposeExtension/FetchTask', async (context, next) => {
            const invokeResponse = await handler(context, context.activity.value, next);
            await TeamsActivityHandler.sendTeamsTypedInvokeResponse(context, invokeResponse, 'onMessagingExtensionFetchTask');
        });
    };

    /**
     * Receives invoke activities with the name 'composeExtension/querySettingUrl' 
     * @param handler (context: TurnContext, value: MessagingExtensionAction, next: () => Promise<void>) => Promise<InvokeResponseTyped<MessagingExtensionActionResponse>>
     */
    public onMessagingExtensionQuerySettingUrl(
        handler: (context: TurnContext, value: MessagingExtensionQuery, next: () => Promise<void>) => Promise<InvokeResponseTyped<MessagingExtensionResponse>>): this {
        return this.on('ComposeExtension/QuerySettingUrl', async (context, next) => {
            const invokeResponse = await handler(context, context.activity.value, next);
            await TeamsActivityHandler.sendTeamsTypedInvokeResponse(context, invokeResponse, 'onMessagingExtensionFetchTask');
        });
    }

    /**
     * Receives invoke activities with the name 'composeExtension/setting' 
     * @param handler (context: TurnContext, value: MessagingExtensionQuery, next: () => Promise<void>) => Promise<InvokeResponseTyped<MessagingExtensionActionResponse>>
     */
    public onMessagingExtensionQuerySetting(
        handler: (context: TurnContext, value: MessagingExtensionQuery, next: () => Promise<void>) => Promise<InvokeResponseTyped<MessagingExtensionResponse>>): this {
        return this.on('ComposeExtension/Setting', async (context, next) => {
            const invokeResponse = await handler(context, context.activity.value, next);
            await TeamsActivityHandler.sendTeamsTypedInvokeResponse(context, invokeResponse, 'onMessagingExtensionFetchTask');
        });
    }

    /**
 * `run()` is the main "activity handler" function used to ingest activities into the event emission process.
 * @remarks
 * Sample code:
 * ```javascript
 *  server.post('/api/messages', (req, res) => {
    *      adapter.processActivity(req, res, async (context) => {
    *          // Route to main dialog.
    *          await bot.run(context);
    *      });
    * });
    * ```
    *
    * @param context TurnContext A TurnContext representing an incoming Activity from an Adapter
    */
    public async run(context: TurnContext): Promise<void> {

        if (!context) {
            throw new Error(`Missing TurnContext parameter`);
        }

        if (!context.activity) {
            throw new Error(`TurnContext does not include an activity`);
        }

        if (!context.activity.type) {
            throw new Error(`Activity is missing it's type`);
        }

        // Allow the dialog system to be triggered at the end of the chain
        const runDialogs = async (): Promise<void> => {
            await this.handle(context, 'Dialog', async () => {
                // noop
            });
        };

        // List of all Activity Types:
        // https://github.com/Microsoft/botbuilder-js/blob/master/libraries/botframework-schema/src/index.ts#L1627
        await this.handle(context, 'Turn', async () => {
            switch (context.activity.type) {
                case ActivityTypes.Message:
                    await this.handle(context, 'Message', runDialogs);
                    break;
                case ActivityTypes.ConversationUpdate:
                    await this.handle(context, 'ConversationUpdate', async () => {
                        if (context.activity.membersAdded && context.activity.membersAdded.length > 0) {
                            await this.handle(context, 'MembersAdded', runDialogs);
                        } else if (context.activity.membersRemoved && context.activity.membersRemoved.length > 0) {
                            await this.handle(context, 'MembersRemoved', runDialogs);
                        } else {
                            await runDialogs();
                        }
                    });
                    break;
                case ActivityTypes.MessageReaction:
                    await this.handle(context, 'MessageReaction', async () => {
                        if (context.activity.reactionsAdded && context.activity.reactionsAdded.length > 0) {
                            await this.handle(context, 'ReactionsAdded', runDialogs);
                        } else if (context.activity.reactionsRemoved && context.activity.reactionsRemoved.length > 0) {
                            await this.handle(context, 'ReactionsRemoved', runDialogs);
                        } else {
                            await runDialogs();
                        }
                    });
                    break;
                case ActivityTypes.Event:
                    await this.handle(context, 'Event', async () => {
                        if (context.activity.name === 'tokens/response') {
                            await this.handle(context, 'TokenResponseEvent', runDialogs);
                        } else {
                            await runDialogs();
                        }
                    });
                    break;
                case ActivityTypes.Invoke:
                    let invokeResponse: InvokeResponse;
                    switch (context.activity.name) {
                        case 'fileConsent/invoke':
                            invokeResponse = await this.handle(context, 'TeamsFileConsent', runDialogs);
                            break;
                        case 'composeExtension/querySettingUrl':
                            await this.handle(context, 'ComposeExtension/QuerySettingUrl', runDialogs);
                            break;
                        case 'composeExtension/setting':
                            await this.handle(context, 'ComposeExtension/Setting', runDialogs);
                            break;
                        case 'composeExtension/query':
                            await this.handle(context, 'ComposeExtension/Query', runDialogs);
                            break;
                        case 'composeExtension/selectItem':
                            await this.handle(context, 'ComposeExtension/SelectItem', runDialogs);
                            break;
                        case 'composeExtension/submitAction':
                            if ((context.activity.value as MessagingExtensionAction).botMessagePreviewAction === 'edit') {
                                await this.handle(context, 'ComposeExtension/SubmitAction/BotMessagePreviewEdit', runDialogs);
                            } else if ((context.activity.value as MessagingExtensionAction).botMessagePreviewAction === 'send') {
                                await this.handle(context, 'ComposeExtension/SubmitAction/BotMessagePreviewSend', runDialogs);
                            } else {
                                await this.handle(context, 'ComposeExtension/SubmitAction', runDialogs);
                            }
                            break;
                        case 'actionableMessage/executeAction':
                            await this.handle(context, 'TeamsO365ConnectorCardAction', runDialogs);
                            break;
                        case 'task/fetch':
                            await this.handle(context, 'TaskModuleFetch', runDialogs);
                            break;
                        case 'task/submit':
                            await this.handle(context, 'TaskModuleSubmit', runDialogs);
                            break;
                        case 'composeExtension/queryLink':
                            await this.handle(context, 'AppBasedLinkQuery', runDialogs);
                            break;
                        case 'composeExtension/fetchTask':
                            await this.handle(context, 'ComposeExtension/FetchTask', runDialogs);
                            break;
                        case 'signin/verifyState':
                            await this.handle(context, 'TeamsSigninVerifyState', runDialogs);
                            break;
                        default:
                            // Correct behavior to be determined.
                            return await runDialogs();
                    }
                    if (invokeResponse) {
                        await context.sendActivity({ value: invokeResponse, type: 'invokeResponse' });
                    }
                    break;
                default:
                    // handler for unknown or unhandled types
                    await this.handle(context, 'UnrecognizedActivityType', runDialogs);
                    break;
            }
        });
    }

    /**
     * Private method that sends the InvokeResponse from InvokeActivityHandlers
     * @param handler 
     * @param context 
     * @param next 
     */
    protected static async teamsInvokeWrapper(handler: InvokeActivityHandler, handlerName: string, context: TurnContext, next: () => Promise<void>): Promise<void> {
        const invokeResponse = await handler(context, next);
        if (invokeResponse) {
            await context.sendActivity({ value: invokeResponse, type: 'invokeResponse' });
        } else {
            throw new Error(`TeamsActivityHandler.teamsInvokeWrapper(): InvokeResponse not returned from "${handlerName}" handler.`);
        }
    }

    /**
     * Private helper method to send TypedInvokeResponses for Teams, or throw an error for a handler that does not return an InvokeResponse.
     * @param context TurnContext
     * @param invokeResponse InvokeResponse
     * @param handlerType string 
     */
    private static async sendTeamsTypedInvokeResponse<T>(context: TurnContext, invokeResponse: InvokeResponseTyped<T>, handlerType: string) {
        if (invokeResponse) {
            await context.sendActivity({ value: invokeResponse, type: 'invokeResponse' });
        } else {
            throw new Error(`TeamsActivityHandler.teamsInvokeWrapper(): InvokeResponse not returned from "${handlerType}" handler.`);
        }
    }

    /**
     * Private helper method to send InvokeResponses for Teams, or throw an error for a handler that does not return an InvokeResponse.
     * @param context TurnContext
     * @param invokeResponse InvokeResponse
     * @param handlerType string 
     */
    private static async sendTeamsInvokeResponse(context: TurnContext, invokeResponse: InvokeResponse, handlerType: string) {
        if (invokeResponse) {
            await context.sendActivity({ value: invokeResponse, type: 'invokeResponse' });
        } else {
            throw new Error(`TeamsActivityHandler.teamsInvokeWrapper(): InvokeResponse not returned from "${handlerType}" handler.`);
        }
    }

    private static createInvokeResponse(body?: any): InvokeResponse {
        return { status: 200, body };
    }

    /**
     * Temporary Helper method
     * @param context 
     * @param invokeResponse 
     */
    private static async sendInvokeResponse(context: TurnContext, invokeResponse: InvokeResponse): Promise<void> {
        await context.sendActivity({ value: invokeResponse, type: 'invokeResponse' });
    }
}