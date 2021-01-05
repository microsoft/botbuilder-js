/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { OnTeamsAppBasedLinkQuery } from './conditions/onTeamsAppBasedLinkQuery';
import { ComponentDeclarativeTypes } from 'botbuilder-dialogs-declarative';
import { AdaptiveComponentRegistration, OnActivityConfiguration } from 'botbuilder-dialogs-adaptive';
import {
    OnTeamsCardAction,
    OnTeamsChannelCreated,
    OnTeamsChannelDeleted,
    OnTeamsChannelRenamed,
    OnTeamsChannelRestored,
    OnTeamsFileConsent,
    OnTeamsMessagingExtensionBotMessagePreviewEdit,
    OnTeamsMessagingExtensionBotMessagePreviewSend,
    OnTeamsMessagingExtensionCardButtonClicked,
    OnTeamsMessagingExtensionConfigurationQuerySettingUrl,
    OnTeamsMessagingExtensionConfigurationSetting,
    OnTeamsMessagingExtensionFetchTask,
    OnTeamsMessagingExtensionQuery,
    OnTeamsMessagingExtensionSelectItem,
    OnTeamsMessagingExtensionSubmitAction,
    OnTeamsO365ConnectorCardAction,
    OnTeamsTaskModuleFetch,
    OnTeamsTaskModuleSubmit,
    OnTeamsTeamArchived,
    OnTeamsTeamDeleted,
    OnTeamsTeamHardDeleted,
    OnTeamsTeamRenamed,
    OnTeamsTeamRestored,
    OnTeamsTeamUnarchived,
} from './conditions';
import {
    GetMeetingParticipant,
    GetMeetingParticipantConfiguration,
    GetMember,
    GetMemberConfiguration,
    GetPagedMembers,
    GetPagedMembersConfiguration,
    GetPagedTeamMembers,
    GetPagedTeamMembersConfiguration,
    GetTeamChannels,
    GetTeamChannelsConfiguration,
    GetTeamDetails,
    GetTeamDetailsConfiguration,
    GetTeamMember,
    GetTeamMemberConfiguration,
    SendAppBasedLinkQueryResponse,
    SendAppBasedLinkQueryResponseConfiguration,
    SendMessageToTeamsChannel,
    SendMessagingExtensionActionResponse,
    SendMessagingExtensionActionResponseConfiguration,
    SendMessagingExtensionAttachmentsResponse,
    SendMessagingExtensionAttachmentsResponseConfiguration,
    SendMessagingExtensionAuthResponse,
    SendMessagingExtensionAuthResponseConfiguration,
    SendMessagingExtensionBotMessagePreviewResponse,
    SendMessagingExtensionBotMessagePreviewResponseConfiguration,
    SendMessagingExtensionConfigQuerySettingUrlResponse,
    SendMessagingExtensionConfigQuerySettingUrlResponseConfiguration,
    SendMessagingExtensionMessageResponse,
    SendMessagingExtensionMessageResponseConfiguration,
    SendMessagingExtensionSelectItemResponse,
    SendMessagingExtensionSelectItemResponseConfiguration,
    SendTaskModuleCardResponse,
    SendTaskModuleCardResponseConfiguration,
    SendTaskModuleMessageResponse,
    SendTaskModuleMessageResponseConfiguration,
    SendTaskModuleUrlResponse,
    SendTaskModuleUrlResponseConfiguration,
} from './actions';

/* eslint-disable prettier/prettier */
/* eslint-reason It's extremely difficult to read with limited line widths.*/
export class TeamsComponentRegistration extends AdaptiveComponentRegistration implements ComponentDeclarativeTypes {
    /**
     * Initializes a new instance of `TeamsComponentRegistration`.
     */
    public constructor() {
        super();

        // Actions
        this._addDeclarativeType<GetMeetingParticipant, GetMeetingParticipantConfiguration>(GetMeetingParticipant);
        this._addDeclarativeType<GetMember, GetMemberConfiguration>(GetMember);
        this._addDeclarativeType<GetPagedMembers, GetPagedMembersConfiguration>(GetPagedMembers);
        this._addDeclarativeType<GetPagedTeamMembers, GetPagedTeamMembersConfiguration>(GetPagedTeamMembers);
        this._addDeclarativeType<GetTeamChannels, GetTeamChannelsConfiguration>(GetTeamChannels);
        this._addDeclarativeType<GetTeamDetails, GetTeamDetailsConfiguration>(GetTeamDetails);
        this._addDeclarativeType<GetTeamMember, GetTeamMemberConfiguration>(GetTeamMember);
        this._addDeclarativeType<SendAppBasedLinkQueryResponse, SendAppBasedLinkQueryResponseConfiguration>(SendAppBasedLinkQueryResponse);
        this._addDeclarativeType<SendMessageToTeamsChannel, SendMessageToTeamsChannel>(SendMessageToTeamsChannel);
        this._addDeclarativeType<SendMessagingExtensionActionResponse, SendMessagingExtensionActionResponseConfiguration>(SendMessagingExtensionActionResponse);
        this._addDeclarativeType<SendMessagingExtensionAttachmentsResponse,SendMessagingExtensionAttachmentsResponseConfiguration>(SendMessagingExtensionAttachmentsResponse);
        this._addDeclarativeType<SendMessagingExtensionAuthResponse, SendMessagingExtensionAuthResponseConfiguration>(SendMessagingExtensionAuthResponse);
        this._addDeclarativeType<SendMessagingExtensionBotMessagePreviewResponse,SendMessagingExtensionBotMessagePreviewResponseConfiguration>(SendMessagingExtensionBotMessagePreviewResponse);
        this._addDeclarativeType<SendMessagingExtensionConfigQuerySettingUrlResponse,SendMessagingExtensionConfigQuerySettingUrlResponseConfiguration>(SendMessagingExtensionConfigQuerySettingUrlResponse);
        this._addDeclarativeType<SendMessagingExtensionMessageResponse,SendMessagingExtensionMessageResponseConfiguration>(SendMessagingExtensionMessageResponse);
        this._addDeclarativeType<SendMessagingExtensionSelectItemResponse,SendMessagingExtensionSelectItemResponseConfiguration>(SendMessagingExtensionSelectItemResponse);
        this._addDeclarativeType<SendTaskModuleCardResponse, SendTaskModuleCardResponseConfiguration>(SendTaskModuleCardResponse);
        this._addDeclarativeType<SendTaskModuleMessageResponse, SendTaskModuleMessageResponseConfiguration>(SendTaskModuleMessageResponse);
        this._addDeclarativeType<SendTaskModuleUrlResponse, SendTaskModuleUrlResponseConfiguration>(SendTaskModuleUrlResponse);

        // Conditions
        this._addDeclarativeType<OnTeamsAppBasedLinkQuery, OnActivityConfiguration>(OnTeamsAppBasedLinkQuery);
        this._addDeclarativeType<OnTeamsCardAction, OnActivityConfiguration>(OnTeamsCardAction);
        this._addDeclarativeType<OnTeamsChannelCreated, OnActivityConfiguration>(OnTeamsChannelCreated);
        this._addDeclarativeType<OnTeamsChannelDeleted, OnActivityConfiguration>(OnTeamsChannelDeleted);
        this._addDeclarativeType<OnTeamsChannelRenamed, OnActivityConfiguration>(OnTeamsChannelRenamed);
        this._addDeclarativeType<OnTeamsChannelRestored, OnActivityConfiguration>(OnTeamsChannelRestored);
        this._addDeclarativeType<OnTeamsFileConsent, OnActivityConfiguration>(OnTeamsFileConsent);
        this._addDeclarativeType<OnTeamsMessagingExtensionBotMessagePreviewEdit, OnActivityConfiguration>(OnTeamsMessagingExtensionBotMessagePreviewEdit);
        this._addDeclarativeType<OnTeamsMessagingExtensionBotMessagePreviewSend, OnActivityConfiguration>(OnTeamsMessagingExtensionBotMessagePreviewSend);
        this._addDeclarativeType<OnTeamsMessagingExtensionCardButtonClicked, OnActivityConfiguration>(OnTeamsMessagingExtensionCardButtonClicked);
        this._addDeclarativeType<OnTeamsMessagingExtensionConfigurationQuerySettingUrl, OnActivityConfiguration>(OnTeamsMessagingExtensionConfigurationQuerySettingUrl);
        this._addDeclarativeType<OnTeamsMessagingExtensionFetchTask, OnActivityConfiguration>(OnTeamsMessagingExtensionFetchTask);
        this._addDeclarativeType<OnTeamsMessagingExtensionQuery, OnActivityConfiguration>(OnTeamsMessagingExtensionQuery);
        this._addDeclarativeType<OnTeamsMessagingExtensionSelectItem, OnActivityConfiguration>(OnTeamsMessagingExtensionSelectItem);
        this._addDeclarativeType<OnTeamsMessagingExtensionConfigurationSetting, OnActivityConfiguration>(OnTeamsMessagingExtensionConfigurationSetting);
        this._addDeclarativeType<OnTeamsMessagingExtensionSubmitAction, OnActivityConfiguration>(OnTeamsMessagingExtensionSubmitAction);
        this._addDeclarativeType<OnTeamsO365ConnectorCardAction, OnActivityConfiguration>(OnTeamsO365ConnectorCardAction);
        this._addDeclarativeType<OnTeamsTaskModuleFetch, OnActivityConfiguration>(OnTeamsTaskModuleFetch);
        this._addDeclarativeType<OnTeamsTaskModuleSubmit, OnActivityConfiguration>(OnTeamsTaskModuleSubmit);
        this._addDeclarativeType<OnTeamsTeamArchived, OnActivityConfiguration>(OnTeamsTeamArchived);
        this._addDeclarativeType<OnTeamsTeamDeleted, OnActivityConfiguration>(OnTeamsTeamDeleted);
        this._addDeclarativeType<OnTeamsTeamHardDeleted, OnActivityConfiguration>(OnTeamsTeamHardDeleted);
        this._addDeclarativeType<OnTeamsTeamRenamed, OnActivityConfiguration>(OnTeamsTeamRenamed);
        this._addDeclarativeType<OnTeamsTeamRestored, OnActivityConfiguration>(OnTeamsTeamRestored);
        this._addDeclarativeType<OnTeamsTeamUnarchived, OnActivityConfiguration>(OnTeamsTeamUnarchived);
    }
}