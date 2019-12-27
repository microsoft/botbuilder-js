import {
    ComponentRegistration, TypeRegistration, ConfigurableTypeBuilder
} from 'botbuilder-dialogs-declarative';
import {
    TestScript, UserSays, UserDelay, UserConversationUpdate, UserActivity,
    UserTyping, AssertReplyActivity, AssertReply, AssertReplyOneOf, AssertCondition
} from './testing';

export class AdaptiveTestComponentRegistration implements ComponentRegistration {
    public getTypes(): TypeRegistration[] {
        const types = [];
        types.push(new TypeRegistration(TestScript.declarativeType, new ConfigurableTypeBuilder(TestScript)));
        types.push(new TypeRegistration(UserSays.declarativeType, new ConfigurableTypeBuilder(UserSays)));
        types.push(new TypeRegistration(UserDelay.declarativeType, new ConfigurableTypeBuilder(UserDelay)));
        types.push(new TypeRegistration(UserConversationUpdate.declarativeType, new ConfigurableTypeBuilder(UserConversationUpdate)));
        types.push(new TypeRegistration(UserActivity.declarativeType, new ConfigurableTypeBuilder(UserActivity)));
        types.push(new TypeRegistration(UserTyping.declarativeType, new ConfigurableTypeBuilder(UserTyping)));
        types.push(new TypeRegistration(AssertReplyActivity.declarativeType, new ConfigurableTypeBuilder(AssertReplyActivity)));
        types.push(new TypeRegistration(AssertReply.declarativeType, new ConfigurableTypeBuilder(AssertReply)));
        types.push(new TypeRegistration(AssertReplyOneOf.declarativeType, new ConfigurableTypeBuilder(AssertReplyOneOf)));
        types.push(new TypeRegistration(AssertCondition.declarativeType, new ConfigurableTypeBuilder(AssertCondition)));
        return types;
    }
}