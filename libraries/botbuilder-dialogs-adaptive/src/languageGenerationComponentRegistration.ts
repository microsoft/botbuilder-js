/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, ComponentRegistration } from 'botbuilder-core';
import { TemplateInterface } from 'botbuilder-dialogs';
import { ComponentDeclarativeTypes, DeclarativeType, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { ActivityTemplate, StaticActivityTemplate, TextTemplate } from './templates';

/**
 * ComponentRegistration class for language generation resources.
 */
export class LanguageGenerationComponentRegistration
    extends ComponentRegistration
    implements ComponentDeclarativeTypes {
    /**
     * Return declarative types for language generation.
     *
     * @param {ResourceExplorer} _resourceExplorer Resource explorer to use for resolving references.
     * @returns {DeclarativeType<TemplateInterface<string | Partial<Activity>, ?>, Record<string, ?>>[]} Declarative types.
     */
    public getDeclarativeTypes(
        _resourceExplorer: ResourceExplorer
    ): DeclarativeType<TemplateInterface<string | Partial<Activity>, unknown>, Record<string, unknown>>[] {
        return [
            {
                kind: TextTemplate.$kind,
                type: TextTemplate,
            },
            {
                kind: ActivityTemplate.$kind,
                type: ActivityTemplate,
            },
            {
                kind: StaticActivityTemplate.$kind,
                type: StaticActivityTemplate,
            },
        ];
    }
}
