import { TurnContext } from "botbuilder-core";
import { TestAction } from "../testAction";
import { AdaptiveTestAdapter } from "../adaptiveTestAdapter";

export class UserDelay implements TestAction {
    public static readonly declarativeType: string = 'Microsoft.Test.UserDelay';

    /**
     * The timespan in milliseconds to delay.
     */
    public timespan: number;

    public async execute(_testAdapter: AdaptiveTestAdapter, _callback: (context: TurnContext) => Promise<any>) {
        await Promise.resolve(resolve => setTimeout(resolve, this.timespan));
    }
}