// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    Activity,
    ActivityTypes,
    ActionTypes,
    AppBasedLinkQuery,
    Attachment,
    BotState,
    CardAction,
    CardFactory,
    ChannelAccount,
    ChannelInfo,
    FileInfoCard,
    FileConsentCard,
    FileConsentCardResponse,
    InvokeResponse,
    MessageFactory,
    MessageReaction,
    MessagingExtensionAction,
    MessagingExtensionActionResponse,
    MessagingExtensionQuery,
    MessagingExtensionResponse,
    MessagingExtensionResult,
    MessagingExtensionSuggestedAction,
    O365ConnectorCard,
    O365ConnectorCardActionBase,
    O365ConnectorCardActionCard,
    O365ConnectorCardActionQuery,
    O365ConnectorCardDateInput,
    O365ConnectorCardHttpPOST,
    O365ConnectorCardMultichoiceInput,
    O365ConnectorCardMultichoiceInputChoice,
    O365ConnectorCardOpenUri,
    O365ConnectorCardTextInput,
    O365ConnectorCardViewAction,
    TaskModuleContinueResponse,
    TaskModuleMessageResponse,
    TaskModuleRequest,
    TaskModuleResponse,
    TaskModuleTaskInfo,
    TeamDetails,
    TeamsActivityHandler,
    teamsCreateConversation,
    TeamInfo,
    TeamsInfo,
    TurnContext,
} from 'botbuilder';

import { AdaptiveCardHelper } from './adaptiveCardHelper';
import { CardResponseHelpers } from './cardResponseHelpers';
import { SubmitExampleData } from './submitExampleData';
import { ActivityLog } from './activityLog';

const RICH_CARD_PROPERTY = 'richCardConfig';
const HeroCard = 'Hero';
const ThumbnailCard = 'Thumbnail';
const ReceiptCard = 'Receipt';
const SigninCard = 'Signin';
const Carousel = 'Carousel';
const List = 'List';
    
/**
 * We need to change the key for the user state because the bot might not be in the conversation, which means they get a 403 error.
 * @param userState 
 */
export class IntegrationBot extends TeamsActivityHandler {
    protected activityIds: string[];
    // NOT SUPPORTED ON TEAMS: AnimationCard, AudioCard, VideoCard, OAuthCard
    protected cardTypes: string[];
    protected _log: ActivityLog;

    
    /*
     * See README.md on what this bot supports.
     */
    constructor(public userState: BotState, activityIds: string[], activityLog: ActivityLog) {
        super();
        this.activityIds = activityIds;
        this.cardTypes = [ HeroCard, ThumbnailCard, ReceiptCard, SigninCard, Carousel, List];
        this._log = activityLog
        
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            TurnContext.removeRecipientMention(context.activity);
            let text = context.activity.text;
            if (text && text.length > 0) {
                text = text.trim();
                await this.handleNonEmptyMessage(text, context, next);
            }
            else {
                await context.sendActivity('App sent a message with empty text');
                const activityValue = context.activity.value;
                if (activityValue) {
                    await context.sendActivity(`but with value ${JSON.stringify(activityValue)}`);
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onTeamsChannelRenamedEvent(async (channelInfo: ChannelInfo, teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>): Promise<void> => {
            const card = CardFactory.heroCard('Channel Renamed', `${channelInfo.name} is the new Channel name`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });

        this.onTeamsChannelCreatedEvent(async (channelInfo: ChannelInfo, teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>): Promise<void> => {
            const card = CardFactory.heroCard('Channel Created', `${channelInfo.name} is the Channel created`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });

        this.onTeamsChannelDeletedEvent(async (channelInfo: ChannelInfo, teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>): Promise<void> => {
            const card = CardFactory.heroCard('Channel Deleted', `${channelInfo.name} is the Channel deleted`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });

        this.onTeamsTeamRenamedEvent(async (teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>): Promise<void> => {
            const card = CardFactory.heroCard('Team Renamed', `${teamInfo.name} is the new Team name`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });

        this.onTeamsMembersAddedEvent(async (membersAdded: ChannelAccount[], teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>): Promise<void> => {
            var newMembers: string = '';
            console.log(JSON.stringify(membersAdded));
            membersAdded.forEach((account) => {
                newMembers.concat(account.id,' ');
            });
            const card = CardFactory.heroCard('Account Added', `${newMembers} joined ${teamInfo.name}.`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });

        this.onTeamsMembersRemovedEvent(async (membersRemoved: ChannelAccount[], teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>): Promise<void> => {
            var removedMembers: string = '';
            console.log(JSON.stringify(membersRemoved));
            membersRemoved.forEach((account) => {
                removedMembers += account.id + ' ';
            });
            const card = CardFactory.heroCard('Account Removed', `${removedMembers} removed from ${teamInfo.name}.`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });
        
        this.onMembersAdded(async (context: TurnContext, next: () => Promise<void>): Promise<void> => {
            var newMembers: string = '';
            context.activity.membersAdded.forEach((account) => {
                newMembers += account.id + ' ';
            });
            const card = CardFactory.heroCard('Member Added', `${newMembers} joined ${context.activity.conversation.conversationType}.`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });

        this.onMembersRemoved(async (context: TurnContext, next: () => Promise<void>): Promise<void> => {
            var removedMembers: string = '';
            context.activity.membersRemoved.forEach((account) => {
                removedMembers += account.id + ' ';
            });
            const card = CardFactory.heroCard('Member Removed', `${removedMembers} removed from ${context.activity.conversation.conversationType}.`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });
    }

    protected async handleTeamsMessagingExtensionFetchTask(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        const response = AdaptiveCardHelper.createTaskModuleAdaptiveCardResponse();
        return response;
    }

    protected async handleTeamsMessagingExtensionSubmitAction(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        const submittedData = action.data as SubmitExampleData;
        const adaptiveCard = AdaptiveCardHelper.toAdaptiveCardAttachment(submittedData);
        const response = CardResponseHelpers.toMessagingExtensionBotMessagePreviewResponse(adaptiveCard);
        return response;    
    }

    protected async handleTeamsMessagingExtensionBotMessagePreviewEdit(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        const submitData = AdaptiveCardHelper.toSubmitExampleData(action);
        const response = AdaptiveCardHelper.createTaskModuleAdaptiveCardResponse(
                                                    submitData.Question,
                                                    (submitData.MultiSelect.toLowerCase() === 'true'),
                                                    submitData.Option1,
                                                    submitData.Option2,
                                                    submitData.Option3);
        return response;
    }

    protected async handleTeamsMessagingExtensionBotMessagePreviewSend(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        const submitData: SubmitExampleData = AdaptiveCardHelper.toSubmitExampleData(action);
        const adaptiveCard: Attachment = AdaptiveCardHelper.toAdaptiveCardAttachment(submitData);

        const responseActivity = {type: 'message', attachments: [adaptiveCard] } as Activity;

        try {
            // Send to channel where messaging extension invoked.
            let results = await teamsCreateConversation(context, context.activity.channelData.channel.id, responseActivity);
        } catch(ex) {
            console.error('ERROR Sending to Channel:');
        }

        try {
            // Send card to "General" channel.
            const teamDetails: TeamDetails = await TeamsInfo.getTeamDetails(context);
            let results = await teamsCreateConversation(context, teamDetails.id, responseActivity);
        } catch(ex) {
            console.error('ERROR Sending to General channel:' + JSON.stringify(ex));
        }

        // Send card to compose box for the current user.
        const response = CardResponseHelpers.toComposeExtensionResultResponse(adaptiveCard);
        return response;
    }

    protected async handleTeamsMessagingExtensionCardButtonClicked(context: TurnContext, obj) {
        const reply = MessageFactory.text('onTeamsMessagingExtensionCardButtonClicked Value: ' + JSON.stringify(context.activity.value));
        await context.sendActivity(reply);
    }

    protected async handleTeamsFileConsentAccept(context: TurnContext, fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        try {
            await this.sendFile(fileConsentCardResponse);
            await this.fileUploadCompleted(context, fileConsentCardResponse);
        }
        catch (err) {
            await this.fileUploadFailed(context, err.toString());
        }
    }

    protected async handleTeamsFileConsentDecline(context: TurnContext, fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        let reply =  this.createReply(context.activity);
        reply.textFormat = "xml";
        reply.text = `Declined. We won't upload file <b>${fileConsentCardResponse.context["filename"]}</b>.`;
        await context.sendActivity(reply);
    } 
    
    protected async handleTeamsTaskModuleFetch(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<TaskModuleResponse> {
        var reply = MessageFactory.text("handleTeamsTaskModuleFetchAsync TaskModuleRequest" + JSON.stringify(taskModuleRequest));
        await context.sendActivity(reply);

        return {
            task: { 
                type: "continue", 
                value: {
                    card: this.getTaskModuleAdaptiveCard(),
                    height: 200,
                    width: 400,
                    title: "Adaptive Card: Inputs",
                } as TaskModuleTaskInfo, 
            } as TaskModuleContinueResponse
        } as TaskModuleResponse;
    }

    protected async handleTeamsTaskModuleSubmit(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<TaskModuleResponse> {
        var reply = MessageFactory.text("handleTeamsTaskModuleFetchAsync Value: " + JSON.stringify(taskModuleRequest));
        await context.sendActivity(reply);

        return {
            task: { 
                type: "message", 
                value: "Thanks!", 
            } as TaskModuleMessageResponse
        } as TaskModuleResponse;
    }

    protected async handleTeamsCardActionInvoke(context: TurnContext): Promise<InvokeResponse> {
        await context.sendActivity(MessageFactory.text(`handleTeamsCardActionInvoke value: ${JSON.stringify(context.activity.value)}`));
        return { status: 200 } as InvokeResponse;
    }

    protected async onReactionsAddedActivity(reactionsAdded: MessageReaction[], context: TurnContext): Promise<void> {
        for (var i = 0, len = reactionsAdded.length; i < len; i++) {
            var activity = await this._log.find(context.activity.replyToId);
            if (activity == null) {
                // If we had sent the message from the error handler we wouldn't have recorded the Activity Id and so we shouldn't expect to see it in the log.
                await this.sendMessageAndLogActivityId(context, `Activity ${context.activity.replyToId} not found in the log.`);
            }
            else {
                await this.sendMessageAndLogActivityId(context, `You added '${reactionsAdded[i].type}' regarding '${activity.text}'`);
            }
        };

        return;
    }

    protected async onReactionsRemovedActivity(reactionsAdded: MessageReaction[], context: TurnContext): Promise<void> {
        for (var i = 0, len = reactionsAdded.length; i < len; i++) {
            // The ReplyToId property of the inbound MessageReaction Activity will correspond to a Message Activity that was previously sent from this bot.
            var activity = await this._log.find(context.activity.replyToId);
            if (activity == null) {
                // If we had sent the message from the error handler we wouldn't have recorded the Activity Id and so we shouldn't expect to see it in the log.
                await this.sendMessageAndLogActivityId(context, `Activity ${context.activity.replyToId} not found in the log.`);
            }
            else {
                await this.sendMessageAndLogActivityId(context, `You removed '${reactionsAdded[i].type}' regarding '${activity.text}'`);
            }
        };

        return;
    }

    protected async handleTeamsO365ConnectorCardAction(context: TurnContext, query: O365ConnectorCardActionQuery): Promise<void> {
        await context.sendActivity(MessageFactory.text(`O365ConnectorCardActionQuery event value: ${JSON.stringify(query)}`));
    }

    
    protected async handleTeamsMessagingExtensionQuery(context: TurnContext, query: MessagingExtensionQuery): Promise<MessagingExtensionResponse>{
        const accessor = this.userState.createProperty<{ useHeroCard: boolean }>(RICH_CARD_PROPERTY);
        const config = await accessor.get(context, { useHeroCard: true });

        const searchQuery = query.parameters[0].value;
        const cardText = `You said "${searchQuery}"`;
        let composeExtensionResponse: MessagingExtensionResponse;

        const bfLogo = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtB3AwMUeNoq4gUBGe6Ocj8kyh3bXa9ZbV7u1fVKQoyKFHdkqU';
        const button = { type: 'openUrl', title: 'Click for more Information', value: "https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/bots/bots-overview" };

        if (config.useHeroCard) {
            const heroCard = CardFactory.heroCard('You searched for:', cardText, [bfLogo], [button]);
            const preview = CardFactory.heroCard('You searched for:', cardText, [bfLogo]);

            const secondPreview = CardFactory.heroCard('Learn more about Teams:', "https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/bots/bots-overview", [bfLogo]);
            const secondHeroCard = CardFactory.heroCard('Learn more about Teams:', "https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/bots/bots-overview", [bfLogo], [button]);
            composeExtensionResponse = {
                composeExtension: {
                    type: 'result',
                    attachmentLayout: 'list',
                    attachments: [
                        { ...heroCard, preview },
                        { ...secondHeroCard, preview: secondPreview }
                    ]
                }
            }
        } else {
            const thumbnailCard = CardFactory.thumbnailCard('You searched for:', cardText, [bfLogo], [button]);
            const preview = CardFactory.thumbnailCard('You searched for:', cardText, [bfLogo]);

            const secondPreview = CardFactory.thumbnailCard('Learn more about Teams:', "https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/bots/bots-overview", [bfLogo]);
            const secondThumbnailCard = CardFactory.thumbnailCard('Learn more about Teams:', "https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/bots/bots-overview", [bfLogo], [button]);
            composeExtensionResponse = {
                composeExtension: {
                    type: 'result',
                    attachmentLayout: 'list',
                    attachments: [
                        { ...thumbnailCard, preview },
                        { ...secondThumbnailCard, preview: secondPreview }
                    ]
                }
            }
        }

        return composeExtensionResponse;
    }
    
    protected async handleTeamsAppBasedLinkQuery(context: TurnContext, query: AppBasedLinkQuery): Promise<MessagingExtensionResponse>{
        const accessor = this.userState.createProperty<{ useHeroCard: boolean }>(RICH_CARD_PROPERTY);
        const config = await accessor.get(context, { useHeroCard: true });

        const url = query.url;
        const cardText = `You entered "${url}"`;
        let composeExtensionResponse: MessagingExtensionResponse;

        const bfLogo = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtB3AwMUeNoq4gUBGe6Ocj8kyh3bXa9ZbV7u1fVKQoyKFHdkqU';
        const button = { type: 'openUrl', title: 'Click for more Information', value: "https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/bots/bots-overview" };

        if (config.useHeroCard) {
            const heroCard = CardFactory.heroCard('HeroCard for Link Unfurling:', cardText, [bfLogo], [button]);
            const preview = CardFactory.heroCard('HeroCard for Link Unfurling:', cardText, [bfLogo]);

            composeExtensionResponse = {
                composeExtension: {
                    type: 'result',
                    attachmentLayout: 'list',
                    attachments: [
                        { ...heroCard, preview }
                    ]
                }
            }
        } else {
            const thumbnailCard = CardFactory.thumbnailCard('ThumbnailCard for Link Unfurling:', cardText, [bfLogo], [button]);
            const preview = CardFactory.thumbnailCard('ThumbnailCard for Link Unfurling:', cardText, [bfLogo]);

            composeExtensionResponse = {
                composeExtension: {
                    type: 'result',
                    attachmentLayout: 'list',
                    attachments: [
                        { ...thumbnailCard, preview }
                    ]
                }
            }
        }

        return composeExtensionResponse;
    }

    protected async handleTeamsMessagingExtensionConfigurationQuerySettingUrl(context: TurnContext, query: MessagingExtensionQuery){
        return <MessagingExtensionActionResponse>
        {
            composeExtension: <MessagingExtensionResult> {
                type: 'config',
                suggestedActions: <MessagingExtensionSuggestedAction> { 
                    actions: [
                        {
                            type: ActionTypes.OpenUrl,
                            title: 'Config',
                            value: process.env.host + '/composeExtensionSettings.html',
                        },
                    ]
                }
            }
        }
        /*
        return <MessagingExtensionActionResponse>
        {
            composeExtension: <MessagingExtensionResult> {
                type: 'config',
                suggestedActions: <MessagingExtensionSuggestedAction> { 
                    actions: [
                        {
                            type: ActionTypes.OpenUrl,
                            value: 'https://teamssettingspagescenario.azurewebsites.net',
                        },
                    ]
                    }
            }
        }
        */
    }

    protected async handleTeamsMessagingExtensionConfigurationSetting(context: TurnContext, settings: MessagingExtensionQuery){
        // This event is fired when the settings page is submitted
        const accessor = this.userState.createProperty<{ useHeroCard: boolean }>(RICH_CARD_PROPERTY);
        const config = await accessor.get(context, { useHeroCard: true });

        if (settings.state === 'hero') {
            config.useHeroCard = true;
        } 
        else if (settings.state === 'thumbnail') {
            config.useHeroCard = false;
        }
        else {
            await context.sendActivity(`onTeamsMessagingExtensionSettings event fired with ${ JSON.stringify(settings) }`);
        }

        // We should save it after we send the message back to Teams.
        await this.userState.saveChanges(context);
    }

    private async sendO365CardAttachment(context: TurnContext): Promise<void> {
        const card = CardFactory.o365ConnectorCard(<O365ConnectorCard>{
            "title": "card title",
            "text": "card text",
            "summary": "O365 card summary",
            "themeColor": "#E67A9E",
            "sections": [
                {
                    "title": "**section title**",
                    "text": "section text",
                    "activityTitle": "activity title",
                    "activitySubtitle": "activity subtitle",
                    "activityText": "activity text",
                    "activityImage": "http://connectorsdemo.azurewebsites.net/images/MSC12_Oscar_002.jpg",
                    "activityImageType": "avatar",
                    "markdown": true,
                    "facts": [
                        {
                            "name": "Fact name 1",
                            "value": "Fact value 1"
                        },
                        {
                            "name": "Fact name 2",
                            "value": "Fact value 2"
                        }
                    ],
                    "images": [
                        {
                            "image": "http://connectorsdemo.azurewebsites.net/images/MicrosoftSurface_024_Cafe_OH-06315_VS_R1c.jpg",
                            "title": "image 1"
                        },
                        {
                            "image": "http://connectorsdemo.azurewebsites.net/images/WIN12_Scene_01.jpg",
                            "title": "image 2"
                        },
                        {
                            "image": "http://connectorsdemo.azurewebsites.net/images/WIN12_Anthony_02.jpg",
                            "title": "image 3"
                        }
                    ],
                    "potentialAction": null
                }
            ],
            "potentialAction": <O365ConnectorCardActionBase[]>[
                <O365ConnectorCardActionCard>{
                    "@type": "ActionCard",
                    "inputs": [
                        {
                            "@type": "multichoiceInput",
                            "choices": [
                                {
                                    "display": "Choice 1",
                                    "value": "1"
                                },
                                {
                                    "display": "Choice 2",
                                    "value": "2"
                                },
                                {
                                    "display": "Choice 3",
                                    "value": "3"
                                }
                            ],
                            "style": "expanded",
                            "isMultiSelect": true,
                            "id": "list-1",
                            "isRequired": true,
                            "title": "Pick multiple options",
                            "value": null
                        },
                        {
                            "@type": "multichoiceInput",
                            "choices": [
                                {
                                    "display": "Choice 4",
                                    "value": "4"
                                },
                                {
                                    "display": "Choice 5",
                                    "value": "5"
                                },
                                {
                                    "display": "Choice 6",
                                    "value": "6"
                                }
                            ],
                            "style": "compact",
                            "isMultiSelect": true,
                            "id": "list-2",
                            "isRequired": true,
                            "title": "Pick multiple options",
                            "value": null
                        },
                        <O365ConnectorCardMultichoiceInput>{
                            "@type": "multichoiceInput",
                            "choices": <O365ConnectorCardMultichoiceInputChoice[]>[
                                {
                                    "display": "Choice a",
                                    "value": "a"
                                },
                                {
                                    "display": "Choice b",
                                    "value": "b"
                                },
                                {
                                    "display": "Choice c",
                                    "value": "c"
                                }
                            ],
                            "style": "expanded",
                            "isMultiSelect": false,
                            "id": "list-3",
                            "isRequired": false,
                            "title": "Pick an option",
                            "value": null
                        },
                        {
                            "@type": "multichoiceInput",
                            "choices": [
                                {
                                    "display": "Choice x",
                                    "value": "x"
                                },
                                {
                                    "display": "Choice y",
                                    "value": "y"
                                },
                                {
                                    "display": "Choice z",
                                    "value": "z"
                                }
                            ],
                            "style": "compact",
                            "isMultiSelect": false,
                            "id": "list-4",
                            "isRequired": false,
                            "title": "Pick an option",
                            "value": null
                        }
                    ],
                    "actions": [
                        <O365ConnectorCardHttpPOST>{
                            "@type": "HttpPOST",
                            "body": "{\"text1\":\"{{text-1.value}}\", \"text2\":\"{{text-2.value}}\", \"text3\":\"{{text-3.value}}\", \"text4\":\"{{text-4.value}}\"}",
                            "name": "Send",
                            "@id": "card-1-btn-1"
                        }
                    ],
                    "name": "Multiple Choice",
                    "@id": "card-1"
                },
                <O365ConnectorCardActionCard>{
                    "@type": "ActionCard",
                    "inputs": [
                        {
                            "@type": "textInput",
                            "isMultiline": true,
                            "maxLength": null,
                            "id": "text-1",
                            "isRequired": false,
                            "title": "multiline, no maxLength",
                            "value": null
                        },
                        {
                            "@type": "textInput",
                            "isMultiline": false,
                            "maxLength": null,
                            "id": "text-2",
                            "isRequired": false,
                            "title": "single line, no maxLength",
                            "value": null
                        },
                        <O365ConnectorCardTextInput>{
                            "@type": "textInput",
                            "isMultiline": true,
                            "maxLength": 10.0,
                            "id": "text-3",
                            "isRequired": true,
                            "title": "multiline, max len = 10, isRequired",
                            "value": null
                        },
                        {
                            "@type": "textInput",
                            "isMultiline": false,
                            "maxLength": 10.0,
                            "id": "text-4",
                            "isRequired": true,
                            "title": "single line, max len = 10, isRequired",
                            "value": null
                        }
                    ],
                    "actions": [
                        <O365ConnectorCardHttpPOST>{
                            "@type": "HttpPOST",
                            "body": "{\"text1\":\"{{text-1.value}}\", \"text2\":\"{{text-2.value}}\", \"text3\":\"{{text-3.value}}\", \"text4\":\"{{text-4.value}}\"}",
                            "name": "Send",
                            "@id": "card-2-btn-1"
                        }
                    ],
                    "name": "Text Input",
                    "@id": "card-2"
                },
                <O365ConnectorCardActionCard>{
                    "@type": "ActionCard",
                    "inputs": [
                        {
                            "@type": "dateInput",
                            "includeTime": true,
                            "id": "date-1",
                            "isRequired": true,
                            "title": "date with time",
                            "value": null
                        },
                        <O365ConnectorCardDateInput>{
                            "@type": "dateInput",
                            "includeTime": false,
                            "id": "date-2",
                            "isRequired": false,
                            "title": "date only",
                            "value": null
                        }
                    ],
                    "actions": [
                        <O365ConnectorCardHttpPOST>{
                            "@type": "HttpPOST",
                            "body": "{\"date1\":\"{{date-1.value}}\", \"date2\":\"{{date-2.value}}\"}",
                            "name": "Send",
                            "@id": "card-3-btn-1"
                        }
                    ],
                    "name": "Date Input",
                    "@id": "card-3"
                },
                <O365ConnectorCardViewAction>{
                    "@type": "ViewAction",
                    "target": ["http://microsoft.com"],
                    "name": "View Action",
                    "@id": null
                },
                <O365ConnectorCardOpenUri>{
                    "@type": "OpenUri",
                    "targets": [
                        {
                            "os": "default",
                            "uri": "http://microsoft.com"
                        },
                        {
                            "os": "iOS",
                            "uri": "http://microsoft.com"
                        },
                        {
                            "os": "android",
                            "uri": "http://microsoft.com"
                        },
                        {
                            "os": "windows",
                            "uri": "http://microsoft.com"
                        }
                    ],
                    "name": "Open Uri",
                    "@id": "open-uri"
                }
            ]
        });
        await context.sendActivity(MessageFactory.attachment(card));
    }

    private async handleNonEmptyMessage(text, context, next) : Promise<void> {
        if (text === 'delete') {
            for (const activityId of this.activityIds) {
                await context.deleteActivity(activityId);
            }

            this.activityIds = [];
        } 
        else {
            let reply: Partial<Activity>;
            switch (text.toLowerCase()) {
                case '1':
                    await this.sendAdaptiveCard1(context);
                    break;

                case '2':
                    await this.sendAdaptiveCard2(context);
                    break;

                case '3':
                    await this.sendAdaptiveCard3(context);
                    break;

                case HeroCard.toLowerCase():
                    reply = MessageFactory.attachment(this.getHeroCard());
                    break;
                case ThumbnailCard.toLowerCase():
                    reply = MessageFactory.attachment(this.getThumbnailCard());
                    break;
                case ReceiptCard.toLowerCase():
                    reply = MessageFactory.attachment(this.getReceiptCard());
                    break;
                case SigninCard.toLowerCase():
                    reply = MessageFactory.attachment(this.getSigninCard());
                    break;
                case Carousel.toLowerCase():
                    // NOTE: if cards are NOT the same height in a carousel, Teams will instead display as AttachmentLayoutTypes.List
                    reply = MessageFactory.carousel([this.getHeroCard(), this.getHeroCard(), this.getHeroCard()]);
                    break;
                case List.toLowerCase():
                    // NOTE: MessageFactory.Attachment with multiple attachments will default to AttachmentLayoutTypes.List
                    reply = MessageFactory.list([this.getHeroCard(), this.getHeroCard(), this.getHeroCard()]);
                    break;
                case "o365":
                    await this.sendO365CardAttachment(context);
                    break;
                case "file":
                    await this.sendFileCard(context);
                    break;
                case "show members":
                    await this.showMembers(context);
                    break;
                case "show channels":
                    await this.showChannels(context);
                    break;

                case "show details":
                    await this.showDetails(context);
                    break;
    
                default:
                    await this.sendMessageAndLogActivityId(context, text);
                    for (const id of this.activityIds) {
                        await context.updateActivity({ id, text, type: ActivityTypes.Message });
                    }
            }
            
            if (reply) {
                await context.sendActivity(reply);
            }
        }      
    }

    private getTaskModuleHeroCard() : Attachment {
        return CardFactory.heroCard("Task Module Invocation from Hero Card", 
            "This is a hero card with a Task Module Action button.  Click the button to show an Adaptive Card within a Task Module.",
            null, // No images
            [{type: "invoke", title:"Adaptive Card", value: {type:"task/fetch", data:"adaptivecard"} }]
            );
    }

    private getTaskModuleAdaptiveCard(): Attachment {
        return CardFactory.adaptiveCard({
            version: '1.0.0',
            type: 'AdaptiveCard',
            body: [
                {
                    type: 'TextBlock',
                    text: `Enter Text Here`,
                },
                {
                    type: 'Input.Text',
                    id: 'usertext',
                    placeholder: 'add some text and submit',
                    IsMultiline: true,
                }
            ],
            actions: [
                {
                    type: 'Action.Submit',
                    title: 'Submit',
                }
            ]
        });
    }
    
    private async sendFile(fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        const request = require("request");
        const fs = require('fs');     
        let context = fileConsentCardResponse.context;
        let path = require('path');
        let filePath = path.join('files', context["filename"]);
        let stats = fs.statSync(filePath);
        let fileSizeInBytes = stats['size']; 
        fs.createReadStream(filePath).pipe(request.put(fileConsentCardResponse.uploadInfo.uploadUrl));
    }

    private async sendFileCard(context: TurnContext): Promise<void> {
        let filename = "teams-logo.png";
        let fs = require('fs'); 
        let path = require('path');
        let stats = fs.statSync(path.join('files', filename));
        let fileSizeInBytes = stats['size'];    

        let fileContext = {
            filename: filename
        };

        let attachment = {
            content: <FileConsentCard>{
                description: 'This is the file I want to send you',
                fileSizeInBytes: fileSizeInBytes,
                acceptContext: fileContext,
                declineContext: fileContext
            },
            contentType: 'application/vnd.microsoft.teams.card.file.consent',
            name: filename
        } as Attachment;

        var replyActivity = this.createReply(context.activity);
        replyActivity.attachments = [ attachment ];
        console.log("REPLY ACTIVITY\n" + JSON.stringify(replyActivity));
        await context.sendActivity(replyActivity);
    }

    private async fileUploadCompleted(context: TurnContext, fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        let fileUploadInfoName = fileConsentCardResponse.uploadInfo.name;
        let downloadCard = <FileInfoCard>{
            uniqueId: fileConsentCardResponse.uploadInfo.uniqueId,
            fileType: fileConsentCardResponse.uploadInfo.fileType,
        };

        let attachment = <Attachment>{
            content: downloadCard,
            contentType: 'application/vnd.microsoft.teams.card.file.info',
            name: fileUploadInfoName,
            contentUrl: fileConsentCardResponse.uploadInfo.contentUrl,
        };

        let reply = this.createReply(context.activity, `<b>File uploaded.</b> Your file <b>${fileUploadInfoName}</b> is ready to download`);
        reply.textFormat = 'xml';
        reply.attachments = [attachment];
        await context.sendActivity(reply);
    }

    private async fileUploadFailed(context: TurnContext, error: string): Promise<void> {
        let reply = this.createReply(context.activity, `<b>File upload failed.</b> Error: <pre>${error}</pre>`);
        reply.textFormat = 'xml';
        await context.sendActivity(reply);
    }

    private createReply(activity, text = null, locale = null) : Activity {
        return {
            type: 'message',
            from: { id: activity.recipient.id, name: activity.recipient.name },
            recipient: { id: activity.from.id, name: activity.from.name },
            replyToId: activity.id,
            serviceUrl: activity.serviceUrl,
            channelId: activity.channelId,
            conversation: { isGroup: activity.conversation.isGroup, id: activity.conversation.id, name: activity.conversation.name },
            text: text || '',
            locale: locale || activity.locale
        } as Activity;
    } 

    private async sendMessageAndLogActivityId(context: TurnContext, text: string): Promise<void> {
        var replyActivity = MessageFactory.text(`You said '${text}'`);
        var resourceResponse = await context.sendActivity(replyActivity);
        await this.activityIds.push(resourceResponse.id);
        await this._log.append(resourceResponse.id, replyActivity);
    }

    private async sendAdaptiveCard1(context: TurnContext): Promise<void> {
        /* tslint:disable:quotemark object-literal-key-quotes */
        const card = CardFactory.adaptiveCard({
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "actions": [
                {
                    "data": {
                        "msteams": {
                            "type": "imBack",
                            "value": "text"
                        }
                    },
                    "title": "imBack",
                    "type": "Action.Submit"
                },
                {
                    "data": {
                        "msteams": {
                            "type": "messageBack",
                            "value": { "key": "value" }
                        }
                    },
                    "title": "message back",
                    "type": "Action.Submit"
                },
                {
                    "data": {
                        "msteams": {
                            "displayText": "display text message back",
                            "text": "text received by bots",
                            "type": "messageBack",
                            "value": { "key": "value" }
                        }
                    },
                    "title": "message back local echo",
                    "type": "Action.Submit"
                },
                {
                    "data": {
                        "msteams": {
                            "type": "invoke",
                            "value": { "key": "value" }
                        }
                    },
                    "title": "invoke",
                    "type": "Action.Submit"
                }
            ],
            "body": [
                {
                    "text": "Bot Builder actions",
                    "type": "TextBlock"
                }
            ],
            "type": "AdaptiveCard",
            "version": "1.0"
        });
        /* tslint:enable:quotemark object-literal-key-quotes */
        await context.sendActivity(MessageFactory.attachment(card));
    }

    private async sendAdaptiveCard2(context: TurnContext): Promise<void> {
        /* tslint:disable:quotemark object-literal-key-quotes */
        const card = CardFactory.adaptiveCard({
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "actions": [
                {
                    "data": {
                        "msteams": {
                            "type": "invoke",
                            "value": {
                                "hiddenKey": "hidden value from task module launcher",
                                "type": "task/fetch"
                            }
                        }
                    },
                    "title": "Launch Task Module",
                    "type": "Action.Submit"
                }
            ],
            "body": [
                {
                    "text": "Task Module Adaptive Card",
                    "type": "TextBlock"
                }
            ],
            "type": "AdaptiveCard",
            "version": "1.0"
        });
        /* tslint:enable:quotemark object-literal-key-quotes */
        await context.sendActivity(MessageFactory.attachment(card));
    }

    private async sendAdaptiveCard3(context: TurnContext): Promise<void> {
        /* tslint:disable:quotemark object-literal-key-quotes */
        const card = CardFactory.adaptiveCard({
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "actions": [
                {
                    "data": {
                        "key": "value"
                    },
                    "title": "Action.Submit",
                    "type": "Action.Submit"
                }
            ],
            "body": [
                {
                    "text": "Bot Builder actions",
                    "type": "TextBlock"
                },
                {
                    "id": "x",
                    "type": "Input.Text"
                }
            ],
            "type": "AdaptiveCard",
            "version": "1.0"
        });
        /* tslint:enable:quotemark object-literal-key-quotes */
        await context.sendActivity(MessageFactory.attachment(card));
    }

    private getHeroCard() {
        return CardFactory.heroCard('BotFramework Hero Card',
            'Build and connect intelligent bots to interact with your users naturally wherever they are,' +
            ' from text/sms to Skype, Slack, Office 365 mail and other popular services.',
            ['https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg'],
            [{ type: ActionTypes.OpenUrl, title: 'Get Started', value: 'https://docs.microsoft.com/bot-framework' }]);
    }

    private getThumbnailCard() {
        return CardFactory.thumbnailCard('BotFramework Thumbnail Card',
            'Build and connect intelligent bots to interact with your users naturally wherever they are,' +
            ' from text/sms to Skype, Slack, Office 365 mail and other popular services.',
            ['https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg'],
            [{ type: ActionTypes.OpenUrl, title: 'Get Started', value: 'https://docs.microsoft.com/bot-framework' }]);
    }

    private getReceiptCard() {
        return CardFactory.receiptCard({
            buttons: [
                {
                    image: 'https://account.windowsazure.com/content/6.10.1.38-.8225.160809-1618/aux-pre/images/offer-icon-freetrial.png',
                    title: 'More information',
                    type: ActionTypes.OpenUrl,
                    value: 'https://azure.microsoft.com/en-us/pricing/'
                }
            ],
            facts: [
                { key: 'Order Number', value: '1234' },
                { key: 'Payment Method', value: 'VISA 5555-****' }
            ],
            items: [
                {
                    image: { url: 'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png' },
                    price: '$ 38.45',
                    quantity: '368',
                    subtitle: '',
                    tap: { title: '', type: '', value: null },
                    text: '',
                    title: 'Data Transfer'
                },
                {
                    image: { url: 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png' },
                    price: '$ 45.00',
                    quantity: '720',
                    subtitle: '',
                    tap: { title: '', type: '', value: null },
                    text: '',
                    title: 'App Service'
                }
            ],
            tap: { title: '', type: '', value: null },
            tax: '$ 7.50',
            title: 'John Doe',
            total: '$ 90.95',
            vat: ''
        });
    }

    private getSigninCard() {
        return CardFactory.signinCard('BotFramework Sign-in Card', 'https://login.microsoftonline.com/', 'Sign-in');
    }

    private getChoices() {
        const actions = this.cardTypes.map((cardType) => ({ type: ActionTypes.MessageBack, title: cardType, text: cardType })) as CardAction[];
        return CardFactory.heroCard('Task Module Invocation from Hero Card', null, actions);
    }

    private async showMembers(context: TurnContext): Promise<void> {
        let teamsChannelAccounts = await TeamsInfo.getMembers(context);
        await context.sendActivity(MessageFactory.text(`Total of ${teamsChannelAccounts.length} members are currently in team`));
        let messages = teamsChannelAccounts.map(function(teamsChannelAccount) {
            return `${teamsChannelAccount.aadObjectId} --> ${teamsChannelAccount.name} --> ${teamsChannelAccount.userPrincipalName}`;
        });
        await this.sendInBatches(context, messages);
    }
    
    private async showChannels(context: TurnContext): Promise<void> { 
        let channels = await TeamsInfo.getTeamChannels(context);
        await context.sendActivity(MessageFactory.text(`Total of ${channels.length} channels are currently in team`));
        let messages = channels.map(function(channel) {
            return `${channel.id} --> ${channel.name ? channel.name : 'General'}`;
        });
        await this.sendInBatches(context, messages);
    }
   
    private async showDetails(context: TurnContext): Promise<void> {
        let teamDetails = await TeamsInfo.getTeamDetails(context);
        await context.sendActivity(MessageFactory.text(`The team name is ${teamDetails.name}. The team ID is ${teamDetails.id}. The AAD GroupID is ${teamDetails.aadGroupId}.`));
    }

    private async sendInBatches(context: TurnContext, messages: string[]): Promise<void> {
        let batch: string[] = [];
        messages.forEach(async (msg: string) => {
            batch.push(msg);
            if (batch.length == 10) {
                await context.sendActivity(MessageFactory.text(batch.join('<br>')));
                batch = [];
            }
        });

        if (batch.length > 0) {
            await context.sendActivity(MessageFactory.text(batch.join('<br>')));
        }
    }
}
