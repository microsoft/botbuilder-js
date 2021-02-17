/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { OnTeamsAppBasedLinkQuery } from './conditions/onTeamsAppBasedLinkQuery';
import {
    ComponentDeclarativeTypes,
    CustomDeserializer,
    DeclarativeType,
    ResourceExplorer,
} from 'botbuilder-dialogs-declarative';
import { OnActivityConfiguration } from 'botbuilder-dialogs-adaptive';
import {
    OnTeamsCardAction,
    OnTeamsChannelCreated,
    OnTeamsChannelDeleted,
    OnTeamsChannelRenamed,
    OnTeamsChannelRestored,
    OnTeamsFileConsent,
    OnTeamsMEBotMessagePreviewEdit,
    OnTeamsMEBotMessagePreviewSend,
    OnTeamsMECardButtonClicked,
    OnTeamsMEConfigQuerySettingUrl,
    OnTeamsMEConfigurationSetting,
    OnTeamsMEFetchTask,
    OnTeamsMEQuery,
    OnTeamsMESelectItem,
    OnTeamsMESubmitAction,
    OnTeamsO365ConnectorCardAction,
    OnTeamsTabFetch,
    OnTeamsTabSubmit,
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
    SendMEActionResponse,
    SendMEActionResponseConfiguration,
    SendMEAttachmentsResponse,
    SendMEAttachmentsResponseConfiguration,
    SendMEAuthResponse,
    SendMEBotMessagePreviewResponse,
    SendMEBotMessagePreviewResponseConfiguration,
    SendMEConfigQuerySettingUrlResponse,
    SendMEConfigQuerySettingUrlResponseConfiguration,
    SendMEMessageResponse,
    SendMEMessageResponseConfiguration,
    SendMESelectItemResponse,
    SendMESelectItemResponseConfiguration,
    SendTaskModuleCardResponse,
    SendTaskModuleCardResponseConfiguration,
    SendTaskModuleMessageResponse,
    SendTaskModuleMessageResponseConfiguration,
    SendTaskModuleUrlResponse,
    SendTaskModuleUrlResponseConfiguration,
} from './actions';
import { ComponentRegistration } from 'botbuilder';
import { Dialog } from 'botbuilder-dialogs';
import { BaseAuthResponseDialogConfiguration } from './actions/baseAuthResponseDialog';
import { SendTabAuthResponse } from './actions/sendTabAuthResponse';
import { SendTabCardResponse } from './actions/sendTabCardResponse';
import { OnTeamsMEConfigSetting } from './conditions/onTeamsMEConfigSetting';

type ActionType<T> = {
    $kind: string;
    new (dialogId?: string | undefined): T;
};

type ConditionType<T> = {
    $kind: string;
    new (actions?: Dialog<Record<string, unknown>>[] | undefined, condition?: string | undefined): T;
};

type Type<T> = {
    $kind: string;
    new (...args: unknown[]): T;
};

/* eslint-disable prettier/prettier */
/* eslint-reason It's extremely difficult to read with limited line widths.*/
export class TeamsComponentRegistration extends ComponentRegistration implements ComponentDeclarativeTypes {
    private _declarativeTypes: DeclarativeType<unknown, unknown>[] = [];

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
        this._addDeclarativeType<SendMEActionResponse, SendMEActionResponseConfiguration>(SendMEActionResponse);
        this._addDeclarativeType<SendMEAttachmentsResponse,SendMEAttachmentsResponseConfiguration>(SendMEAttachmentsResponse);
        this._addDeclarativeType<SendMEAuthResponse, BaseAuthResponseDialogConfiguration>(SendMEAuthResponse);
        this._addDeclarativeType<SendMEBotMessagePreviewResponse,SendMEBotMessagePreviewResponseConfiguration>(SendMEBotMessagePreviewResponse);
        this._addDeclarativeType<SendMEConfigQuerySettingUrlResponse,SendMEConfigQuerySettingUrlResponseConfiguration>(SendMEConfigQuerySettingUrlResponse);
        this._addDeclarativeType<SendMEMessageResponse,SendMEMessageResponseConfiguration>(SendMEMessageResponse);
        this._addDeclarativeType<SendMESelectItemResponse,SendMESelectItemResponseConfiguration>(SendMESelectItemResponse);
        this._addDeclarativeType<SendTaskModuleCardResponse, SendTaskModuleCardResponseConfiguration>(SendTaskModuleCardResponse);
        this._addDeclarativeType<SendTaskModuleMessageResponse, SendTaskModuleMessageResponseConfiguration>(SendTaskModuleMessageResponse);
        this._addDeclarativeType<SendTaskModuleUrlResponse, SendTaskModuleUrlResponseConfiguration>(SendTaskModuleUrlResponse);
        this._addDeclarativeType<SendTabAuthResponse, BaseAuthResponseDialogConfiguration>(SendTabAuthResponse);
        this._addDeclarativeType<SendTabCardResponse, BaseAuthResponseDialogConfiguration>(SendTabCardResponse);

        // Conditions
        this._addDeclarativeType<OnTeamsAppBasedLinkQuery, OnActivityConfiguration>(OnTeamsAppBasedLinkQuery);
        this._addDeclarativeType<OnTeamsCardAction, OnActivityConfiguration>(OnTeamsCardAction);
        this._addDeclarativeType<OnTeamsChannelCreated, OnActivityConfiguration>(OnTeamsChannelCreated);
        this._addDeclarativeType<OnTeamsChannelDeleted, OnActivityConfiguration>(OnTeamsChannelDeleted);
        this._addDeclarativeType<OnTeamsChannelRenamed, OnActivityConfiguration>(OnTeamsChannelRenamed);
        this._addDeclarativeType<OnTeamsChannelRestored, OnActivityConfiguration>(OnTeamsChannelRestored);
        this._addDeclarativeType<OnTeamsFileConsent, OnActivityConfiguration>(OnTeamsFileConsent);
        this._addDeclarativeType<OnTeamsMEBotMessagePreviewEdit, OnActivityConfiguration>(OnTeamsMEBotMessagePreviewEdit);
        this._addDeclarativeType<OnTeamsMEBotMessagePreviewSend, OnActivityConfiguration>(OnTeamsMEBotMessagePreviewSend);
        this._addDeclarativeType<OnTeamsMECardButtonClicked, OnActivityConfiguration>(OnTeamsMECardButtonClicked);
        this._addDeclarativeType<OnTeamsMEConfigSetting, OnActivityConfiguration>(OnTeamsMEConfigSetting);
        this._addDeclarativeType<OnTeamsMEConfigQuerySettingUrl, OnActivityConfiguration>(OnTeamsMEConfigQuerySettingUrl);
        this._addDeclarativeType<OnTeamsMEFetchTask, OnActivityConfiguration>(OnTeamsMEFetchTask);
        this._addDeclarativeType<OnTeamsMEQuery, OnActivityConfiguration>(OnTeamsMEQuery);
        this._addDeclarativeType<OnTeamsMESelectItem, OnActivityConfiguration>(OnTeamsMESelectItem);
        this._addDeclarativeType<OnTeamsMEConfigurationSetting, OnActivityConfiguration>(OnTeamsMEConfigurationSetting);
        this._addDeclarativeType<OnTeamsMESubmitAction, OnActivityConfiguration>(OnTeamsMESubmitAction);
        this._addDeclarativeType<OnTeamsO365ConnectorCardAction, OnActivityConfiguration>(OnTeamsO365ConnectorCardAction);
        this._addDeclarativeType<OnTeamsTabFetch, OnActivityConfiguration>(OnTeamsTabFetch);
        this._addDeclarativeType<OnTeamsTabSubmit, OnActivityConfiguration>(OnTeamsTabSubmit);
        this._addDeclarativeType<OnTeamsTaskModuleFetch, OnActivityConfiguration>(OnTeamsTaskModuleFetch);
        this._addDeclarativeType<OnTeamsTaskModuleSubmit, OnActivityConfiguration>(OnTeamsTaskModuleSubmit);
        this._addDeclarativeType<OnTeamsTeamArchived, OnActivityConfiguration>(OnTeamsTeamArchived);
        this._addDeclarativeType<OnTeamsTeamDeleted, OnActivityConfiguration>(OnTeamsTeamDeleted);
        this._addDeclarativeType<OnTeamsTeamHardDeleted, OnActivityConfiguration>(OnTeamsTeamHardDeleted);
        this._addDeclarativeType<OnTeamsTeamRenamed, OnActivityConfiguration>(OnTeamsTeamRenamed);
        this._addDeclarativeType<OnTeamsTeamRestored, OnActivityConfiguration>(OnTeamsTeamRestored);
        this._addDeclarativeType<OnTeamsTeamUnarchived, OnActivityConfiguration>(OnTeamsTeamUnarchived);
    }

    /**
     * Gets adaptive testing `DeclarativeType` resources.
     *
     * @param {ResourceExplorer} _resourceExplorer  `ResourceExplorer` with expected path to get all resources.
     * @returns {DeclarativeType[]} Adaptive testing `DeclarativeType` resources.
     */
    public getDeclarativeTypes(_resourceExplorer: ResourceExplorer): DeclarativeType[] {
        return this._declarativeTypes;
    }

    private _addDeclarativeType<T, C>(type: ActionType<T> | ConditionType<T>, loader?: CustomDeserializer<T, C>): void {
        const declarativeType: DeclarativeType<T, C> = {
            kind: type.$kind,
            type: <Type<T>>type,
            loader,
        };
        this._declarativeTypes.push(declarativeType);
    }
}