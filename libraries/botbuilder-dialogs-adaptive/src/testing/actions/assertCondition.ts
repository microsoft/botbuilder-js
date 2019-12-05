import { Dialog, DialogContext, DialogTurnResult } from "botbuilder-dialogs";
import { ExpressionEngine } from "botframework-expressions";

export class AssertCondition extends Dialog {
    public static readonly declarativeType: string = 'Microsoft.Test.AssertCondition';

    /**
     * Condition which must be true.
     */
    public condition: string;

    /**
     * Description of assertion.
     */
    public description: string;

    public async beginDialog(dc: DialogContext, _options?: any): Promise<DialogTurnResult> {
        const parser = new ExpressionEngine()
        const { value, error } = parser.parse(this.condition).tryEvaluate(dc.state.getMemorySnapshot());
        if (!value || error) {
            throw new Error(this.description);
        }
        return dc.endDialog();
    }
}