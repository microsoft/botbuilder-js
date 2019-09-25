/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { InvokeResponse } from './botFrameworkAdapter';

import {
    ActivityTypes,
    ActivityHandler,
    AppBasedLinkQuery,
    FileConsentCardResponse,
    MessagingExtensionAction,
    MessagingExtensionActionResponse,
    MessagingExtensionQuery,
    MessagingExtensionResponse,
    O365ConnectorCardActionQuery,
    SigninStateVerificationQuery,
    TaskModuleRequest,
    TaskModuleResponse,
    TurnContext
} from 'botbuilder-core';

export class TeamsActivityHandler extends ActivityHandler {

    /**
     * 
     * @param handler (context: TurnContext) => Promise<void>
     */
    public onInvokeActivity(handler: (context: TurnContext) => Promise<void>): this {
        this.checkRegisteredTeamsHandlers('InvokeActivity');
        return this.on('InvokeActivity', async (context, next) => {
            await handler(context);
        });
    }

    /**
     * Receives invoke activities with Activity name of 'fileConsent/invoke'. Handlers registered here run before
     * `onTeamsFileConsentAccept` and `onTeamsFileConsentDecline`.
     * Developers are not passed a pointer to the next `onTeamsFileConsent` handler because the _wrapper_ around
     * the handler will call `onDialogs` handlers after delegating to `onTeamsFileConsentAccept` or `onTeamsFileConsentDecline`.
     * @remarks
     * It is important that only ONE onTeamsFileConsent handler is registered, otherwise the handlers for
     * onTeamsFileConsentAccept and onTeamsFileConsentDecline will run more than once.
     * This method wraps the given handler and sends an InvokeResponse on behalf of the user.
     * @param handler (context: TurnContext, fileConsentCardResponse: FileConsentCardResponse) => Promise<void> 
     */
    public onTeamsFileConsent(
        handler: (context: TurnContext, fileConsentCardResponse: FileConsentCardResponse) => Promise<void>): this {
        this.checkRegisteredTeamsHandlers('TeamsFileConsent');
        return this.on('TeamsFileConsent', async (context, next) => {
            await handler(context, context.activity.value.action);
        });
    }

    /**
     * Receives invoke activities with Activity name of 'fileConsent/invoke' with confirmation from user
     * @remarks
     * This type of invoke activity occur during the File Consent flow.
     * @param handler (context: TurnContext, fileConsentCardResponse: FileConsentCardResponse) => Promise<void>
     */
    public onTeamsFileConsentAccept(
        handler: (context: TurnContext, fileConsentCardResponse: FileConsentCardResponse) => Promise<void>): this {
        this.checkRegisteredTeamsHandlers('TeamsFileConsentAccept');
        return this.on('TeamsFileConsentAccept', async (context, next) => {
            await handler(context, context.activity.value);
            await TeamsActivityHandler.sendInvokeResponse(context, TeamsActivityHandler.createInvokeResponse());
            await next();
        });
    }

    /**
     * Receives invoke activities with Activity name of 'fileConsent/invoke' with decline from user
     * @remarks
     * This type of invoke activity occur during the File Consent flow.
     * @param handler (context: TurnContext, fileConsentCardResponse: FileConsentCardResponse) => Promise<void>
     */
    public onTeamsFileConsentDecline(
        handler: (context: TurnContext, fileConsentCardResponse: FileConsentCardResponse) => Promise<void>): this {
        this.checkRegisteredTeamsHandlers('TeamsFileConsentDecline');
        return this.on('TeamsFileConsentDecline', async (context, next) => {
            await handler(context, context.activity.value);
            await TeamsActivityHandler.sendInvokeResponse(context, TeamsActivityHandler.createInvokeResponse());
            await next();
        });
    }

    /**
     * Receives invoke activities with Activity name of 'actionableMessage/executeAction'
     * @param handler (context: TurnContext, value: O365ConnectorCardActionQuery) => Promise<void>
     */
    public onTeamsO365ConnectorCardAction(
        handler: (context: TurnContext, query: O365ConnectorCardActionQuery) => Promise<void>): this {
        this.checkRegisteredTeamsHandlers('TeamsO365ConnectorCardAction');
        return this.on('TeamsO365ConnectorCardAction', async (context, next) => {
            await handler(context, context.activity.value);
            await TeamsActivityHandler.sendInvokeResponse(context, TeamsActivityHandler.createInvokeResponse());
            await next();
        });
    }

    /**
     * Receives invoke activities with Activity name of 'signin/verifyState'
     * @param handler (context: TurnContext, value: SigninStateVerificationQuery) => Promise<InvokeResponse>
     */
    public onTeamsSigninVerifyState(
        handler: (context: TurnContext, value: SigninStateVerificationQuery) => Promise<InvokeResponse>): this {
        this.checkRegisteredTeamsHandlers('TeamsSigninVerifyState');
        return this.on('TeamsSigninVerifyState', async (context, next) => {
            await handler(context, context.activity.value);
            await TeamsActivityHandler.sendInvokeResponse(context, TeamsActivityHandler.createInvokeResponse());
            await next();
        });
    }

    /**
     * Receives invoke activities with Activity name of 'task/fetch'
     * @param handler (context: TurnContext, value: TaskModuleRequest) => Promise<TaskModuleResponse>
     */
    public onTeamsTaskModuleFetch(
        handler: (context: TurnContext, value: TaskModuleRequest) => Promise<TaskModuleResponse>): this {
        this.checkRegisteredTeamsHandlers('TeamsTaskModuleFetch');
        return this.on('TeamsTaskModuleFetch', async (context, next) => {
            const taskModuleResponse: TaskModuleResponse = await handler(context, context.activity.value);
            const invokeResponse = TeamsActivityHandler.createInvokeResponse(taskModuleResponse);
            await TeamsActivityHandler.sendInvokeResponse(context, invokeResponse);
            await next();
        })
    }

    /**
     * Receives invoke activities with Activity name of 'task/submit'
     * @param handler (context: TurnContext, value: TaskModuleRequest) => Promise<TaskModuleResponse|undefined>
     */
    public onTeamsTaskModuleSubmit(
        handler: (context: TurnContext, value: TaskModuleRequest) => Promise<TaskModuleResponse | undefined>): this {
        this.checkRegisteredTeamsHandlers('TeamsTaskModuleSubmit');
        return this.on('TeamsTaskModuleSubmit', async (context, next) => {
            const taskModuleResponse: TaskModuleResponse = await handler(context, context.activity.value);
            const invokeResponse = TeamsActivityHandler.createInvokeResponse(taskModuleResponse);
            await TeamsActivityHandler.sendInvokeResponse(context, invokeResponse);
            await next();
        })
    }

    /**
     * Receives invoke activities with Activity name of 'composeExtension/queryLink'
     * @remarks
     * Used in creating a Search-based Message Extension.
     * @param handler (context: TurnContext, value: AppBasedLinkQuery) => Promise<MessagingExtensionResponse>
     */
    public onTeamsAppBasedLinkQuery(
        handler: (context: TurnContext, value: AppBasedLinkQuery) => Promise<MessagingExtensionResponse>): this {
        this.checkRegisteredTeamsHandlers('TeamsAppBasedLinkQuery');
        return this.on('TeamsAppBasedLinkQuery', async (context, next) => {
            const messagingExtensionResponse: MessagingExtensionResponse = await handler(context, context.activity.value);
            const invokeResponse = TeamsActivityHandler.createInvokeResponse(messagingExtensionResponse);
            await TeamsActivityHandler.sendInvokeResponse(context, invokeResponse);
            await next();
        })
    }

    /**
     * Receives invoke activities with the name 'composeExtension/query'.
     * @remarks
     * Used in creating a Search-based Message Extension.
     * @param handler (context: TurnContext, value: MessagingExtensionQuery) => Promise<MessagingExtensionResponse>
     */
    public onTeamsMessagingExtensionQuery(
        handler: (context: TurnContext, value: MessagingExtensionQuery) => Promise<MessagingExtensionResponse>): this {
        this.checkRegisteredTeamsHandlers('TeamsComposeExtension/Query');
        return this.on('TeamsComposeExtension/Query', async (context, next) => {
            const messagingExtensionResponse: MessagingExtensionResponse = await handler(context, context.activity.value);
            const invokeResponse = TeamsActivityHandler.createInvokeResponse(messagingExtensionResponse);
            await TeamsActivityHandler.sendInvokeResponse(context, invokeResponse);
            await next();
        });
    }

    /**
     * Receives invoke activities with the name 'composeExtension/selectItem'.
     * @remarks
     * Used in creating a Search-based Message Extension.
     * @param handler (context: TurnContext, value: MessagingExtensionQuery) => Promise<MessagingExtensionResponse>
     */
    public onTeamsMessagingExtensionSelectItem(
        handler: (context: TurnContext, value: MessagingExtensionQuery) => Promise<MessagingExtensionResponse>): this {
        this.checkRegisteredTeamsHandlers('TeamsComposeExtension/SelectItem');
        return this.on('TeamsComposeExtension/SelectItem', async (context, next) => {
            const messagingExtensionResponse: MessagingExtensionResponse = await handler(context, context.activity.value);
            const invokeResponse = TeamsActivityHandler.createInvokeResponse(messagingExtensionResponse);
            await TeamsActivityHandler.sendInvokeResponse(context, invokeResponse);
            await next();
        });
    }

    /**
     * Receives invoke activities with the name 'composeExtension/submitAction' and is called before the next appropriate handler is called.
     * @remarks
     * A handler registered through this method does not dispatch to the next handler (either `onTeamsMessagingExtensionSubmitAction`, `onTeamsBotMessagePreviewEdit`, or `onTeamsBotMessagePreviewSend`).
     * This method exists for developers to optionally add more logic before the TeamsActivityHandler routes the activity to one of the
     * previously mentioned handlers.
     * @param handler handler: (context: TurnContext, action: MessagingExtensionAction) => Promise<void>
     */
    public onTeamsMessagingExtensionSubmitActionDispatch(
        handler: (context: TurnContext, action: MessagingExtensionAction) => Promise<void>): this {
        this.checkRegisteredTeamsHandlers('TeamsComposeExtension/SubmitActionDispatch');
        return this.on('TeamsComposeExtension/SubmitActionDispatch', async (context, next) => {
            await handler(context, context.activity.value);
        });
    }

    /**
     * Receives invoke activities with the name 'composeExtension/submitAction'.
     * @remarks
     * This invoke activity is received when a user 
     * @param handler (context: TurnContext, value: MessagingExtensionAction) => Promise<MessagingExtensionActionResponse>
     */
    public onTeamsMessagingExtensionSubmitAction(
        handler: (context: TurnContext, value: MessagingExtensionAction) => Promise<MessagingExtensionActionResponse>): this {
        this.checkRegisteredTeamsHandlers('TeamsComposeExtension/SubmitAction');
        return this.on('TeamsComposeExtension/SubmitAction', async (context, next) => {
            const messagingExtensionActionResponse: MessagingExtensionActionResponse = await handler(context, context.activity.value);
            const invokeResponse = TeamsActivityHandler.createInvokeResponse(messagingExtensionActionResponse);
            await TeamsActivityHandler.sendInvokeResponse(context, invokeResponse);
            await next();
        });
    }

    /**
     * Receives invoke activities with the name 'composeExtension/submitAction' with the 'botMessagePreview' property present on activity.value.
     * The value for 'botMessagePreview' is 'edit'.
     * @remarks
     * This invoke activity is received when a user 
     * @param handler (context: TurnContext, value: MessagingExtensionAction) => Promise<MessagingExtensionActionResponse>
     */
    public onTeamsBotMessagePreviewEdit(
        handler: (context: TurnContext, value: MessagingExtensionAction) => Promise<MessagingExtensionActionResponse>): this {
        this.checkRegisteredTeamsHandlers('TeamsComposeExtension/SubmitAction/BotMessagePreviewEdit');
        return this.on('TeamsComposeExtension/SubmitAction/BotMessagePreviewEdit', async (context, next) => {
            const messagingExtensionActionResponse: MessagingExtensionActionResponse = await handler(context, context.activity.value);
            const invokeResponse = TeamsActivityHandler.createInvokeResponse(messagingExtensionActionResponse);
            await TeamsActivityHandler.sendInvokeResponse(context, invokeResponse);
            await next();
        });
    }

    /**
     * Receives invoke activities with the name 'composeExtension/submitAction' with the 'botMessagePreview' property present on activity.value.
     * The value for 'botMessagePreview' is 'send'.
     * @remarks
     * This invoke activity is received when a user 
     * @param handler (context: TurnContext, value: MessagingExtensionAction, next: () => Promise<void>) => Promise<MessagingExtensionActionResponse>
     */
    public onTeamsBotMessagePreviewSend(
        handler: (context: TurnContext, value: MessagingExtensionAction) => Promise<MessagingExtensionActionResponse>): this {
        this.checkRegisteredTeamsHandlers('TeamsomposeExtension/SubmitAction/BotMessagePreviewSend');
        return this.on('TeamsomposeExtension/SubmitAction/BotMessagePreviewSend', async (context, next) => {
            const messagingExtensionActionResponse: MessagingExtensionActionResponse = await handler(context, context.activity.value);
            const invokeResponse = TeamsActivityHandler.createInvokeResponse(messagingExtensionActionResponse);
            await TeamsActivityHandler.sendInvokeResponse(context, invokeResponse);
            await next();
        });
    }

    /**
     * Receives invoke activities with the name 'composeExtension/fetchTask' 
     * @param handler (context: TurnContext, value: MessagingExtensionAction) => Promise<MessagingExtensionResponse>
     */
    public onTeamsMessagingExtensionFetchTask(
        handler: (context: TurnContext, value: MessagingExtensionAction) => Promise<MessagingExtensionResponse>): this {
        this.checkRegisteredTeamsHandlers('TeamsComposeExtension/FetchTask');
        return this.on('TeamsComposeExtension/FetchTask', async (context, next) => {
            const messagingExtensionResponse: MessagingExtensionResponse = await handler(context, context.activity.value);
            const invokeResponse = TeamsActivityHandler.createInvokeResponse(messagingExtensionResponse);
            await TeamsActivityHandler.sendInvokeResponse(context, invokeResponse);
            await next();
        });
    };

    /**
     * Receives invoke activities with the name 'composeExtension/querySettingUrl' 
     * @param handler (context: TurnContext, value: MessagingExtensionAction) => Promise<MessagingExtensionResponse>
     */
    public onTeamsMessagingExtensionQuerySettingUrl(
        handler: (context: TurnContext, value: MessagingExtensionQuery) => Promise<MessagingExtensionResponse>): this {
        this.checkRegisteredTeamsHandlers('TeamsComposeExtension/QuerySettingUrl');
        return this.on('TeamsComposeExtension/QuerySettingUrl', async (context, next) => {
            const messagingExtensionResponse: MessagingExtensionResponse = await handler(context, context.activity.value);
            const invokeResponse = TeamsActivityHandler.createInvokeResponse(messagingExtensionResponse);
            await TeamsActivityHandler.sendInvokeResponse(context, invokeResponse);
            await next();
        });
    }

    /**
     * Receives invoke activities with the name 'composeExtension/setting' 
     * @param handler (context: TurnContext, value: MessagingExtensionQuery) => Promise<MessagingExtensionResponse>
     */
    public onTeamsMessagingExtensionQuerySetting(
        handler: (context: TurnContext, value: MessagingExtensionQuery) => Promise<MessagingExtensionResponse>): this {
        this.checkRegisteredTeamsHandlers('TeamsComposeExtension/Setting');
        return this.on('TeamsComposeExtension/Setting', async (context, next) => {
            const messagingExtensionResponse: MessagingExtensionResponse = await handler(context, context.activity.value);
            const invokeResponse = TeamsActivityHandler.createInvokeResponse(messagingExtensionResponse);
            await TeamsActivityHandler.sendInvokeResponse(context, invokeResponse);
            await next();
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
                    // The onInvokeActivity handler should not call `runDialogs`, it needs to let the
                    // typed-Invoke Activity handler call `runDialogs`.
                    await this.handle(context, 'Invoke', async () => { });
                    let invokeResponse: InvokeResponse;
                    switch (context.activity.name) {
                        case 'fileConsent/invoke':
                            await this.handle(context, 'TeamsFileConsent', async () => { });
                            switch (context.activity.value.action) {
                                case 'accept':
                                    await this.handle(context, 'TeamsFileConsentAccept', runDialogs);
                                    break;
                                case 'decline':
                                    await this.handle(context, 'TeamsFileConsentDecline', runDialogs);
                                    break;
                                default:
                                    return await TeamsActivityHandler.sendNotImplementedError(context);
                            }
                            await TeamsActivityHandler.sendNotImplementedError(context);
                            break;
                        case 'composeExtension/querySettingUrl':
                            await this.handle(context, 'TeamsComposeExtension/QuerySettingUrl', runDialogs);
                            break;
                        case 'composeExtension/setting':
                            await this.handle(context, 'TeamsComposeExtension/Setting', runDialogs);
                            break;
                        case 'composeExtension/query':
                            await this.handle(context, 'TeamsComposeExtension/Query', runDialogs);
                            break;
                        case 'composeExtension/selectItem':
                            await this.handle(context, 'TeamsComposeExtension/SelectItem', runDialogs);
                            break;
                        case 'composeExtension/submitAction':
                            await this.handle(context, 'TeamsComposeExtension/SubmitActionDispatch', async () => { });
                            if ((context.activity.value as MessagingExtensionAction).botMessagePreviewAction === 'edit') {
                                await this.handle(context, 'TeamsComposeExtension/SubmitAction/BotMessagePreviewEdit', runDialogs);
                            } else if ((context.activity.value as MessagingExtensionAction).botMessagePreviewAction === 'send') {
                                await this.handle(context, 'TeamsComposeExtension/SubmitAction/BotMessagePreviewSend', runDialogs);
                            } else {
                                await this.handle(context, 'TeamsComposeExtension/SubmitAction', runDialogs);
                            }
                            break;
                        case 'actionableMessage/executeAction':
                            await this.handle(context, 'TeamsO365ConnectorCardAction', runDialogs);
                            break;
                        case 'task/fetch':
                            await this.handle(context, 'TeamsTaskModuleFetch', runDialogs);
                            break;
                        case 'task/submit':
                            await this.handle(context, 'TeamsTaskModuleSubmit', runDialogs);
                            break;
                        case 'composeExtension/queryLink':
                            await this.handle(context, 'TeamsAppBasedLinkQuery', runDialogs);
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

    protected async handle(context: TurnContext, type: string, onNext: () => Promise<void>): Promise<any> {
        // MS Teams Invoke activities expect a response in 5 seconds. If no handlers are registered for the
        // Invoke activity received, the bot should send a NotImplemented HTTP status code.
        if (context.activity.type === ActivityTypes.Invoke && context.activity.channelId === 'msteams' &&
            (type !== 'InvokeActivity' && type !== 'TeamsFileConsent') && (!(type in this.handlers) || this.handlers[type].length < 1)) {
            return await TeamsActivityHandler.sendNotImplementedError(context);
        }
        return await super.handle(context, type, onNext);
    }

    /**
     * Used to verify that only one handler is registered for a specific event. Should be called when attempting
     * to register a handler.
     * @param eventName name of the event emitted
     */
    protected checkRegisteredTeamsHandlers(eventName: string) {
        if (eventName in this.handlers && this.handlers[eventName].length >= 1) {
            throw new Error(`Cannot register more than one handler for ${eventName}.`);
        }
    }

    private static async sendNotImplementedError(context: TurnContext) {
        context.sendActivity({ value: { status: 501 } as InvokeResponse, type: 'invokeResponse' });
    }

    private static createInvokeResponse(body?: any): InvokeResponse {
        return { status: 200, body };
    }

    /**
     * Helper method used to send an InvokeResponse from a wrapped Teams Handler.
     * @param context 
     * @param invokeResponse 
     */
    private static async sendInvokeResponse(context: TurnContext, invokeResponse: InvokeResponse): Promise<void> {
        await context.sendActivity({ value: invokeResponse, type: 'invokeResponse' });
    }
}