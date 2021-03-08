/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ComponentRegistration } from 'botbuilder-core';
import { ComponentMemoryScopes, ComponentPathResolvers, MemoryScope, PathResolver } from './memory';
import { AtAtPathResolver, AtPathResolver, DollarPathResolver, HashPathResolver, PercentPathResolver } from './memory/pathResolvers';
import { ClassMemoryScope, ConversationMemoryScope, DialogClassMemoryScope, DialogContextMemoryScope, DialogMemoryScope, SettingsMemoryScope, ThisMemoryScope, TurnMemoryScope, UserMemoryScope } from './memory/scopes';

/**
 * Makes dialogs component available to the system registering functionality.
 */
export class DialogsComponentRegistration extends ComponentRegistration implements ComponentMemoryScopes, ComponentPathResolvers {
    /**
     * Gets the dialogs memory scopes.
     *
     * @returns {MemoryScope[]} A list of [MemoryScope](xref:botbuilder-dialogs.MemoryScope).
     */
    public getMemoryScopes(): MemoryScope[] {
        return [
            new TurnMemoryScope(),
            new SettingsMemoryScope(),
            new DialogMemoryScope(),
            new DialogContextMemoryScope(),
            new DialogClassMemoryScope(),
            new ClassMemoryScope(),
            new ThisMemoryScope(),
            new ConversationMemoryScope(),
            new UserMemoryScope(),
        ];
    }

    /**
     * Gets the dialogs path resolvers.
     *
     * @returns {PathResolver[]} A list of [PathResolver](xref:botbuilder-dialogs.PathResolver).
     */
    public getPathResolvers(): PathResolver[] {
        return [
            new DollarPathResolver(),
            new HashPathResolver(),
            new AtAtPathResolver(),
            new AtPathResolver(),
            new PercentPathResolver(),
        ];
    }

}
