import { TurnContext, ActivityTypes } from "botbuilder-core";
import { TestAction } from "../testAction";
import { AdaptiveTestAdapter } from "../adaptiveTestAdapter";

export class UserTyping implements TestAction {
    public static readonly declarativeType: string = 'Microsoft.Test.UserTyping';

    /**
     * If user is set then the channalAccount.id and channelAccount.name will be from user.
     */
    public user: string;

    public async execute(testAdapter: AdaptiveTestAdapter, callback: (context: TurnContext) => Promise<any>) {
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