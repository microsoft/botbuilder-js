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
export class LGErrors {
    public static readonly noTemplate: string = `LG file must have at least one template definition. `;
 
    public static readonly invalidTemplateName: string = `Invalid template name. Template name should start with letter/number/_ and can only contains letter/number/_/./-. `;
 
    public static readonly invalidTemplateBody: string = `Invalid template body. Expecting '-' prefix. `;
 
    public static readonly invalidStrucName: string = `Invalid structure name. name should start with letter/number/_ and can only contains letter/number/_/./-.`;
 
    public static readonly missingStrucEnd: string = `Invalid structure body. Expecting ']' at the end of the body. `;
 
    public static readonly emptyStrucContent: string = `Invalid structure body. Body cannot be empty. `;
 
    public static readonly invalidStrucBody: string = 'Invalid structure body. Body can include <PropertyName>: string = <Value> pairs or ${reference()} template reference. ';
 
    public static readonly invalidWhitespaceInCondition: string = `Invalid condition: At most 1 whitespace allowed between 'IF/ELSEIF/ELSE' and ':'. `;
 
    public static readonly notStartWithIfInCondition: string = `Invalid condition: Conditions must start with 'IF/ELSEIF/ELSE' prefix `;
 
    public static readonly multipleIfInCondition: string = `Invalid template body. There cannot be more than one 'IF' condition. Expecting 'IFELSE' or 'ELSE' statement. `;
 
    public static readonly notEndWithElseInCondition: string = `Conditional response template does not end with 'ELSE' condition. `;
 
    public static readonly invalidMiddleInCondition: string = `Invalid template body. Expecting 'ELSEIF'. `;
 
    public static readonly invalidExpressionInCondition: string = `Invalid condition. 'IF', 'ELSEIF' definitions must include a valid expression. `;
 
    public static readonly extraExpressionInCondition: string = `Invalid condition. 'ELSE' definition cannot include an expression. `;
 
    public static readonly missingTemplateBodyInCondition: string = `Invalid condition body. Conditions must include a valid body. `;
 
    public static readonly invalidWhitespaceInSwitchCase: string = `Invalid condition: At most 1 whitespace allowed between 'SWITCH/CASE/DEFAULT' and ':'. `;
 
    public static readonly notStartWithSwitchInSwitchCase: string = `Invalid conditional response template. Expecting a 'SWITCH' statement? `;
 
    public static readonly multipleSwithStatementInSwitchCase: string = `Invalid template body. There cannot be more than one 'SWITCH' statement. Expecting 'CASE' or 'DEFAULT' statement. `;
 
    public static readonly invalidStatementInMiddlerOfSwitchCase: string = `Invalid template body. Expecting a 'CASE' statement. `;
 
    public static readonly notEndWithDefaultInSwitchCase: string = `Conditional response template does not end with 'DEFAULT' condition. `;
 
    public static readonly missingCaseInSwitchCase: string = `Invalid template body. Expecting at least one 'CASE' statement. `;
 
    public static readonly invalidExpressionInSwiathCase: string = `Invalid condition. 'SWITCH' and 'CASE' statements must include a valid expression. `;
 
    public static readonly extraExpressionInSwitchCase: string = `Invalid condition. 'DEFAULT' statement cannot include an expression. `;
 
    public static readonly missingTemplateBodyInSwitchCase: string = `Invalid condition body. Expecing valid body inside a 'CASE' or 'DEFAULT' block. `;
 
    public static readonly noEndingInMultiline: string = 'Expecting "```" to close the multi-line block. ';
 
    public static readonly noCloseBracket: string = `Close } is missing in Expression`;
 
    public static readonly loopDetected: string = `Loop detected:`;
 
    public static readonly syntaxError: string = `Unexpected content. Expecting either a comment or a template definition or an import statement. `;
 
    public static readonly invalidMemory: string = `Scope is not a LG customized memory. `;
 
    public static readonly staticFailure: string = `Static failure with the following error. `;
 
    public static readonly duplicatedTemplateInSameTemplate = (templateName: string): string => `Duplicated definitions found for template: '${ templateName }'. `;
 
    public static readonly duplicatedTemplateInDiffTemplate = (templateName: string, source: string): string => `Duplicated definitions found for template: '${ templateName }' in '${ source }'. `;
 
    public static readonly noTemplateBody = (templateName: string): string => `Missing template body in template '${ templateName }'. `;
 
    public static readonly templateNotExist = (templateName: string): string => `No such template '${ templateName }'. `;
 
    public static readonly errorExpression = (refFullText: string, templateName: string, prefixText: string): string => `[${ templateName }] ${ prefixText } Error occurred when evaluating '${ refFullText }'. `;
 
    public static readonly nullExpression = (expression): string => `'${ expression }' evaluated to null. `;
 
    public static readonly argumentMismatch = (templateName: string, expectedCount: number, actualCount: number): string => `arguments mismatch for template '` + `${ templateName }` + `'. Expecting '` + `${ expectedCount }` +`' arguments, actual '` + `${ actualCount }` +`'. `;
 
    public static readonly errorTemplateNameformat = (templateName: string): string => `'${ templateName }' cannot be used as a template name. Template names must be avalid . `;
 
    public static readonly templateExist = (templateName: string): string => `template '${ templateName }' already exists. `;
 
    public static readonly expressionParseError = (exp: string): string => `Error occurred when parsing expression '${ exp }'. `;
}