/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    Expression,
    ExpressionEvaluator,
    FunctionUtils,
    MemoryInterface,
    Options,
    ReturnType,
    ValueWithError,
} from 'adaptive-expressions';
import { LanguageGenerator } from '../languageGenerator';

import { DialogContext } from 'botbuilder-dialogs';
/**
 * Defines missingProperties(template) expression function.
 * This expression will get all variables the template contains.
 *
 * @example missingProperties('${a} ${b}')
 */
export class MissingPropertiesFunction extends ExpressionEvaluator {
    /**
     * Function identifier name.
     */
    public static readonly functionName = 'missingProperties'; // `name` is reserved in JavaScript.

    private static readonly generatorPath = 'dialogclass.generator';

    private static dialogContext: DialogContext;

    /**
     * Intializes a new instance of the [MissingProperties](xref:botbuilder-dialogs-adaptive.MissingProperties) class.
     *
     * @param context dialog context.
     */
    public constructor(context: DialogContext) {
        super(
            MissingProperties.functionName,
            MissingProperties.function,
            ReturnType.Array,
            FunctionUtils.validateUnaryString
        );

        MissingProperties.dialogContext = context;
    }

    private static function(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        const { args, error } = FunctionUtils.evaluateChildren(expression, state, options);
        if (error != null) {
            return { value: undefined, error };
        }

        const templateBody = args[0].toString();
        const lgGenerator = state.getValue(MissingProperties.generatorPath);
        if (lgGenerator) {
            const generator = lgGenerator as LanguageGenerator;
            return { value: generator.missingProperties(MissingProperties.dialogContext, templateBody, state, options), error: undefined };
        }
        return { value: undefined, error: undefined };
    }
}
