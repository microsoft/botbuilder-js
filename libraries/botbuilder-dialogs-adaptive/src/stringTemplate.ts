/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext } from 'botbuilder-dialogs';

/**
 * @private
 * Pre-parses a string template and returns a function for rendering the compiled template.
 *
 * @remarks
 * The format of the template is expected to be "Hello {user.name}" where the template arge can be
 * any valid JSONPath expression.
 * @param template String template to compile.
 */
export function compile(template: string): (dc: DialogContext) => string {
    // Break template into chunks.
    const chunks: ((dc: DialogContext) => string)[] = [];
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
        } else if (chr === '@' && i < template.length - 1 && template[i+1] === '{') {
            // support @{}
            if (buffer.length > 0) {
                chunks.push(textLiteral(buffer));
                buffer = '';
            }
            i++;
            inSlot = true;
        } else {
            buffer += chr;
        }
    }
    if (buffer.length > 0) {
        chunks.push(textLiteral((inSlot ? '{' : '') + buffer));
    }

    // Return stitching function
    return (dc: DialogContext) => {
        let output = '';
        chunks.forEach((fn) => output += fn(dc));
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
export function format(template: string, dc: DialogContext): string {
    return compile(template)(dc);
}

function textLiteral(buffer: string): (dc: DialogContext) => string {
    return (dc) => buffer;
}

function textSlot(path: string): (dc: DialogContext) => string {
    return (dc) => {
        const value = dc.state.getValue(path);
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