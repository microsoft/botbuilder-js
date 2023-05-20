/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { XMLBuilder } from 'fast-xml-parser';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';
/**
 * Return the newline string according to the environment.
 */
export class XML extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [EOL](xref:adaptive-expressions.EOL) class.
     */
    constructor() {
        super(ExpressionType.XML, XML.evaluator(), ReturnType.String, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: unknown[]): { value: unknown; error: string } =>
            XML.platformSpecificXML(args)
        );
    }

    private static platformSpecificXML(args: unknown[]): { value: unknown; error: string } {
        let result: unknown;
        let error: string;
        let obj: unknown;
        try {
            if (typeof args[0] === 'string') {
                obj = JSON.parse(args[0] as string);
            } else if (typeof args[0] === 'object') {
                obj = args[0];
            }
            const parser = new XMLBuilder({
                indentBy: '  ',
                format: true,
            });
            result = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n${parser.build(obj)}`.trim();
        } catch {
            error = `${args[0]} is not a valid json`;
        }

        return { value: result, error: error };
    }
}
