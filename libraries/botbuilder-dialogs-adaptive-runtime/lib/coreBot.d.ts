import { MemoryScope, PathResolver } from 'botbuilder-dialogs';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { ActivityHandler, BotTelemetryClient, ConversationState, SkillConversationIdFactoryBase, SkillHttpClient, UserState } from 'botbuilder';
export declare class CoreBot extends ActivityHandler {
    constructor(resourceExplorer: ResourceExplorer, userState: UserState, conversationState: ConversationState, skillClient: SkillHttpClient, skillConversationIdFactory: SkillConversationIdFactoryBase, botTelemetryClient: BotTelemetryClient, defaultLocale: string, defaultRootDialog: string, memoryScopes: MemoryScope[], pathResolvers: PathResolver[]);
}
//# sourceMappingURL=coreBot.d.ts.map