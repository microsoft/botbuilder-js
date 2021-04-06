// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ConversationReference } from 'botframework-schema';
import { SkillConversationIdFactoryBase } from './skillConversationIdFactoryBase';
import { SkillConversationIdFactoryOptions } from './skillConversationIdFactoryOptions';
import { SkillConversationReference } from './skillConversationReference';
import { Storage } from '../storage';
import { TurnContext } from '../turnContext';
import { v4 as uuid } from 'uuid';

export class SkillConversationIdFactory extends SkillConversationIdFactoryBase {
    constructor(private readonly storage: Storage) {
        super();
    }

    public async createSkillConversationIdWithOptions(options: SkillConversationIdFactoryOptions): Promise<string> {
        const conversationReference = TurnContext.getConversationReference(options.activity);

        const skillConversationId = uuid();

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
