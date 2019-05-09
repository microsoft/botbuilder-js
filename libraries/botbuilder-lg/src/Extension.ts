/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { FileContext, ParagraphContext, TemplateDefinitionContext } from './LGFileParser';
import { LGTemplate } from './lgTemplate';

/**
 * LG extensions.
 */
export class Extension {
    public static ToLGTemplates = (file: FileContext, source: string = ''): LGTemplate[] => {
        if (file === undefined
            || file === null) {
            return [];
        }

        const templates: TemplateDefinitionContext[] = file.paragraph()
                                                          .map((x: ParagraphContext) => x.templateDefinition())
                                                          .filter((x: TemplateDefinitionContext) => x !== undefined);

        return templates.map((x: TemplateDefinitionContext) => new LGTemplate(x, source));
    }
}
