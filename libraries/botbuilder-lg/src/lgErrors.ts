/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class LGErrors
{
    public static noTemplate = 'File must have at least one template definition';

    public static invalidTemplateName = 'Not a valid template name line';

    public static invalidTemplateBody = 'Invalid template body line, did you miss "-" at line begin';

    public static invalidStrucName = 'structured name format error.';

    public static missingStrucEnd = 'structured LG missing ending "]"';

    public static emptyStrucContent = 'Structured content is empty';

    public static invalidStrucBody = 'structured body format error.';

    public static invalidWhitespaceInCondition = 'At most 1 whitespace is allowed between IF/ELSEIF/ELSE and :';

    public static notStartWithIfInCondition = 'condition is not start with if';

    public static multipleIfInCondition = 'condition can not have more than one if';

    public static notEndWithElseInCondition = 'condition is not end with else';

    public static invalidMiddleInCondition = 'only elseif is allowed in middle of condition';

    public static invalidExpressionInCondition = 'if and elseif should followed by one valid expression';

    public static extraExpressionInCondition = 'else should not followed by any expression';

    public static missingTemplateBodyInCondition = 'no normal template body in condition block';

    public static invalidWhitespaceInSwitchCase = 'At most 1 whitespace is allowed between SWITCH/CASE/DEFAULT and :.';

    public static notStartWithSwitchInSwitchCase = 'control flow is not starting with switch';

    public static multipleSwithStatementInSwitchCase = 'control flow can not have more than one switch statement';

    public invalidStatementInMiddlerOfSwitchCase = 'only case statement is allowed in the middle of control flow';

    public static notEndWithDefaultInSwitchCase = 'control flow is not ending with default statement';

    public static missingCaseInSwitchCase = 'control flow should have at least one case statement';

    public static invalidExpressionInSwiathCase = 'switch and case should followed by one valid expression';

    public static extraExpressionInSwitchCase = 'default should not followed by any expression or any text';

    public static missingTemplateBodyInSwitchCase = 'no normal template body in case or default block';

    public static noEndingInMultiline = 'Close ``` is missing';

    public static loopDetected = 'Loop detected:';

    public static duplicatedTemplateInSameTemplate = (templateName: string): string => `Duplicated definitions found for template: ${ templateName }`;

    public static duplicatedTemplateInDiffTemplate = (templateName: string, source: string): string => `Duplicated definitions found for template: ${ templateName } in ${ source }`;

    public static noTemplateBody = (templateName: string): string => `There is no template body in template ${ templateName }`;

    public static templateNotExist = (templateName: string): string => `No such template ${ templateName }`;

    public static errorExpression = (expression: string, error: string): string => `Error occurs when evaluating expression ${ expression }: ${ error }`;

    public static nullExpression = (expression: string): string => `Error occurs when evaluating expression ${ expression }: ${ expression } is evaluated to null`;

    public static argumentMismatch = (templateName: string,expectedCount: number, actualCount: number): string => `arguments mismatch for template ${ templateName }, expect ${ expectedCount } actual ${ actualCount }`;

    public static errorTemplateNameformat = (templateName: string): string => `${ templateName } can't be used as a template name, must be a string value`;

    public static templateExist = (templateName: string): string => `template ${ templateName } already exists.`;
}