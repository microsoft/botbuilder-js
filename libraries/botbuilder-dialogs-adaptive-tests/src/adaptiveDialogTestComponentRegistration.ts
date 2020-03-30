import { ComponentRegistration, BuilderRegistration, ResourceExplorer, TypeBuilder } from 'botbuilder-dialogs-declarative';
import { AdaptiveTypeBuilder, ExpressionConverter, StringExpressionConverter, DialogExpressionConverter } from 'botbuilder-dialogs-adaptive';
import { AssertCondition, AssertReply, AssertReplyActivity, AssertReplyOneOf, UserActivity, UserConversationUpdate, UserDelay, UserSays, UserTyping, TestScript } from './testing';

export class AdaptiveDialogTestComponentRegistration implements ComponentRegistration {
    private _resourceExplorer: ResourceExplorer;
    private _builderRegistrations: BuilderRegistration[] = [];

    public constructor(resourceExplorer: ResourceExplorer) {
        this._resourceExplorer = resourceExplorer;
        this.registerBuilder('Microsoft.Test.AssertCondition', new AdaptiveTypeBuilder(AssertCondition, this._resourceExplorer, {
            'condition': new ExpressionConverter(),
            'description': new StringExpressionConverter()
        }));
        this.registerBuilder('Microsoft.Test.AssertReply', new AdaptiveTypeBuilder(AssertReply, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.Test.AssertReplyActivity', new AdaptiveTypeBuilder(AssertReplyActivity, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.Test.AssertReplyOneOf', new AdaptiveTypeBuilder(AssertReplyOneOf, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.Test.UserActivity', new AdaptiveTypeBuilder(UserActivity, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.Test.UserConversationUpdate', new AdaptiveTypeBuilder(UserConversationUpdate, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.Test.UserDelay', new AdaptiveTypeBuilder(UserDelay, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.Test.UserSays', new AdaptiveTypeBuilder(UserSays, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.Test.UserTyping', new AdaptiveTypeBuilder(UserTyping, this._resourceExplorer, {}));
        this.registerBuilder('Microsoft.Test.Script', new AdaptiveTypeBuilder(TestScript, this._resourceExplorer, {
            'dialog': new DialogExpressionConverter(resourceExplorer)
        }));
    }

    public getTypeBuilders(): BuilderRegistration[] {
        return this._builderRegistrations;
    }

    private registerBuilder(name: string, builder: TypeBuilder): void {
        this._builderRegistrations.push(
            new BuilderRegistration(name, builder)
        );
    }
}