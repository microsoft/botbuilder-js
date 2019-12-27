import { TurnContext, ActivityTypes } from 'botbuilder-core';
import { Configurable } from 'botbuilder-dialogs';
import { TestAction } from '../testAction';
import { AdaptiveTestAdapter } from '../adaptiveTestAdapter';

export interface UserTypingConfiguration {
    user?: string;
}

export class UserTyping extends Configurable implements TestAction {

    public static readonly declarativeType: string = 'Microsoft.Test.UserTyping';

    /**
     * If user is set then the channalAccount.id and channelAccount.name will be from user.
     */
    public user: string;

    public configure(config: UserTypingConfiguration): this {
        return super.configure(config);
    }

    public async execute(testAdapter: AdaptiveTestAdapter, callback: (context: TurnContext) => Promise<any>): Promise<any> {
        const typing = testAdapter.makeActivity();
        typing.type = ActivityTypes.Typing;

        if (this.user) {
            typing.from = Object.assign({}, typing.from);
            typing.from.id = this.user;
            typing.from.name = this.user;
        }

        await testAdapter.processActivity(typing, callback);
    }
}