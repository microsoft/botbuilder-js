// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import memoize from 'lodash/memoize';
import { AdaptiveDialog } from './adaptiveDialog';
import { BotFrameworkAuthentication, BotFrameworkClient, BotFrameworkClientKey } from 'botframework-connector';
import { Dialog, MemoryScope, PathResolver, runDialog } from 'botbuilder-dialogs';
import { LanguagePolicy } from './languagePolicy';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { languageGeneratorKey, languageGeneratorManagerKey, languagePolicyKey } from './languageGeneratorExtensions';
import { resourceExplorerKey } from './resourceExtensions';
import { skillConversationIdFactoryKey } from './skillExtensions';

import {
    ActivityHandler,
    ActivityTypes,
    BotCallbackHandlerKey,
    BotTelemetryClient,
    BotTelemetryClientKey,
    ConversationState,
    SkillConversationIdFactoryBase,
    TurnContext,
    UserState,
} from 'botbuilder';

import {
    LanguageGeneratorManager,
    ResourceMultiLanguageGenerator,
    TemplateEngineLanguageGenerator,
} from './generators';

export class AdaptiveDialogBot extends ActivityHandler {
    private static readonly languageGeneratorManagers = new Map<ResourceExplorer, LanguageGeneratorManager>();

    private readonly lazyRootDialog: () => Dialog;

    constructor(
        private readonly adaptiveDialogId: string,
        private readonly languageGeneratorId: string,
        private readonly resourceExplorer: ResourceExplorer,
        private readonly conversationState: ConversationState,
        private readonly userState: UserState,
        private readonly skillConversationIdFactoryBase: SkillConversationIdFactoryBase,
        private readonly languagePolicy: LanguagePolicy,
        private readonly botFrameworkAuthentication: BotFrameworkAuthentication,
        private readonly telemetryClient: BotTelemetryClient,
        private readonly memoryScopes: MemoryScope[] = [],
        private readonly pathResolvers: PathResolver[] = [],
        private readonly dialogs: Dialog[] = []
    ) {
        super();

        this.lazyRootDialog = memoize(() => this.createDialog());
    }

    protected async onTurnActivity(context: TurnContext): Promise<void> {
        const botFrameworkClient = this.botFrameworkAuthentication.createBotFrameworkClient();

        // Set up the TurnState the Dialog is expecting.
        await this.setUpTurnState(context, botFrameworkClient);

        // Load the Dialog from the ResourceExplorer - the actual load should only happen once.
        const rootDialog = this.lazyRootDialog();

        // Run the dialog.
        await runDialog(
            rootDialog,
            context,
            context.turnState.get<ConversationState>('ConversationState').createProperty('dialogState')
        );

        // Save any updates that have been made.
        await context.turnState.get<ConversationState>('ConversationState').saveChanges(context);
        await context.turnState.get<UserState>('UserState').saveChanges(context);
    }

    private async setUpTurnState(context: TurnContext, botFrameworkClient: BotFrameworkClient): Promise<void> {
        context.turnState.set(BotFrameworkClientKey, botFrameworkClient);
        context.turnState.set(skillConversationIdFactoryKey, this.skillConversationIdFactoryBase);
        context.turnState.set('ConversationState', this.conversationState);
        context.turnState.set('UserState', this.userState);
        context.turnState.set(resourceExplorerKey, this.resourceExplorer);
        context.turnState.set('memoryScopes', this.memoryScopes);
        context.turnState.set('pathResolvers', this.pathResolvers);

        const languageGenerator = this.resourceExplorer.getResource(this.languageGeneratorId)
            ? new ResourceMultiLanguageGenerator(this.languageGeneratorId)
            : new TemplateEngineLanguageGenerator();
        context.turnState.set(languageGeneratorKey, languageGenerator);

        let manager: LanguageGeneratorManager;
        if (!AdaptiveDialogBot.languageGeneratorManagers.has(this.resourceExplorer)) {
            manager = new LanguageGeneratorManager(this.resourceExplorer);
            AdaptiveDialogBot.languageGeneratorManagers.set(this.resourceExplorer, manager);
        } else {
            manager = AdaptiveDialogBot.languageGeneratorManagers.get(this.resourceExplorer);
        }
        context.turnState.set(languageGeneratorManagerKey, manager);

        context.turnState.set(languagePolicyKey, this.languagePolicy);
        context.turnState.set(BotTelemetryClientKey, this.telemetryClient);

        // Catch "setTestOptions" event and save into "conversation.testOptions".
        // Note: This is consumed by AdaptiveExpressions Extensions.RandomNext
        if (context.activity.type === ActivityTypes.Event && context.activity.name === 'setTestOptions') {
            console.log('setTestOptions received. This could change the behavior of AdaptiveExpressions RandomNext');

            await context.turnState
                .get<ConversationState>('ConversationState')
                .createProperty('testOptions')
                .set(context, context.activity.value);
        }

        // Put this on the TurnState using set because some adapters (like BotFrameworkAdapter and CloudAdapter) will have already added it.
        context.turnState.set(BotCallbackHandlerKey, this.onTurn);
    }

    private createDialog(): Dialog {
        const adaptiveDialogResource = this.resourceExplorer.getResource(this.adaptiveDialogId);
        if (!adaptiveDialogResource) {
            throw new Error(`The ResourceExplorer could not find a resource with id "${this.adaptiveDialogId}"`);
        }

        const adaptiveDialog = this.resourceExplorer.loadType<AdaptiveDialog>(adaptiveDialogResource);

        // If we were passed any Dialogs then add them to the AdaptiveDialog's DialogSet so they can be invoked from any other Dialog.
        this.dialogs.forEach((dialog) => {
            adaptiveDialog.dialogs.add(dialog);
        });

        return adaptiveDialog;
    }
}
