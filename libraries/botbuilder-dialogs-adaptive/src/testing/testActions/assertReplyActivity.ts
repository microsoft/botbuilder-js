import { Activity, TurnContext } from "botbuilder-core";
import { ExpressionEngine } from "botframework-expressions";
import { TestAction } from "../testAction";
import { AdaptiveTestAdapter } from "../adaptiveTestAdapter";

export class AssertReplyActivity implements TestAction {
    public static readonly declarativeType: string = 'Microsoft.Test.AssertReplyActivity';

    /**
     * Description of what this assertion is.
     */
    public description: string;

    /**
     * The milliseconds to wait for a reply.
     */
    public timeout: number = 3000;

    /**
     * The expressions for assertions.
     */
    public assertions: string[];

    public getConditionDescription(): string {
        return this.description || this.assertions.join('\n');
    }

    public validateReply(activity: Activity) {
        if (this.assertions) {
            const engine = new ExpressionEngine();
            for (let i = 0; i < this.assertions.length; i++) {
                const assertion = this.assertions[i];
                const { value, error } = engine.parse(assertion).tryEvaluate(activity);
                if (!value || error) {
                    throw new Error(`${this.description} ${assertion}`);
                }
            }
        }
    }

    public async execute(testAdapter: AdaptiveTestAdapter, callback: (context: TurnContext) => Promise<any>) {
        const start = new Date();
        while (true) {
            const current = new Date();

            if ((current.getTime() - start.getTime()) > this.timeout) {
                throw new Error(`${this.timeout}ms Timed out waiting for: ${this.getConditionDescription()}`);
            }

            const replyActivity = testAdapter.getNextReply();
            if (replyActivity) {
                this.validateReply(replyActivity as Activity);
                return;
            }

            await Promise.resolve(resolve => setTimeout(resolve, 100));
        }
    }
}