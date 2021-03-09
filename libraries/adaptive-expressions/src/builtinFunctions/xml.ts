/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

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
    public constructor() {
        super(ExpressionType.XML, XML.evaluator(), ReturnType.String, FunctionUtils.validateUnary);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: readonly unknown[]): { value: unknown; error: string } => XML.platformSpecificXML(args));
    }

    private static platformSpecificXML(args: readonly unknown[]): { value: unknown; error: string } {
        if (typeof window !== 'undefined' || typeof self !== 'undefined') {
            // this is for evaluating in browser environment, however it is not covered by any test currently
            // x2js package can run on browser environment, see ref: https://www.npmjs.com/package/x2js
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const X2JS = require('x2js');
            let result: unknown;
            let error: string;
            let obj: unknown;
            const firstChild = args[0];
            try {
                if (typeof firstChild === 'string') {
                    obj = JSON.parse(firstChild);
                } else if (typeof firstChild === 'object') {
                    obj = firstChild;
                }

                result = new X2JS.json2xml_str(obj);
            } catch (err) {
                error = `${firstChild} is not a valid json`;
            }

            return { value: result, error: error };
        } else {
            // xml2js only support node environment, see ref: https://github.com/Leonidas-from-XIV/node-xml2js
            let result: unknown;
            let error: string;
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const xml2js = require('xml2js');
            let obj: unknown;
            const firstChild = args[0];
            try {
                if (typeof firstChild === 'string') {
                    obj = JSON.parse(firstChild);
                } else if (typeof firstChild === 'object') {
                    obj = firstChild;
                }

                const builder = new xml2js.Builder();
                result = builder.buildObject(obj);
            } catch (err) {
                error = `${firstChild} is not a valid json`;
            }

            return { value: result, error: error };
        }
    }
}
