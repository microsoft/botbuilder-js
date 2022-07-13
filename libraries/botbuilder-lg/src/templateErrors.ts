/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Centralized LG errors.
 */
export class TemplateErrors {
    static readonly noTemplate: string = 'LG file must have at least one template definition.';

    static readonly invalidTemplateBody: string = "Invalid template body. Expecting '-' prefix.";

    static readonly missingStrucEnd: string = "Invalid structure body. Expecting ']' at the end of the body.";

    static readonly emptyStrucContent: string = 'Invalid structure body. Body cannot be empty.';

    static readonly invalidWhitespaceInCondition: string =
        "Invalid condition: At most 1 whitespace allowed between 'IF/ELSEIF/ELSE' and ':'.";

    static readonly notStartWithIfInCondition: string =
        "Invalid condition: Conditions must start with 'IF/ELSEIF/ELSE' prefix.";

    static readonly multipleIfInCondition: string =
        "Invalid template body. There cannot be more than one 'IF' condition. Expecting 'IFELSE' or 'ELSE' statement.";

    static readonly notEndWithElseInCondition: string =
        "Conditional response template does not end with 'ELSE' condition.";

    static readonly invalidMiddleInCondition: string = "Invalid template body. Expecting 'ELSEIF'.";

    static readonly invalidExpressionInCondition: string =
        "Invalid condition. 'IF', 'ELSEIF' definitions must include a valid expression.";

    static readonly extraExpressionInCondition: string =
        "Invalid condition. 'ELSE' definition cannot include an expression.";

    static readonly missingTemplateBodyInCondition: string =
        'Invalid condition body. Conditions must include a valid body.';

    static readonly invalidWhitespaceInSwitchCase: string =
        "Invalid condition: At most 1 whitespace allowed between 'SWITCH/CASE/DEFAULT' and ':'.";

    static readonly notStartWithSwitchInSwitchCase: string =
        "Invalid conditional response template. Expecting a 'SWITCH' statement?";

    static readonly multipleSwithStatementInSwitchCase: string =
        "Invalid template body. There cannot be more than one 'SWITCH' statement. Expecting 'CASE' or 'DEFAULT' statement.";

    static readonly invalidStatementInMiddlerOfSwitchCase: string =
        "Invalid template body. Expecting a 'CASE' statement.";

    static readonly notEndWithDefaultInSwitchCase: string =
        "Conditional response template does not end with 'DEFAULT' condition.";

    static readonly missingCaseInSwitchCase: string = "Invalid template body. Expecting at least one 'CASE' statement.";

    static readonly invalidExpressionInSwiathCase: string =
        "Invalid condition. 'SWITCH' and 'CASE' statements must include a valid expression.";

    static readonly extraExpressionInSwitchCase: string =
        "Invalid condition. 'DEFAULT' statement cannot include an expression.";

    static readonly missingTemplateBodyInSwitchCase: string =
        "Invalid condition body. Expecing valid body inside a 'CASE' or 'DEFAULT' block.";

    static readonly noEndingInMultiline: string = 'Expecting "```" to close the multi-line block.';

    static readonly noCloseBracket: string = 'Close } is missing in Expression.';

    static readonly loopDetected: string = 'Loop detected:';

    static readonly invalidMemory: string = 'Scope is not a LG customized memory.';

    static readonly staticFailure: string = 'Static failure with the following error.';

    static readonly invalidTemplateNameType: string = 'Expected string type for the parameter of template function.';

    static readonly importFormatError: string = "Import format should follow '[x](y)' or '[x](y) as z'.";

    static readonly invalidStrucBody = (invalidBody: string): string =>
        `Invalid structure body: '${invalidBody}'. Body can include <PropertyName> = <Value> pairs or \${reference()} template reference.`;

    static readonly invalidStrucName = (invalidName: string): string =>
        `Invalid structure name: '${invalidName}'. name should start with letter/number/_ and can only contains letter/number/./_.`;

    static readonly syntaxError = (unexpectedContent: string): string =>
        `${unexpectedContent}. Expecting a comment, template definition, import statement or option definition.`;

    static readonly invalidTemplateName = (invalidTemplateName: string): string =>
        `Invalid template name: '${invalidTemplateName}'. Template names can only contain letter, underscore '_' or number. Any part of a template name (split by '.') cannot start with a number.`;

    static readonly invalidParameter = (invalidParameter: string): string =>
        `Invalid parameter name: '${invalidParameter}'. Parameter names can only contain letter, underscore '_' or number.`;

    static readonly duplicatedTemplateInSameTemplate = (templateName: string): string =>
        `Duplicated definitions found for template: '${templateName}'.`;

    static readonly duplicatedTemplateInDiffTemplate = (templateName: string, source: string): string =>
        `Duplicated definitions found for template: '${templateName}' in '${source}'.`;

    static readonly noTemplateBody = (templateName: string): string =>
        `Missing template body in template '${templateName}'.`;

    static readonly templateNotExist = (templateName: string): string => `No such template '${templateName}'.`;

    static readonly errorExpression = (refFullText: string, templateName: string, prefixText: string): string =>
        `[${templateName}] ${prefixText} Error occurred when evaluating '${refFullText}'.`;

    static readonly nullExpression = (expression: string): string => `'${expression}' evaluated to null.`;

    static readonly argumentMismatch = (templateName: string, expectedCount: number, actualCount: number): string =>
        "arguments mismatch for template '" +
        `${templateName}` +
        "'. Expecting '" +
        `${expectedCount}` +
        "' arguments, actual '" +
        `${actualCount}` +
        "'.";

    static readonly templateExist = (templateName: string): string => `template '${templateName}' already exists.`;

    static readonly expressionParseError = (exp: string): string => `Error occurred when parsing expression '${exp}'.`;
}
