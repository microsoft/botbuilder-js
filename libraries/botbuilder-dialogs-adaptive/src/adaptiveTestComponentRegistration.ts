import { ComponentRegistration, TypeRegistration, DefaultTypeBuilder } from "botbuilder-dialogs-declarative";
import { TestScript, UserSays, UserDelay, UserConversationUpdate, UserActivity, UserTyping, AssertReplyActivity, AssertReply, AssertReplyOneOf, AssertCondition } from "./testing";

export class AdaptiveTestComponentRegistration implements ComponentRegistration {
    getTypes(): TypeRegistration[] {
        const types = [];
        types.push(new TypeRegistration(TestScript.declarativeType, new DefaultTypeBuilder(TestScript)));
        types.push(new TypeRegistration(UserSays.declarativeType, new DefaultTypeBuilder(UserSays)));
        types.push(new TypeRegistration(UserDelay.declarativeType, new DefaultTypeBuilder(UserDelay)));
        types.push(new TypeRegistration(UserConversationUpdate.declarativeType, new DefaultTypeBuilder(UserConversationUpdate)));
        types.push(new TypeRegistration(UserActivity.declarativeType, new DefaultTypeBuilder(UserActivity)));
        types.push(new TypeRegistration(UserTyping.declarativeType, new DefaultTypeBuilder(UserTyping)));
        types.push(new TypeRegistration(AssertReplyActivity.declarativeType, new DefaultTypeBuilder(AssertReplyActivity)));
        types.push(new TypeRegistration(AssertReply.declarativeType, new DefaultTypeBuilder(AssertReply)));
        types.push(new TypeRegistration(AssertReplyOneOf.declarativeType, new DefaultTypeBuilder(AssertReplyOneOf)));
        types.push(new TypeRegistration(AssertCondition.declarativeType, new DefaultTypeBuilder(AssertCondition)));
        return types;
    }
}