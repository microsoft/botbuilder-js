// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AdaptiveDialogBot, LanguagePolicy } from 'botbuilder-dialogs-adaptive';
import { BotFrameworkAuthentication } from 'botframework-connector';
import { BotTelemetryClient, ConversationState, SkillConversationIdFactoryBase, UserState } from 'botbuilder';
import { Configuration } from './configuration';
import { ConfigurationConstants } from './configurationConstants';
import { Dialog, MemoryScope, PathResolver } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';

const defaultLanguageGeneratorId = 'main.lg';

export class ConfigurationAdaptiveDialogBot extends AdaptiveDialogBot {
    constructor(
        configuration: Configuration,
        resourceExplorer: ResourceExplorer,
        conversationState: ConversationState,
        userState: UserState,
        skillConversationIdFactoryBase: SkillConversationIdFactoryBase,
        languagePolicy: LanguagePolicy,
        botFrameworkAuthentication: BotFrameworkAuthentication,
        telemetryClient: BotTelemetryClient,
        memoryScopes: MemoryScope[] = [],
        pathResolvers: PathResolver[] = [],
        dialogs: Dialog[] = []
    ) {
        const adaptiveDialogId = configuration.string([ConfigurationConstants.RootDialogKey]);
        if (adaptiveDialogId == null) {
            throw new TypeError('defaultRootDialog not found in configuration.');
        }

        super(
            adaptiveDialogId,
            configuration.string([ConfigurationConstants.LanguageGeneratorKey]) ?? defaultLanguageGeneratorId,
            resourceExplorer,
            conversationState,
            userState,
            skillConversationIdFactoryBase,
            languagePolicy,
            botFrameworkAuthentication,
            telemetryClient,
            memoryScopes,
            pathResolvers,
            dialogs
        );
    }
}
