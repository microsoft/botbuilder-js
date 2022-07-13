// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotFrameworkAuthentication } from 'botframework-connector';
import { DialogManager, MemoryScope, PathResolver } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';

import {
    ActivityHandler,
    BotTelemetryClient,
    ConversationState,
    SkillConversationIdFactoryBase,
    UserState,
} from 'botbuilder';

import {
    AdaptiveDialog,
    LanguageGeneratorExtensions,
    LanguagePolicy,
    ResourceExtensions,
    SkillExtensions,
    useTelemetry,
} from 'botbuilder-dialogs-adaptive';

/**
 * Implements an instance of CoreBot.
 */
export class CoreBot extends ActivityHandler {
    /**
     * @param resourceExplorer Services to access resources.
     * @param userState Stored user state.
     * @param conversationState Stored conversation state.
     * @param botFrameworkAuthentication Cloud environment to authenticate Bot Framework Protocol network calls within this environment.
     * @param skillConversationIdFactory Methods to create unique conversation IDs for skill conversations.
     * @param botTelemetryClient Bot client to telemetry.
     * @param defaultLocale The default locale used to determine language-specific behavior.
     * @param defaultRootDialog Default bot root dialog.
     * @param memoryScopes Named root-level objects, which can exist in the dialog context or outside the turn state.
     * @param pathResolvers Shortcut behavior for transform paths.
     */
    constructor(
        resourceExplorer: ResourceExplorer,
        userState: UserState,
        conversationState: ConversationState,
        botFrameworkAuthentication: BotFrameworkAuthentication,
        skillConversationIdFactory: SkillConversationIdFactoryBase,
        botTelemetryClient: BotTelemetryClient,
        defaultLocale: string,
        defaultRootDialog: string,
        memoryScopes: MemoryScope[],
        pathResolvers: PathResolver[]
    ) {
        super();

        const rootResource = resourceExplorer.getResource(defaultRootDialog);
        const rootDialog = resourceExplorer.loadType<AdaptiveDialog>(rootResource);
        const skillClient = botFrameworkAuthentication.createBotFrameworkClient();

        const dialogManager = new DialogManager(rootDialog).configure({
            conversationState,
            userState,
        });

        ResourceExtensions.useResourceExplorer(dialogManager, resourceExplorer);
        LanguageGeneratorExtensions.useLanguageGeneration(dialogManager);
        LanguageGeneratorExtensions.useLanguagePolicy(dialogManager, new LanguagePolicy(defaultLocale));

        // Inserts skills dependencies into initial turn state
        SkillExtensions.useSkillClient(dialogManager, skillClient);
        SkillExtensions.useSkillConversationIdFactory(dialogManager, skillConversationIdFactory);

        useTelemetry(dialogManager, botTelemetryClient);

        if (memoryScopes.length) {
            dialogManager.initialTurnState.set('memoryScopes', memoryScopes);
        }

        if (pathResolvers.length) {
            dialogManager.initialTurnState.set('pathResolvers', pathResolvers);
        }

        this.onTurn(async (turnContext) => {
            await dialogManager.onTurn(turnContext);
            await conversationState.saveChanges(turnContext, false);
            await userState.saveChanges(turnContext, false);
        });
    }
}
