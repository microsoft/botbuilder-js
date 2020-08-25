import { Template } from './template';
import { Templates } from './templates';
import { TemplatesTransformer, TemplatesParser } from './templatesParser';
import { StaticChecker } from './staticChecker';
import { TemplateErrors } from './templateErrors';
import { TemplateExtensions } from './templateExtensions';
import { Diagnostic } from './diagnostic';
import { SourceRange } from './sourceRange';
import { Range } from './range';

const newLine = '\r\n';

/**
* Update a template and return LG file.
* @param templates Orignial templates.
* @param templateName Orignial template name.
* @param newTemplateName New template name.
* @param parameters New params.
* @param templateBody New template body.
* @param shouldParse Should parse the additional template to get the parse tree and new diagnostic.
* @returns New lg file.
*/
export function updateTemplate(templates: Templates, templateName: string, newTemplateName: string, parameters: string[], templateBody: string, shouldParse: boolean = true): Templates {
    var newTemplates = new Templates([...templates.toArray()], [...templates.imports], [], [...templates.references], templates.content, templates.id, templates.expressionParser, templates.importResolver, templates.options);
    const templateIndex = templates.toArray().findIndex((u: Template): boolean => u.name === templateName);
    if (templateIndex >= 0) {
        const template: Template = templates.toArray()[templateIndex];
        const templateNameLine: string = buildTemplateNameLine(newTemplateName, parameters);
        const newTemplateBody: string = convertTemplateBody(templateBody);
        const content = `${ templateNameLine }${ newLine }${ newTemplateBody }`;

        // update content
        newTemplates.content = replaceRangeContent(templates.content,
            template.sourceRange.range.start.line - 1,
            template.sourceRange.range.end.line - 1,
            content);

        let updatedTemplate: Template;
        if (!shouldParse) {
            const originList: string[] = TemplateExtensions.readLine(content);
            const range = new Range(1, 0, originList.length, originList[originList.length - 1].length);
            updatedTemplate = new Template(newTemplateName, parameters, newTemplateBody, new SourceRange(range, templates.id));
        } else {
            let updatedTemplates = new Templates([], [], [], [], '', templates.id, templates.expressionParser, templates.importResolver);
            updatedTemplates = new TemplatesTransformer(updatedTemplates).transform(TemplatesParser.antlrParseTemplates(content, templates.id));
            const originalStartLine = template.sourceRange.range.start.line - 1;
            appendDiagnosticWithOffset(newTemplates.diagnostics, updatedTemplates.diagnostics, originalStartLine);
            if (updatedTemplates.toArray().length > 0) {
                updatedTemplate = updatedTemplates.toArray()[0];
            }
        }

        if (updatedTemplate) {
            adjustRangeForUpdateTemplate(newTemplates, template, updatedTemplate);
            if (shouldParse) {
                new StaticChecker(newTemplates).check().forEach((u): number => newTemplates.diagnostics.push(u));
            }
        }
    }

    return newTemplates;
}

/**
* Add a new template and return LG file.
* @param templates Orignial templates.
* @param templateName New template name.
* @param parameters New params.
* @param templateBody New  template body.
* @param shouldParse Should parse the additional template to get the parse tree and new diagnostic.
* @returns New lg file.
*/
export function addTemplate(templates: Templates, templateName: string, parameters: string[], templateBody: string, shouldParse: boolean = true): Templates {
    var newTemplates = new Templates([...templates.toArray()], [...templates.imports], [], [...templates.references], templates.content, templates.id, templates.expressionParser, templates.importResolver, templates.options);
    const template: Template = templates.toArray().find((u: Template): boolean => u.name === templateName);
    if (template) {
        throw new Error(TemplateErrors.templateExist(templateName));
    }

    const templateNameLine: string = buildTemplateNameLine(templateName, parameters);
    const newTemplateBody: string = convertTemplateBody(templateBody);
    const content = `${ templateNameLine }${ newLine }${ newTemplateBody }`;
    const originalStartLine = TemplateExtensions.readLine(templates.content).length;

    // update content
    newTemplates.content = `${ templates.content }${ newLine }${ templateNameLine }${ newLine }${ newTemplateBody }`;
    let newTemplate: Template;
    if (!shouldParse) {
        const originList: string[] = TemplateExtensions.readLine(content);
        const range = new Range(1, 0, originList.length, originList[originList.length - 1].length);
        newTemplate = new Template(templateName, parameters, newTemplateBody, new SourceRange(range, templates.id));
    } else {
        let updatedTemplates = new Templates([], [], [], [], '', templates.id, templates.expressionParser, templates.importResolver);
        updatedTemplates = new TemplatesTransformer(updatedTemplates).transform(TemplatesParser.antlrParseTemplates(content, templates.id));
    
        appendDiagnosticWithOffset(newTemplates.diagnostics, updatedTemplates.diagnostics, originalStartLine);
        if (updatedTemplates.toArray().length > 0) {
            newTemplate = updatedTemplates.toArray()[0];
            new StaticChecker(newTemplates).check().forEach((u): number => newTemplates.diagnostics.push(u));
        }
    }

    if (newTemplate) {
        adjustRangeForAddTemplate(newTemplate, originalStartLine);
        newTemplates.toArray().push(newTemplate);
    }

    return newTemplates;
}

/**
* Delete an exist template.
* @param templates Orignial templates.
* @param templateName Which template should delete.
* @returns Return the new lg file.
*/
export function deleteTemplate(templates: Templates, templateName: string): Templates {
    var newTemplates = new Templates([...templates.toArray()], [...templates.imports], [], [...templates.references], templates.content, templates.id, templates.expressionParser, templates.importResolver, templates.options);
    const templateIndex = templates.toArray().findIndex((u: Template): boolean => u.name === templateName);
    if (templateIndex >= 0) {
        const template = templates.toArray()[templateIndex];

        const startLine = template.sourceRange.range.start.line - 1;
        const stopLine = template.sourceRange.range.end.line - 1;
        newTemplates.content = replaceRangeContent(templates.content, startLine, stopLine, undefined);
        adjustRangeForDeleteTemplate(newTemplates, template);
        newTemplates.toArray().splice(templateIndex, 1);
        new StaticChecker(newTemplates).check().forEach((u): number => newTemplates.diagnostics.push(u));
    }

    return newTemplates;
}


function appendDiagnosticWithOffset(originalDiagnostics: Diagnostic[], newDiagnostics: Diagnostic[], offset: number): void {
    if (newDiagnostics) {
        newDiagnostics.forEach((u): void => {
            u.range.start.line += offset;
            u.range.end.line += offset;
            originalDiagnostics.push(u);
        });
    }
}

function adjustRangeForUpdateTemplate(templates: Templates, oldTemplate: Template, newTemplate: Template): void {
    const newRange = newTemplate.sourceRange.range.end.line - newTemplate.sourceRange.range.start.line;
    const oldRange = oldTemplate.sourceRange.range.end.line - oldTemplate.sourceRange.range.start.line;

    const lineOffset = newRange - oldRange;

    let hasFound = false;
    for (let i = 0; i < templates.toArray().length; i++) {
        if (hasFound) {
            templates.toArray()[i].sourceRange.range.start.line += lineOffset;
            templates.toArray()[i].sourceRange.range.end.line += lineOffset;
        } else if (templates.toArray()[i].name === oldTemplate.name) {
            hasFound = true;
            newTemplate.sourceRange.range.start.line = oldTemplate.sourceRange.range.start.line;
            newTemplate.sourceRange.range.end.line = oldTemplate.sourceRange.range.end.line + lineOffset;
            templates.toArray()[i] = newTemplate;
        }
    }
}

function adjustRangeForAddTemplate(newTemplate: Template, lineOffset: number): void {
    const lineLength = newTemplate.sourceRange.range.end.line - newTemplate.sourceRange.range.start.line;
    newTemplate.sourceRange.range.start.line  = lineOffset + 1;
    newTemplate.sourceRange.range.end.line = lineOffset + lineLength + 1;
}

function adjustRangeForDeleteTemplate(templates: Templates, oldTemplate: Template): void {
    const lineOffset = oldTemplate.sourceRange.range.end.line - oldTemplate.sourceRange.range.start.line + 1;

    let hasFound = false;
    for (let i = 0; i < templates.toArray().length; i++) {
        if (hasFound) {
            templates.toArray()[i].sourceRange.range.start.line -= lineOffset;
            templates.toArray()[i].sourceRange.range.end.line -= lineOffset;
        } else if (templates.toArray()[i].name == oldTemplate.name) {
            hasFound = true;
        }
    }
}

function replaceRangeContent(originString: string, startLine: number, stopLine: number, replaceString: string): string {
    const originList: string[] = TemplateExtensions.readLine(originString);
    if (startLine < 0 || startLine > stopLine || stopLine >= originList.length) {
        throw new Error('index out of range.');
    }

    const destList: string[] = [];
    destList.push(...originList.slice(0, startLine));
    if (replaceString !== undefined && replaceString !== null) {
        destList.push(replaceString);
    }

    destList.push(...originList.slice(stopLine + 1));

    return destList.join(newLine);
}

function convertTemplateBody(templateBody: string): string {
    if (!templateBody) {
        return '';
    }

    const replaceList: string[] = TemplateExtensions.readLine(templateBody);
    const destList: string[] = replaceList.map((u: string): string => {
        return u.trimLeft().startsWith('#') ? `- ${ u.trimLeft() }` : u;
    });

    return destList.join(newLine);
}

function buildTemplateNameLine(templateName: string, parameters: string[]): string {
    // if parameters is null or undefined, ignore ()
    if (parameters === undefined || parameters === undefined) {
        return `# ${ templateName }`;
    } else {
        return `# ${ templateName }(${ parameters.join(', ') })`;
    }
}