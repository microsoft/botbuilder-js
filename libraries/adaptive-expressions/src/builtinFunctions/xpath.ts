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
        super(ExpressionType.XPath, XPath.evaluator(), ReturnType.String, FunctionUtils.validateBinary);
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
            let error: string;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(args[0] as string, 'text/xml');
            const nodes =xmlDoc.evaluate(args[1] as string, xmlDoc, null, XPathResult.ANY_TYPE, null);
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
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const xpath = require('xpath');
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { DOMParser } = require('xmldom');
            const doc = new DOMParser().parseFromString(args[0]);
            const nodes = xpath.select(args[1], doc);
            if (nodes.length === 0) {
                error = `There is no matched nodes for the expression ${args[1]} in the xml: ${args[0]}`;
                return { value: undefined, error: error };
            } else if (nodes.length === 1) {
                return { value: nodes[0].toString(), error: undefined };
            } else {
                return { value: nodes.map((node): string => node.toString()), error: undefined };
            }
        }
    }
}
