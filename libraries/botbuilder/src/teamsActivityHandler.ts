/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    ActivityHandler,
    ActivityTypes,
    AppBasedLinkQuery,
    ChannelInfo,
    FileConsentCardResponse,
    InvokeResponse,
    MessagingExtensionAction,
    MessagingExtensionActionResponse,
    MessagingExtensionQuery,
    MessagingExtensionResponse,
    O365ConnectorCardActionQuery,
    SigninStateVerificationQuery,
    TaskModuleRequest,
    TaskModuleResponse,
    TeamsChannelData,
    TeamsChannelAccount,
    TeamInfo,
    TurnContext,
    tokenExchangeOperationName,
    verifyStateOperationName
} from 'botbuilder-core';
import { TeamsInfo } from './teamsInfo';

export class TeamsActivityHandler extends ActivityHandler {

    /**
     * Invoked when an invoke activity is received from the connector.
     * Invoke activities can be used to communicate many different things.
     * @param context A context object for this turn.
     * @returns An Invoke Response for the activity.
     */
    protected async onInvokeActivity(context: TurnContext): Promise<InvokeResponse> {
        let runEvents = true;
        try {
            if (!context.activity.name && context.activity.channelId === 'msteams') {
                return await this.handleTeamsCardActionInvoke(context);
            } else {
                switch (context.activity.name) {
                    case 'fileConsent/invoke':
                        return ActivityHandler.createInvokeResponse(await this.handleTeamsFileConsent(context, context.activity.value));

                    case 'actionableMessage/executeAction':
                        await this.handleTeamsO365ConnectorCardAction(context, context.activity.value);
                        return ActivityHandler.createInvokeResponse();

                    case 'composeExtension/queryLink':
                        return ActivityHandler.createInvokeResponse(await this.handleTeamsAppBasedLinkQuery(context, context.activity.value));

                    case 'composeExtension/query':
                        return ActivityHandler.createInvokeResponse(await this.handleTeamsMessagingExtensionQuery(context, context.activity.value));

                    case 'composeExtension/selectItem':
                        return ActivityHandler.createInvokeResponse(await this.handleTeamsMessagingExtensionSelectItem(context, context.activity.value));

                    case 'composeExtension/submitAction':
                        return ActivityHandler.createInvokeResponse(await this.handleTeamsMessagingExtensionSubmitActionDispatch(context, context.activity.value));

                    case 'composeExtension/fetchTask':
                        return ActivityHandler.createInvokeResponse(await this.handleTeamsMessagingExtensionFetchTask(context, context.activity.value));

                    case 'composeExtension/querySettingUrl':
                        return ActivityHandler.createInvokeResponse(await this.handleTeamsMessagingExtensionConfigurationQuerySettingUrl(context, context.activity.value));

                    case 'composeExtension/setting':
                        await this.handleTeamsMessagingExtensionConfigurationSetting(context, context.activity.value);
                        return ActivityHandler.createInvokeResponse();

                    case 'composeExtension/onCardButtonClicked':
                        await this.handleTeamsMessagingExtensionCardButtonClicked(context, context.activity.value);
                        return ActivityHandler.createInvokeResponse();

                    case 'task/fetch':
                        return ActivityHandler.createInvokeResponse(await this.handleTeamsTaskModuleFetch(context, context.activity.value));

                    case 'task/submit':
                        return ActivityHandler.createInvokeResponse(await this.handleTeamsTaskModuleSubmit(context, context.activity.value));

                    default:
                        runEvents = false;
                        return super.onInvokeActivity(context);
                }
            }
        } catch (err) {
            if (err.message === 'NotImplemented') {
                return { status: 501 };
            } else if (err.message === 'BadRequest') {
                return { status: 400 };
            }
            throw err;
        } finally {
            if (runEvents) {
                this.defaultNextEvent(context)();
            }
        }
    }

    /**
     * Handles a Teams Card Action Invoke activity.
     * @param context A context object for this turn.
     * @returns An Invoke Response for the activity.
     */
    protected async handleTeamsCardActionInvoke(context: TurnContext): Promise<InvokeResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with Activity name of 'fileConsent/invoke'. Handlers registered here run before
     * `handleTeamsFileConsentAccept` and `handleTeamsFileConsentDecline`.
     * Developers are not passed a pointer to the next `handleTeamsFileConsent` handler because the _wrapper_ around
     * the handler will call `onDialogs` handlers after delegating to `handleTeamsFileConsentAccept` or `handleTeamsFileConsentDecline`.
     * @param context A context object for this turn.
     * @param fileConsentCardResponse Represents the value of the invoke activity sent when the user acts on a file consent card.
     * @returns A promise that represents the work queued.
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
     * @param context A context object for this turn.
     * @param fileConsentCardResponse Represents the value of the invoke activity sent when the user acts on a file consent card.
     * @returns A promise that represents the work queued.
     */
    protected async handleTeamsFileConsentAccept(context: TurnContext, fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with Activity name of 'fileConsent/invoke' with decline from user
     * @remarks
     * This type of invoke activity occur during the File Consent flow.
     * @param context A context object for this turn.
     * @param fileConsentCardResponse Represents the value of the invoke activity sent when the user acts on a file consent card.
     * @returns A promise that represents the work queued.
     */
    protected async handleTeamsFileConsentDecline(context: TurnContext, fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with Activity name of 'actionableMessage/executeAction'.
     * @param context A context object for this turn.
     * @param query The O365 connector card HttpPOST invoke query.
     * @returnsa A promise that represents the work queued.
     */
    protected async handleTeamsO365ConnectorCardAction(context: TurnContext, query: O365ConnectorCardActionQuery): Promise<void> {
        throw new Error('NotImplemented');
    }

    /**
     * Invoked when a signIn invoke activity is received from the connector.
     * @param context A context object for this turn.
     * @returns A promise that represents the work queued.
     */
    protected async onSignInInvoke(context: TurnContext): Promise<void> {
        switch (context.activity.name) {
            case verifyStateOperationName:
                return await this.handleTeamsSigninVerifyState(context, context.activity.value);
            case tokenExchangeOperationName:
                return await this.handleTeamsSigninTokenExchange(context, context.activity.value);
        }
    }

    /**
     * Receives invoke activities with Activity name of 'signin/verifyState'.
     * @param context A context object for this turn.
     * @param query Signin state (part of signin action auth flow) verification invoke query.
     * @returns A promise that represents the work queued.
     */
    protected async handleTeamsSigninVerifyState(context: TurnContext, query: SigninStateVerificationQuery): Promise<void> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with Activity name of 'signin/tokenExchange'
     * @param context A context object for this turn.
     * @param query Signin state (part of signin action auth flow) verification invoke query
     * @returns A promise that represents the work queued.
     */
    protected async handleTeamsSigninTokenExchange(context: TurnContext, query: SigninStateVerificationQuery): Promise<void> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with Activity name of 'composeExtension/onCardButtonClicked'
     * @param context A context object for this turn.
     * @param cardData Object representing the card data.
     * @returns A promise that represents the work queued.
     */
    protected async handleTeamsMessagingExtensionCardButtonClicked(context: TurnContext, cardData: any): Promise<void> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with Activity name of 'task/fetch'
     * @param context A context object for this turn.
     * @param taskModuleRequest The task module invoke request value payload.
     * @returns A Task Module Response for the request.
     */
    protected async handleTeamsTaskModuleFetch(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<TaskModuleResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with Activity name of 'task/submit'
     * @param context A context object for this turn.
     * @param taskModuleRequest The task module invoke request value payload.
     * @returns A Task Module Response for the request.
     */
    protected async handleTeamsTaskModuleSubmit(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<TaskModuleResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with Activity name of 'composeExtension/queryLink'
     * @remarks
     * Used in creating a Search-based Message Extension.
     * @param context A context object for this turn.
     * @param query he invoke request body type for app-based link query.
     * @returns The Messaging Extension Response for the query.
     */
    protected async handleTeamsAppBasedLinkQuery(context: TurnContext, query: AppBasedLinkQuery): Promise<MessagingExtensionResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with the name 'composeExtension/query'.
     * @remarks
     * Used in creating a Search-based Message Extension.
     * @param context A context object for this turn.
     * @param query The query for the search command.
     * @returns The Messaging Extension Response for the query.
     */
    protected async handleTeamsMessagingExtensionQuery(context: TurnContext, query: MessagingExtensionQuery): Promise<MessagingExtensionResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with the name 'composeExtension/selectItem'.
     * @remarks
     * Used in creating a Search-based Message Extension.
     * @param context A context object for this turn.
     * @param query he object representing the query.
     * @returns The Messaging Extension Response for the query.
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
     * @param context A context object for this turn.
     * @param action The messaging extension action.
     * @returns The Messaging Extension Action Response for the action.
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
     * @param context A context object for this turn.
     * @param action The messaging extension action.
     * @returns The Messaging Extension Action Response for the action.
     */
    protected async handleTeamsMessagingExtensionSubmitAction(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with the name 'composeExtension/submitAction' with the 'botMessagePreview' property present on activity.value.
     * The value for 'botMessagePreview' is 'edit'.
     * @param context A context object for this turn.
     * @param action The messaging extension action.
     * @returns The Messaging Extension Action Response for the action.
     */
    protected async handleTeamsMessagingExtensionBotMessagePreviewEdit(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with the name 'composeExtension/submitAction' with the 'botMessagePreview' property present on activity.value.
     * The value for 'botMessagePreview' is 'send'.
     * @param context A context object for this turn.
     * @param action The messaging extension action.
     * @returns The Messaging Extension Action Response for the action.
     */
    protected async handleTeamsMessagingExtensionBotMessagePreviewSend(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with the name 'composeExtension/fetchTask'
     * @param context A context object for this turn.
     * @param action The messaging extension action.
     * @returns The Messaging Extension Action Response for the action.
     */
    protected async handleTeamsMessagingExtensionFetchTask(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with the name 'composeExtension/querySettingUrl' 
     * @param context A context object for this turn.
     * @param query The Messaging extension query.
     * @returns The Messaging Extension Action Response for the query.
     */
    protected async handleTeamsMessagingExtensionConfigurationQuerySettingUrl(context: TurnContext, query: MessagingExtensionQuery): Promise<MessagingExtensionResponse> {
        throw new Error('NotImplemented');
    }

    /**
     * Receives invoke activities with the name 'composeExtension/setting' 
     * @param context A context object for this turn.
     * @param settings Object representing the configuration settings.
     * @returns A promise that represents the work queued.
     */
    protected handleTeamsMessagingExtensionConfigurationSetting(context: TurnContext, settings: any): Promise<void> {
        throw new Error('NotImplemented');
    }

    /**
     * Override this method to change the dispatching of ConversationUpdate activities.
     * @param context A context object for this turn.
     * @returns A promise that represents the work queued.
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

                    case 'channelRestored':
                        return await this.onTeamsChannelRestored(context);
        
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
     * @param context A context object for this turn.
     * @returns A promise that represents the work queued.
     */
    protected async onTeamsMembersAdded(context: TurnContext): Promise<void> {
        if ('TeamsMembersAdded' in this.handlers && this.handlers['TeamsMembersAdded'].length > 0) {

            for (let i=0; i<context.activity.membersAdded.length; i++) {
                const channelAccount = context.activity.membersAdded[i];

                // check whether we have a TeamChannelAccount, or the member is the bot
                if ('givenName' in channelAccount ||
                    'surname' in channelAccount ||
                    'email' in channelAccount ||
                    'userPrincipalName' in channelAccount ||
                    context.activity.recipient.id === channelAccount.id) {

                    // we must have a TeamsChannelAccount, or a bot so skip to the next one
                    continue;
                }

                try {
                    context.activity.membersAdded[i] = await TeamsInfo.getMember(context, channelAccount.id);
                } catch (err) {
                    const errCode: string = err.body && err.body.error && err.body.error.code;
                    if (errCode === 'ConversationNotFound') {
                        // unable to find the member added in ConversationUpdate Activity in the response from the getMember call
                        const teamsChannelAccount: TeamsChannelAccount = { 
                            id: channelAccount.id,
                            name: channelAccount.name,
                            aadObjectId: channelAccount.aadObjectId,
                            role: channelAccount.role,
                        };
    
                        context.activity.membersAdded[i] = teamsChannelAccount;    
                    } else {
                        throw err;
                    }
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
     * @param context A context object for this turn.
     * @returns A promise that represents the work queued.
     */
    protected async onTeamsMembersRemoved(context: TurnContext): Promise<void> {
        if ('TeamsMembersRemoved' in this.handlers && this.handlers['TeamsMembersRemoved'].length > 0) {
            await this.handle(context, 'TeamsMembersRemoved', this.defaultNextEvent(context));
        } else {
            await this.handle(context, 'MembersRemoved', this.defaultNextEvent(context));
        }
    }

    /**
     * Invoked when a Channel Created event activity is received from the connector.
     * Channel Created correspond to the user creating a new channel.
     * @param context A context object for this turn.
     * @returns A promise that represents the work queued.
     */
    protected async onTeamsChannelCreated(context): Promise<void> {
        await this.handle(context, 'TeamsChannelCreated', this.defaultNextEvent(context));
    }

    /**
     * Invoked when a Channel Deleted event activity is received from the connector.
     * Channel Deleted correspond to the user deleting a channel.
     * @param context A context object for this turn.
     * @returns A promise that represents the work queued. 
     */
    protected async onTeamsChannelDeleted(context): Promise<void> {
        await this.handle(context, 'TeamsChannelDeleted', this.defaultNextEvent(context));
    }

    /**
     * Invoked when a Channel Renamed event activity is received from the connector.
     * Channel Renamed correspond to the user renaming a new channel.
     * @param context A context object for this turn.
     * @returns A promise that represents the work queued.
     */
    protected async onTeamsChannelRenamed(context): Promise<void> {
        await this.handle(context, 'TeamsChannelRenamed', this.defaultNextEvent(context));
    }

    /**
     * Invoked when a Channel Restored event activity is received from the connector.
     * Channel Restored correspond to the user restoring a previously deleted channel.
     * @param context The context for this turn.
     * @returns A promise that represents the work queued.
     */
    protected async onTeamsChannelRestored(context): Promise<void> {
        await this.handle(context, 'TeamsChannelRestored', this.defaultNextEvent(context));
    }

    /**
     * Invoked when a Team Renamed event activity is received from the connector.
     * Team Renamed correspond to the user renaming a team.
     * @param context The context for this turn.
     * @returns A promise that represents the work queued.
     */
    protected async onTeamsTeamRenamed(context): Promise<void> {
        await this.handle(context, 'TeamsTeamRenamed', this.defaultNextEvent(context));
    }

    /**
     * Override this in a derived class to provide logic for when members other than the bot
     * join the channel, such as your bot's welcome logic.
     * @param handler 
     * @returns A promise that represents the work queued.
     */
    public onTeamsMembersAddedEvent(handler: (membersAdded: TeamsChannelAccount[], teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>) => Promise<void>): this {
        return this.on('TeamsMembersAdded', async (context, next) => {
            const teamsChannelData = context.activity.channelData as TeamsChannelData;
            await handler(context.activity.membersAdded, teamsChannelData.team, context, next);
        });
    }

    /**
     * Override this in a derived class to provide logic for when members other than the bot
     * leave the channel, such as your bot's good-bye logic.
     * @param handler 
     * @returns A promise that represents the work queued.
     */
    public onTeamsMembersRemovedEvent(handler: (membersRemoved: TeamsChannelAccount[], teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>) => Promise<void>): this {
        return this.on('TeamsMembersRemoved', async (context, next) => {
            const teamsChannelData = context.activity.channelData as TeamsChannelData;
            await handler(context.activity.membersRemoved, teamsChannelData.team, context, next);
        });
    }

    /**
     * Override this in a derived class to provide logic for when a channel is created.
     * @param handler 
     * @returns A promise that represents the work queued.
     */
    public onTeamsChannelCreatedEvent(handler: (channelInfo: ChannelInfo, teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>) => Promise<void>): this {
        return this.on('TeamsChannelCreated', async (context, next) => {
            const teamsChannelData = context.activity.channelData as TeamsChannelData;
            await handler(teamsChannelData.channel, teamsChannelData.team, context, next);
        });
    }

    /**
     * Override this in a derived class to provide logic for when a channel is deleted.
     * @param handler 
     * @returns A promise that represents the work queued. 
     */
    public onTeamsChannelDeletedEvent(handler: (channelInfo: ChannelInfo, teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>) => Promise<void>): this {
        return this.on('TeamsChannelDeleted', async (context, next) => {
            const teamsChannelData = context.activity.channelData as TeamsChannelData;
            await handler(teamsChannelData.channel, teamsChannelData.team, context, next);
        });
    }

    /**
     * Override this in a derived class to provide logic for when a channel is renamed.
     * @param handler 
     * @returns A promise that represents the work queued.
     */
    public onTeamsChannelRenamedEvent(handler: (channelInfo: ChannelInfo, teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>) => Promise<void>): this {
        return this.on('TeamsChannelRenamed', async (context, next) => {
            const teamsChannelData = context.activity.channelData as TeamsChannelData;
            await handler(teamsChannelData.channel, teamsChannelData.team, context, next);
        });
    }
    
    /**
     * Override this in a derived class to provide logic for when a channel is restored.
     * @param handler 
     * @returns A promise that represents the work queued.
     */
    public onTeamsChannelRestoredEvent(handler: (teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>) => Promise<void>): this {
        return this.on('TeamsChannelRestored', async (context, next) => {
            const teamsChannelData = context.activity.channelData as TeamsChannelData;
            await handler(teamsChannelData.team, context, next);
        });
    }

    /**
     * Override this in a derived class to provide logic for when a team is renamed.
     * @param handler 
     * @returns A promise that represents the work queued.
     */
    public onTeamsTeamRenamedEvent(handler: (teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>) => Promise<void>): this {
        return this.on('TeamsTeamRenamed', async (context, next) => {
            const teamsChannelData = context.activity.channelData as TeamsChannelData;
            await handler(teamsChannelData.team, context, next);
        });
    }
}