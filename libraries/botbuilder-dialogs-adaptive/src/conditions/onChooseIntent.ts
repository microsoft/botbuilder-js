/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Dialog, TurnPath } from 'botbuilder-dialogs';
import { Expression, ExpressionParserInterface } from 'adaptive-expressions';
import { OnIntent, OnIntentConfiguration } from './onIntent';

export interface OnChooseIntentConfiguration extends OnIntentConfiguration {
    intents?: string[];
}

export class OnChooseIntent extends OnIntent {

    public static declarativeType = 'Microsoft.OnChooseIntent';

    public intents: string[] = [];

    public constructor(actons: Dialog[] = [], condition?: string) {
        super('ChooseIntent', [], actons, condition);
    }

    public configure(config: OnChooseIntentConfiguration): this {
        return super.configure(config);
    }

    public getExpression(parser: ExpressionParserInterface): Expression {
        if (this.intents.length > 0) {
            const constraints = this.intents.map((intent: string): Expression => {
                return parser.parse(`contains(jPath(${ TurnPath.RECOGNIZED }, '$.candidates[*].intent'), '${ intent }')`);
            });
            return Expression.andExpression(super.getExpression(parser), ...constraints);
        }
        return super.getExpression(parser);
    }
}