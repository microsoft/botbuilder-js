/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as jsonpath from 'jsonpath';
import { DialogContextState } from 'botbuilder-dialogs';

/**
 * @private
 * Pre-parses a string template and returns a function for rendering the compiled template.
 *
 * @remarks
 * The format of the template is expected to be "Hello {user.name}" where the template arge can be
 * any valid JSONPath expression.
 * @param template String template to compile.
 */
export function compile(template: string): (data: object) => string {
    // Break template into chunks.
    const chunks: ((data: object) => string)[] = [];
    let buffer = '';
    let inSlot = false;
    for (let i = 0; i < template.length; i++) {
        const chr = template[i];
        if (inSlot) {
            if (chr === '}') {
                if (buffer.length > 0) {
                    chunks.push(textSlot(buffer));
                    buffer = '';
                }
                inSlot = false;
            } else {
                buffer += chr;
            }
        } else if (chr === '\\') {
            // Check for '\{' escape sequence
            if (i + 1 < template.length && template[i + 1] === '{') {
                i++;
                buffer += '{';
            } else {
                buffer += chr;
            }
        } else if (chr === '{') {
            if (buffer.length > 0) {
                chunks.push(textLiteral(buffer));
                buffer = '';
            }
            inSlot = true;
        } else {
            buffer += chr;
        }
    }
    if (buffer.length > 0) {
        chunks.push(textLiteral((inSlot ? '{' : '') + buffer));
    }

    // Return stitching function
    return (data: object) => {
        let output = '';
        chunks.forEach((fn) => output += fn(data));
        return output;
    };
}

/**
 * @private
 * Compiles and renders a string template.
 *
 * @remarks
 * The format of the template is expected to be "Hello {user.name}" where the template arge can be
 * any valid JSONPath expression.
 * @param template String template to compile.
 * @param data The data used to fill the template slots.
 */
export function format(template: string, data: object): string {
    return compile(template)(data);
}

function textLiteral(buffer: string): (data: object) => string {
    return (data) => buffer;
}

function textSlot(path: string): (data: object) => string {
    path = DialogContextState.resolvePath(path);
    return (data) => {
        const value = jsonpath.value(data, path);
        switch (typeof value) {
            case 'object':
                return JSON.stringify(value);
            case 'undefined':
                return '';
            default:
                return value.toString();
        }
    }
}