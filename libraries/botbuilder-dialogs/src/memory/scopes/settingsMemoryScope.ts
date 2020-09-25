/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { MemoryScope } from './memoryScope';
import { ScopePath } from '../scopePath';
import { DialogContext } from '../../dialogContext';

/**
 * SettingsMemoryScope maps "settings" -> dc.context.turnState['settings']
 */
export class SettingsMemoryScope extends MemoryScope {
    /**
     * Initializes a new instance of the SettingsMemoryScope class.
     */
    public constructor() {
        super(ScopePath.settings, false);
    }

    /**
     * Gets the backing memory for this scope.
     * @param dc The DialogContext object for this turn.
     * @returns The memory for the scope.
     */
    public getMemory(dc: DialogContext): object {
        let settings: object = {};
        if (dc.context.turnState.has(ScopePath.settings)) {
            settings = dc.context.turnState.get(ScopePath.settings);
        }
        for (const key in process.env) {
            if (typeof process.env[key] == 'string') {
                settings[key] = process.env[key];
            }
        }
        return settings;
    }
}
