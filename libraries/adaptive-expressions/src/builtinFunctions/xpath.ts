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
export class XPath extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [EOL](xref:adaptive-expressions.EOL) class.
     */
    public constructor() {
        super(ExpressionType.XPath, XPath.evaluator(), ReturnType.Object, XPath.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: unknown[]): { value: unknown; error: string } =>
            XPath.platformSpecificXPath(args)
        );
    }

    /**
     * @param args
     * @private
     */
    private static platformSpecificXPath(args: unknown[]): { value: unknown; error: string } {
        if (typeof window !== 'undefined' || typeof self !== 'undefined') {
            // this is for evaluating in browser environment, however it is not covered by any test currently
            let error: string;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(args[0] as string, 'text/xml');
            const nodes = xmlDoc.evaluate(args[1] as string, xmlDoc, null, XPathResult.ANY_TYPE, null);
            let node = nodes.iterateNext();
            const result: string[] = [];
            while (node) {
                result.push(node.childNodes[0].nodeValue);
                node = nodes.iterateNext();
            }

            if (result.length === 0){
                error = `There is no matched nodes for the expression ${args[1]} in the xml: ${args[0]}`;
                return { value: undefined, error: error };
            } else if (result.length === 1) {
                return { value: result[0], error: undefined };
            } else {
                return { value: result, error: undefined };
            }
        } else {
            let error: string;
            let result: unknown;
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const xpath = require('xpath');
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { DOMParser } = require('xmldom');
            let doc: XMLDocument;
            try {
                doc = new DOMParser().parseFromString(args[0], 'text/xml');
            } catch (err) {
                error = `${args[0]} is not valid xml input`;
            }

            if (!error) {
                const nodes = xpath.select(args[1], doc);
                if (Array.isArray(nodes)){
                    if (nodes.length === 0) {
                        error = `There is no matched nodes for the expression ${args[1]} in the xml: ${args[0]}`;
                    } else {
                        result = nodes.map((node): string => node.toString());
                    }
                } else {
                    result = nodes;
                }
            }

            return { value: result, error: error };
        }
    }

    /**
     * @param expression
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, undefined, ReturnType.Object, ReturnType.String);
    }
}
