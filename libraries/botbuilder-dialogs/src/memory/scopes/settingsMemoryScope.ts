/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { MemoryScope } from "./memoryScope";
import { ScopePath } from "./scopePath";
import { DialogContext } from "../../dialogContext";

/**
 * SettingsMemoryScope maps "settings" -> process.env
 */
export class SettingsMemoryScope extends MemoryScope {
    constructor() {
        super(ScopePath.SETTINGS, false);
    }

    public getMemory(dc: DialogContext): object {
        // Clone strings from env
        const settings: object = {};
        for (const key in process.env) {
            if (typeof process.env[key] == 'string') {
                settings[key] = process.env[key];
            }
        }

        return settings;
    }
}
