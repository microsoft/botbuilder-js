/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Return the newline string according to the environment.
 */
export class EOL extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [EOL](xref:adaptive-expressions.EOL) class.
     */
    constructor() {
        super(ExpressionType.EOL, EOL.evaluator(), ReturnType.String, EOL.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((): string => EOL.platformSpecificEOL());
    }

    /**
     * @private
     */
    private static platformSpecificEOL(): string {
        if (typeof window !== 'undefined') {
            return window.navigator.platform.includes('Win') ? '\r\n' : '\n';
        } else if (typeof self !== 'undefined') {
            return self.navigator.platform.includes('Win') ? '\r\n' : '\n';
        } else {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const os = require('os');
            return os.EOL;
        }
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 0, 0);
    }
}
