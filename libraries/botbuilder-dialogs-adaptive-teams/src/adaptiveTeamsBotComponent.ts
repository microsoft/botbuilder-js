// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotComponent } from 'botbuilder';
import { ComponentDeclarativeTypes } from 'botbuilder-dialogs-declarative';
import { Configuration, ServiceCollection } from 'botbuilder-dialogs-adaptive-runtime-core';

import {
    GetMeetingParticipant,
    GetMember,
    GetPagedMembers,
    GetPagedTeamMembers,
    GetTeamChannels,
    GetTeamDetails,
    GetTeamMember,
    SendAppBasedLinkQueryResponse,
    SendMEActionResponse,
    SendMEAttachmentsResponse,
    SendMEAuthResponse,
    SendMEBotMessagePreviewResponse,
    SendMEConfigQuerySettingUrlResponse,
    SendMEMessageResponse,
    SendMESelectItemResponse,
    SendMessageToTeamsChannel,
    SendTabAuthResponse,
    SendTabCardResponse,
    SendTaskModuleCardResponse,
    SendTaskModuleMessageResponse,
    SendTaskModuleUrlResponse,
} from './actions';

import {
    OnTeamsAppBasedLinkQuery,
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
    OnTeamsMEConfigSetting,
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

export class AdaptiveTeamsBotComponent extends BotComponent {
    configureServices(services: ServiceCollection, _configuration: Configuration): void {
        services.composeFactory<ComponentDeclarativeTypes[]>('declarativeTypes', (declarativeTypes) =>
            declarativeTypes.concat({
                getDeclarativeTypes() {
                    return [
                        // Actions
                        { kind: GetMeetingParticipant.$kind, type: GetMeetingParticipant },
                        { kind: GetMember.$kind, type: GetMember },
                        { kind: GetPagedMembers.$kind, type: GetPagedMembers },
                        { kind: GetPagedTeamMembers.$kind, type: GetPagedTeamMembers },
                        { kind: GetTeamChannels.$kind, type: GetTeamChannels },
                        { kind: GetTeamDetails.$kind, type: GetTeamDetails },
                        { kind: GetTeamMember.$kind, type: GetTeamMember },
                        { kind: SendAppBasedLinkQueryResponse.$kind, type: SendAppBasedLinkQueryResponse },
                        { kind: SendMEActionResponse.$kind, type: SendMEActionResponse },
                        { kind: SendMEAttachmentsResponse.$kind, type: SendMEAttachmentsResponse },
                        { kind: SendMEAuthResponse.$kind, type: SendMEAuthResponse },
                        { kind: SendMEBotMessagePreviewResponse.$kind, type: SendMEBotMessagePreviewResponse },
                        { kind: SendMEConfigQuerySettingUrlResponse.$kind, type: SendMEConfigQuerySettingUrlResponse },
                        { kind: SendMEMessageResponse.$kind, type: SendMEMessageResponse },
                        { kind: SendMESelectItemResponse.$kind, type: SendMESelectItemResponse },
                        { kind: SendMessageToTeamsChannel.$kind, type: SendMessageToTeamsChannel },
                        { kind: SendTabAuthResponse.$kind, type: SendTabAuthResponse },
                        { kind: SendTabCardResponse.$kind, type: SendTabCardResponse },
                        { kind: SendTaskModuleCardResponse.$kind, type: SendTaskModuleCardResponse },
                        { kind: SendTaskModuleMessageResponse.$kind, type: SendTaskModuleMessageResponse },
                        { kind: SendTaskModuleUrlResponse.$kind, type: SendTaskModuleUrlResponse },

                        // Conditions
                        { kind: OnTeamsAppBasedLinkQuery.$kind, type: OnTeamsAppBasedLinkQuery },
                        { kind: OnTeamsCardAction.$kind, type: OnTeamsCardAction },
                        { kind: OnTeamsChannelCreated.$kind, type: OnTeamsChannelCreated },
                        { kind: OnTeamsChannelDeleted.$kind, type: OnTeamsChannelDeleted },
                        { kind: OnTeamsChannelRenamed.$kind, type: OnTeamsChannelRenamed },
                        { kind: OnTeamsChannelRestored.$kind, type: OnTeamsChannelRestored },
                        { kind: OnTeamsFileConsent.$kind, type: OnTeamsFileConsent },
                        { kind: OnTeamsMEBotMessagePreviewEdit.$kind, type: OnTeamsMEBotMessagePreviewEdit },
                        { kind: OnTeamsMEBotMessagePreviewSend.$kind, type: OnTeamsMEBotMessagePreviewSend },
                        { kind: OnTeamsMECardButtonClicked.$kind, type: OnTeamsMECardButtonClicked },
                        { kind: OnTeamsMEConfigSetting.$kind, type: OnTeamsMEConfigSetting },
                        { kind: OnTeamsMEConfigQuerySettingUrl.$kind, type: OnTeamsMEConfigQuerySettingUrl },
                        { kind: OnTeamsMEFetchTask.$kind, type: OnTeamsMEFetchTask },
                        { kind: OnTeamsMEQuery.$kind, type: OnTeamsMEQuery },
                        { kind: OnTeamsMESelectItem.$kind, type: OnTeamsMESelectItem },
                        { kind: OnTeamsMEConfigurationSetting.$kind, type: OnTeamsMEConfigurationSetting },
                        { kind: OnTeamsMESubmitAction.$kind, type: OnTeamsMESubmitAction },
                        { kind: OnTeamsO365ConnectorCardAction.$kind, type: OnTeamsO365ConnectorCardAction },
                        { kind: OnTeamsTabFetch.$kind, type: OnTeamsTabFetch },
                        { kind: OnTeamsTabSubmit.$kind, type: OnTeamsTabSubmit },
                        { kind: OnTeamsTaskModuleFetch.$kind, type: OnTeamsTaskModuleFetch },
                        { kind: OnTeamsTaskModuleSubmit.$kind, type: OnTeamsTaskModuleSubmit },
                        { kind: OnTeamsTeamArchived.$kind, type: OnTeamsTeamArchived },
                        { kind: OnTeamsTeamDeleted.$kind, type: OnTeamsTeamDeleted },
                        { kind: OnTeamsTeamHardDeleted.$kind, type: OnTeamsTeamHardDeleted },
                        { kind: OnTeamsTeamRenamed.$kind, type: OnTeamsTeamRenamed },
                        { kind: OnTeamsTeamRestored.$kind, type: OnTeamsTeamRestored },
                        { kind: OnTeamsTeamUnarchived.$kind, type: OnTeamsTeamUnarchived },
                    ];
                },
            })
        );
    }
}
