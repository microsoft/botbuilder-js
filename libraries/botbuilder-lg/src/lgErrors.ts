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
export class LGErrors
{
    public static readonly noTemplate = 'File must have at least one template definition';

    public static readonly invalidTemplateName = 'Not a valid template name line';

    public static readonly invalidTemplateBody = 'Invalid template body line, did you miss "-" at line begin';

    public static readonly invalidStrucName = 'Structured name format error.';

    public static readonly missingStrucEnd = 'Structured LG missing ending "]"';

    public static readonly emptyStrucContent = 'Structured content is empty';

    public static readonly invalidStrucBody = 'Structured body format error.';

    public static readonly invalidWhitespaceInCondition = 'At most 1 whitespace is allowed between IF/ELSEIF/ELSE and :';

    public static readonly notStartWithIfInCondition = 'condition is not start with if';

    public static readonly multipleIfInCondition = 'condition can not have more than one if';

    public static readonly notEndWithElseInCondition = 'condition is not end with else';

    public static readonly invalidMiddleInCondition = 'only elseif is allowed in middle of condition';

    public static readonly invalidExpressionInCondition = 'if and elseif should followed by one valid expression';

    public static readonly extraExpressionInCondition = 'else should not followed by any expression';

    public static readonly missingTemplateBodyInCondition = 'no normal template body in condition block';

    public static readonly invalidWhitespaceInSwitchCase = 'At most 1 whitespace is allowed between SWITCH/CASE/DEFAULT and :.';

    public static readonly notStartWithSwitchInSwitchCase = 'control flow is not starting with switch';

    public static readonly multipleSwithStatementInSwitchCase = 'control flow can not have more than one switch statement';

    public static readonly invalidStatementInMiddlerOfSwitchCase = 'only case statement is allowed in the middle of control flow';

    public static readonly notEndWithDefaultInSwitchCase = 'control flow is not ending with default statement';

    public static readonly missingCaseInSwitchCase = 'control flow should have at least one case statement';

    public static readonly invalidExpressionInSwiathCase = 'switch and case should followed by one valid expression';

    public static readonly extraExpressionInSwitchCase = 'default should not followed by any expression or any text';

    public static readonly missingTemplateBodyInSwitchCase = 'no normal template body in case or default block';

    public static readonly noEndingInMultiline = 'Close ``` is missing';

    public static readonly loopDetected = 'Loop detected:';

    public static readonly duplicatedTemplateInSameTemplate = (templateName: string): string => `Duplicated definitions found for template: ${ templateName }`;

    public static readonly duplicatedTemplateInDiffTemplate = (templateName: string, source: string): string => `Duplicated definitions found for template: ${ templateName } in ${ source }`;

    public static readonly noTemplateBody = (templateName: string): string => `There is no template body in template ${ templateName }`;

    public static readonly templateNotExist = (templateName: string): string => `No such template ${ templateName }`;

    public static readonly errorExpression = (expression: string, error: string): string => `Error occurs when evaluating expression ${ expression }: ${ error }`;

    public static readonly nullExpression = (expression: string): string => `Error occurs when evaluating expression ${ expression }: ${ expression } is evaluated to null`;

    public static readonly argumentMismatch = (templateName: string,expectedCount: number, actualCount: number): string => `arguments mismatch for template ${ templateName }, expect ${ expectedCount } actual ${ actualCount }`;

    public static readonly errorTemplateNameformat = (templateName: string): string => `${ templateName } can't be used as a template name, must be a string value`;

    public static readonly templateExist = (templateName: string): string => `template ${ templateName } already exists.`;
}