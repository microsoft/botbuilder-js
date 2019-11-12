/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { InvokeResponse, INVOKE_RESPONSE_KEY } from './botFrameworkAdapter';

import {
    ActivityHandler,
    ActivityTypes,
    AppBasedLinkQuery,
    ChannelAccount,
    ChannelInfo,
    FileConsentCardResponse,
    MessagingExtensionAction,
    MessagingExtensionActionResponse,
    MessagingExtensionQuery,
    MessagingExtensionResponse,
    O365ConnectorCardActionQuery,
    SigninStateVerificationQuery,
    TaskModuleTaskInfo,
    TaskModuleRequest,
    TaskModuleResponse,
    TaskModuleResponseBase,
    TeamsChannelData,
    TeamsChannelAccount,
    TeamInfo,
    TurnContext
} from 'botbuilder-core';
import { TeamsInfo } from './teamsInfo';

export class TeamsActivityHandler extends ActivityHandler {

    /**
     * 
     * @param context 
     */
    protected async onTurnActivity(context: TurnContext): Promise<void> {
        switch (context.activity.type) {
            case ActivityTypes.Invoke:
                const invokeResponse = await this.onInvokeActivity(context);
                // If onInvokeActivity has already sent an InvokeResponse, do not send another one.
                if (invokeResponse && !context.turnState.get(INVOKE_RESPONSE_KEY)) {
                    await context.sendActivity({ value: invokeResponse, type: 'invokeResponse' });
                }
                await this.defaultNextEvent(context)();
                break;
            default:
                await super.onTurnActivity(context);
                break;
        }
    }

    /**
     * 
     * @param context 
     */
    protected async onInvokeActivity(context: TurnContext): Promise<InvokeResponse> {
        try {
            if (!context.activity.name && context.activity.channelId === 'msteams') {
                return await this.handleTeamsCardActionInvoke(context);
            } else {
                switch (context.activity.name) {
                    case 'signin/verifyState':
                        await this.handleTeamsSigninVerifyState(context, context.activity.value);
                        return TeamsActivityHandler.createInvokeResponse();

                    case 'fileConsent/invoke':
                        return TeamsActivityHandler.createInvokeResponse(await this.handleTeamsFileConsent(context, context.activity.value));

                    case 'actionableMessage/executeAction':
                        await this.handleTeamsO365ConnectorCardAction(context, context.activity.value);
                        return TeamsActivityHandler.createInvokeResponse();

                    case 'composeExtension/queryLink':
                        return TeamsActivityHandler.createInvokeResponse(await this.handleTeamsAppBasedLinkQuery(context, context.activity.value));

                    case 'composeExtension/query':
                        return TeamsActivityHandler.createInvokeResponse(await this.handleTeamsMessagingExtensionQuery(context, context.activity.value));

                    case 'composeExtension/selectItem':
                        return TeamsActivityHandler.createInvokeResponse(await this.handleTeamsMessagingExtensionSelectItem(context, context.activity.value));

                    case 'composeExtension/submitAction':
                        return TeamsActivityHandler.createInvokeResponse(await this.handleTeamsMessagingExtensionSubmitActionDispatch(context, context.activity.value));

                    case 'composeExtension/fetchTask':
                        return TeamsActivityHandler.createInvokeResponse(await this.handleTeamsMessagingExtensionFetchTask(context, context.activity.value));

                    case 'composeExtension/querySettingUrl':
                        return TeamsActivityHandler.createInvokeResponse(await this.handleTeamsMessagingExtensionConfigurationQuerySettingUrl(context, context.activity.value));

                    case 'composeExtension/setting':
                        await this.handleTeamsMessagingExtensionConfigurationSetting(context, context.activity.value);
                        return TeamsActivityHandler.createInvokeResponse();

                    case 'composeExtension/onCardButtonClicked':
                        await this.handleTeamsMessagingExtensionCardButtonClicked(context, context.activity.value);
                        return TeamsActivityHandler.createInvokeResponse();

                    case 'task/fetch':
                        return TeamsActivityHandler.createInvokeResponse(await this.handleTeamsTaskModuleFetch(context, context.activity.value));

                    case 'task/submit':
                        return TeamsActivityHandler.createInvokeResponse(await this.handleTeamsTaskModuleSubmit(context, context.activity.value));

                    default:
                        throw new Error('NotImplemented');
                }
            }
        } catch (err) {
            if (err.message === 'NotImplemented') {
                return { status: 501 };
            } else if (err.message === 'BadRequest') {
                return { status: 400 };
            }
            throw err;
        }
    }

    /**
     * 
     * @param context 
     */
    protected async handleTeamsCardActionInvoke(context: TurnContext): Promise<InvokeResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with Activity name of 'fileConsent/invoke'. Handlers registered here run before
     * `handleTeamsFileConsentAccept` and `handleTeamsFileConsentDecline`.
     * Developers are not passed a pointer to the next `handleTeamsFileConsent` handler because the _wrapper_ around
     * the handler will call `onDialogs` handlers after delegating to `handleTeamsFileConsentAccept` or `handleTeamsFileConsentDecline`.
     * @param context
     * @param fileConsentCardResponse
     */
    protected async handleTeamsFileConsent(context: TurnContext, fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        switch (fileConsentCardResponse.action) {
            case 'accept':
                return await this.handleTeamsFileConsentAccept(context, fileConsentCardResponse);
            case 'decline':
                return await this.handleTeamsFileConsentDecline(context, fileConsentCardResponse);
            default:
                throw new Error('BadRequest');
        }
    }

    /**
     * Receives invoke activities with Activity name of 'fileConsent/invoke' with confirmation from user
     * @remarks
     * This type of invoke activity occur during the File Consent flow.
     * @param context
     * @param fileConsentCardResponse
     */
    protected async handleTeamsFileConsentAccept(context: TurnContext, fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with Activity name of 'fileConsent/invoke' with decline from user
     * @remarks
     * This type of invoke activity occur during the File Consent flow.
     * @param context
     * @param fileConsentCardResponse
     */
    protected async handleTeamsFileConsentDecline(context: TurnContext, fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with Activity name of 'actionableMessage/executeAction'
     */
    protected async handleTeamsO365ConnectorCardAction(context: TurnContext, query: O365ConnectorCardActionQuery): Promise<void> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with Activity name of 'signin/verifyState'
     * @param context
     * @param action
     */
    protected async handleTeamsSigninVerifyState(context: TurnContext, query: SigninStateVerificationQuery): Promise<void> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with Activity name of 'composeExtension/onCardButtonClicked'
     * @param context 
     * @param cardData 
     */
    protected async handleTeamsMessagingExtensionCardButtonClicked(context: TurnContext, cardData: any): Promise<void> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with Activity name of 'task/fetch'
     * @param context
     * @param taskModuleRequest
     */
    protected async handleTeamsTaskModuleFetch(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<TaskModuleResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with Activity name of 'task/submit'
     * @param context
     * @param taskModuleRequest
     */
    protected async handleTeamsTaskModuleSubmit(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<TaskModuleResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with Activity name of 'composeExtension/queryLink'
     * @remarks
     * Used in creating a Search-based Message Extension.
     * @param context
     * @param query
     */
    protected async handleTeamsAppBasedLinkQuery(context: TurnContext, query: AppBasedLinkQuery): Promise<MessagingExtensionResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with the name 'composeExtension/query'.
     * @remarks
     * Used in creating a Search-based Message Extension.
     * @param context
     * @param action
     */
    protected async handleTeamsMessagingExtensionQuery(context: TurnContext, query: MessagingExtensionQuery): Promise<MessagingExtensionResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with the name 'composeExtension/selectItem'.
     * @remarks
     * Used in creating a Search-based Message Extension.
     * @param context
     * @param action
     */
    protected async handleTeamsMessagingExtensionSelectItem(context: TurnContext, query: any): Promise<MessagingExtensionResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with the name 'composeExtension/submitAction' and dispatches to botMessagePreview-flows as applicable.
     * @remarks
     * A handler registered through this method does not dispatch to the next handler (either `handleTeamsMessagingExtensionSubmitAction`, `handleTeamsMessagingExtensionBotMessagePreviewEdit`, or `handleTeamsMessagingExtensionBotMessagePreviewSend`).
     * This method exists for developers to optionally add more logic before the TeamsActivityHandler routes the activity to one of the
     * previously mentioned handlers.
     * @param context
     * @param action
     */
    protected async handleTeamsMessagingExtensionSubmitActionDispatch(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        if (action.botMessagePreviewAction) {
            switch (action.botMessagePreviewAction) {
                case 'edit':
                    return await this.handleTeamsMessagingExtensionBotMessagePreviewEdit(context, action);
                case 'send':
                    return await this.handleTeamsMessagingExtensionBotMessagePreviewSend(context, action);
                default:
                    throw new Error('BadRequest');
            }
        } else {
            return await this.handleTeamsMessagingExtensionSubmitAction(context, action);
        }
    }

    /**
     * Receives invoke activities with the name 'composeExtension/submitAction'.
     * @remarks
     * This invoke activity is received when a user 
     * @param context
     * @param action
     */
    protected async handleTeamsMessagingExtensionSubmitAction(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with the name 'composeExtension/submitAction' with the 'botMessagePreview' property present on activity.value.
     * The value for 'botMessagePreview' is 'edit'.
     * @remarks
     * This invoke activity is received when a user
     * @param context
     * @param action
     */
    protected async handleTeamsMessagingExtensionBotMessagePreviewEdit(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with the name 'composeExtension/submitAction' with the 'botMessagePreview' property present on activity.value.
     * The value for 'botMessagePreview' is 'send'.
     * @remarks
     * This invoke activity is received when a user 
     * @param context
     * @param action
     */
    protected async handleTeamsMessagingExtensionBotMessagePreviewSend(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with the name 'composeExtension/fetchTask'
     * @param context
     * @param action
     */
    protected async handleTeamsMessagingExtensionFetchTask(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with the name 'composeExtension/querySettingUrl' 
     * @param context
     * @param query
     */
    protected async handleTeamsMessagingExtensionConfigurationQuerySettingUrl(context: TurnContext, query: MessagingExtensionQuery): Promise<MessagingExtensionResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with the name 'composeExtension/setting' 
     * @param context
     * @param query
     */
    protected handleTeamsMessagingExtensionConfigurationSetting(context: TurnContext, settings: any): Promise<void> {
        throw new Error('NotImplemented');
    }

    /**
     * Override this method to change the dispatching of ConversationUpdate activities.
     * @remarks
     * 
     * @param context 
     */
    protected async dispatchConversationUpdateActivity(context: TurnContext): Promise<void> {
        await this.handle(context, 'ConversationUpdate', async () => {

            if (context.activity.channelId == "msteams")
            {
                const channelData = context.activity.channelData as TeamsChannelData;

                if (context.activity.membersAdded && context.activity.membersAdded.length > 0) {
                    return await this.onTeamsMembersAdded(context);
                }
                
                if (context.activity.membersRemoved && context.activity.membersRemoved.length > 0) {
                    return await this.onTeamsMembersRemoved(context);
                }

                if (!channelData || !channelData.eventType) {
                    return await super.dispatchConversationUpdateActivity(context);
                }
        
                switch (channelData.eventType)
                {
                    case 'channelCreated':
                        return await this.onTeamsChannelCreated(context);
        
                    case 'channelDeleted':
                        return await this.onTeamsChannelDeleted(context);
        
                    case 'channelRenamed':
                        return await this.onTeamsChannelRenamed(context);
        
                    case 'teamRenamed':
                        return await this.onTeamsTeamRenamed(context);
        
                    default:
                        return await super.dispatchConversationUpdateActivity(context);
                }
            } else {
                return await super.dispatchConversationUpdateActivity(context);
            }
        });
    }

    /**
     * Called in `dispatchConversationUpdateActivity()` to trigger the `'TeamsMembersAdded'` handlers.
     * @remarks
     * If no handlers are registered for the `'TeamsMembersAdded'` event, the `'MembersAdded'` handlers will run instead.
     * @param context 
     */
    protected async onTeamsMembersAdded(context: TurnContext): Promise<void> {
        if ('TeamsMembersAdded' in this.handlers && this.handlers['TeamsMembersAdded'].length > 0) {

            let teamsChannelAccountLookup = null;

            for (let i=0; i<context.activity.membersAdded.length; i++) {
                const channelAccount = context.activity.membersAdded[i];

                // check whether we have a TeamChannelAccount
                if ('givenName' in channelAccount ||
                    'surname' in channelAccount ||
                    'email' in channelAccount ||
                    'userPrincipalName' in channelAccount) {

                    // we must have a TeamsChannelAccount so skip to teh next one
                    continue;
                }

                // (lazily) build a lookup table of TeamsChannelAccounts
                if (teamsChannelAccountLookup === null) {
                    const teamsChannelAccounts = await TeamsInfo.getMembers(context);
                    teamsChannelAccountLookup = {};
                    teamsChannelAccounts.forEach((teamChannelAccount) => teamsChannelAccountLookup[teamChannelAccount.id] = teamChannelAccount);
                }

                // if we have the TeamsChannelAccount in our lookup table then overwrite the ChannelAccount with it
                const teamsChannelAccount = teamsChannelAccountLookup[channelAccount.id];
                if (teamsChannelAccount !== undefined) {
                    context.activity.membersAdded[i] = teamsChannelAccount;
                }
            }

            await this.handle(context, 'TeamsMembersAdded', this.defaultNextEvent(context));
        } else {
            await this.handle(context, 'MembersAdded', this.defaultNextEvent(context));
        }
    }

    /**
     * Called in `dispatchConversationUpdateActivity()` to trigger the `'TeamsMembersRemoved'` handlers.
     * @remarks
     * If no handlers are registered for the `'TeamsMembersRemoved'` event, the `'MembersRemoved'` handlers will run instead.
     * @param context 
     */
    protected async onTeamsMembersRemoved(context: TurnContext): Promise<void> {
        if ('TeamsMembersRemoved' in this.handlers && this.handlers['TeamsMembersRemoved'].length > 0) {
            await this.handle(context, 'TeamsMembersRemoved', this.defaultNextEvent(context));
        } else {
            await this.handle(context, 'MembersRemoved', this.defaultNextEvent(context));
        }
    }

    /**
     * 
     * @param context 
     */
    protected async onTeamsChannelCreated(context): Promise<void> {
        await this.handle(context, 'TeamsChannelCreated', this.defaultNextEvent(context));
    }

    /**
     * 
     * @param context 
     */
    protected async onTeamsChannelDeleted(context): Promise<void> {
        await this.handle(context, 'TeamsChannelDeleted', this.defaultNextEvent(context));
    }

    /**
     * 
     * @param context 
     */
    protected async onTeamsChannelRenamed(context): Promise<void> {
        await this.handle(context, 'TeamsChannelRenamed', this.defaultNextEvent(context));
    }

    /**
     * 
     * @param context 
     */
    protected async onTeamsTeamRenamed(context): Promise<void> {
        await this.handle(context, 'TeamsTeamRenamed', this.defaultNextEvent(context));
    }

    /**
     * 
     * @param handler 
     */
    public onTeamsMembersAddedEvent(handler: (membersAdded: TeamsChannelAccount[], teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>) => Promise<void>): this {
        return this.on('TeamsMembersAdded', async (context, next) => {
            const teamsChannelData = context.activity.channelData as TeamsChannelData;
            await handler(context.activity.membersAdded, teamsChannelData.team, context, next);
        });
    }

    /**
     * 
     * @param handler 
     */
    public onTeamsMembersRemovedEvent(handler: (membersRemoved: TeamsChannelAccount[], teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>) => Promise<void>): this {
        return this.on('TeamsMembersRemoved', async (context, next) => {
            const teamsChannelData = context.activity.channelData as TeamsChannelData;
            await handler(context.activity.membersRemoved, teamsChannelData.team, context, next);
        });
    }

    /**
     * 
     * @param handler 
     */
    public onTeamsChannelCreatedEvent(handler: (channelInfo: ChannelInfo, teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>) => Promise<void>): this {
        return this.on('TeamsChannelCreated', async (context, next) => {
            const teamsChannelData = context.activity.channelData as TeamsChannelData;
            await handler(teamsChannelData.channel, teamsChannelData.team, context, next);
        });
    }

    /**
     * 
     * @param handler 
     */
    public onTeamsChannelDeletedEvent(handler: (channelInfo: ChannelInfo, teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>) => Promise<void>): this {
        return this.on('TeamsChannelDeleted', async (context, next) => {
            const teamsChannelData = context.activity.channelData as TeamsChannelData;
            await handler(teamsChannelData.channel, teamsChannelData.team, context, next);
        });
    }

    /**
     * 
     * @param handler 
     */
    public onTeamsChannelRenamedEvent(handler: (channelInfo: ChannelInfo, teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>) => Promise<void>): this {
        return this.on('TeamsChannelRenamed', async (context, next) => {
            const teamsChannelData = context.activity.channelData as TeamsChannelData;
            await handler(teamsChannelData.channel, teamsChannelData.team, context, next);
        });
    }

    /**
     * 
     * @param handler 
     */
    public onTeamsTeamRenamedEvent(handler: (teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>) => Promise<void>): this {
        return this.on('TeamsTeamRenamed', async (context, next) => {
            const teamsChannelData = context.activity.channelData as TeamsChannelData;
            await handler(teamsChannelData.team, context, next);
        });
    }

    private static createInvokeResponse(body?: any): InvokeResponse {
        return { status: 200, body };
    }
}