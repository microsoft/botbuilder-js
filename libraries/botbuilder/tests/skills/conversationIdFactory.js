const { SkillConversationIdFactoryBase, TurnContext } = require('botbuilder-core');

class ConversationIdFactory extends SkillConversationIdFactoryBase {
    constructor() {
        super();
        this.refs = {};
        this.skillId = 'skillId';
        this.disableCreateWithOptions = false;
        this.disableGetSkillConversationReference = false;
    }

    async createSkillConversationIdWithOptions(options) {
        if (this.disableCreateWithOptions) super.createSkillConversationIdWithOptions();
        this.refs[this.skillId] = {
            conversationReference: TurnContext.getConversationReference(options.activity),
            oAuthScope: options.fromBotOAuthScope
        };
        return this.skillId;
    }

    async getSkillConversationReference(skillConversationId) {
        if (this.disableGetSkillConversationReference) super.createSkillConversationIdWithOptions();
        return this.refs[skillConversationId];
    }

    // Deprecated method
    async createSkillConversationId(convRef = { conversation: { id: undefined }}) {
        this.refs[this.skillId] = convRef;
        return this.skillId;
    }

    // Deprecated method
    async getConversationReference(skillConversationId) {
        return this.refs[skillConversationId];
    }

    async deleteConversationReference(skillConversationId) {
        this.refs[skillConversationId] = undefined;
    }
}

module.exports.ConversationIdFactory = ConversationIdFactory;
