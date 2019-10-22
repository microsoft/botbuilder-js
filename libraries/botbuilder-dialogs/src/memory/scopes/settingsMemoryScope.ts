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
        super(ScopePath.SETTINGS, true);
    }

    public getMemory(dc: DialogContext): object {
        // Clone process.env on first access
        const memoryScopes = this.getScopesMemory(dc.context);
        if (!memoryScopes.hasOwnProperty(this.name)) {
            memoryScopes[this.name] = Object.assign({}, process.env);
        }

        return memoryScopes[this.name];
    }
}
