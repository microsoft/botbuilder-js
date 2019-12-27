import { Dialog } from 'botbuilder-dialogs';
import { Expression, ExpressionType, ExpressionParserInterface } from 'botframework-expressions';
import { AdaptiveEventNames } from '../sequenceContext';
import { OnDialogEvent, OnDialogEventConfiguration } from './onDialogEvent';

export interface OnActivityConfiguration extends OnDialogEventConfiguration {
    type?: string;
}

/**
 * Actions triggered when a Activity of a given type is received.
 */
export class OnActivity extends OnDialogEvent {

    public static declarativeType = 'Microsoft.OnActivity';

    /**
     * Gets or sets the ActivityType which must be matched for this to trigger.
     */
    public type: string;

    public constructor(type?: string, actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEventNames.activityReceived, actions, condition);
        this.type = type;
    }

    public configure(config: OnActivityConfiguration): this {
        return super.configure(config);
    }

    public getExpression(parser: ExpressionParserInterface): Expression {
        // add constraints for activity type
        const expression = parser.parse(`turn.activity.type == '${this.type}'`)
        return Expression.makeExpression(ExpressionType.And, undefined, expression, super.getExpression(parser));
    }
}