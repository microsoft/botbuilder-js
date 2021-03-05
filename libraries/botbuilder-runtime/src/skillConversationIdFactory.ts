// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    ConversationReference,
    SkillConversationIdFactoryBase,
    SkillConversationIdFactoryOptions,
    SkillConversationReference,
    Storage,
    TurnContext,
} from 'botbuilder';

export class SkillConversationIdFactory extends SkillConversationIdFactoryBase {
    constructor(private readonly storage: Storage) {
        super();
    }

    public async createSkillConversationIdWithOptions(options: SkillConversationIdFactoryOptions): Promise<string> {
        const conversationReference = TurnContext.getConversationReference(options.activity);

        const skillConversationId = [
            options.fromBotId,
            options.botFrameworkSkill.appId,
            conversationReference.conversation?.id,
            conversationReference.channelId,
        ].join('-');

        const skillConversationReference: SkillConversationReference = {
            conversationReference: conversationReference as ConversationReference,
            oAuthScope: options.fromBotOAuthScope,
        };

        await this.storage.write({ [skillConversationId]: skillConversationReference });

        return skillConversationId;
    }

    public async getSkillConversationReference(skillConversationId: string): Promise<SkillConversationReference> {
        const skillConversationInfo = await this.storage.read([skillConversationId]);
        if (!skillConversationInfo) {
            return undefined!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        }

        const skillConversationReference = skillConversationInfo[skillConversationId];
        if (!skillConversationReference) {
            return undefined!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        }

        return skillConversationReference as SkillConversationReference;
    }

    deleteConversationReference(skillConversationId: string): Promise<void> {
        return this.storage.delete([skillConversationId]);
    }
}
