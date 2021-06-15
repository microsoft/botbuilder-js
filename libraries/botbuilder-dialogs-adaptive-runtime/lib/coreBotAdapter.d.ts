import { BotFrameworkAdapter, BotFrameworkAdapterSettings, ConversationState, UserState } from 'botbuilder';
export declare class CoreBotAdapter extends BotFrameworkAdapter {
    private readonly conversationState;
    constructor(settings: Partial<BotFrameworkAdapterSettings>, conversationState: ConversationState, userState: UserState);
    private sendErrorMessage;
    private sendEoCToParentIfSkill;
    private clearConversationState;
    private isSkillBot;
}
//# sourceMappingURL=coreBotAdapter.d.ts.map