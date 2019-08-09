/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext } from "../dialogContext";

export interface PathResolver {
    matched(dc: DialogContext, path: string): boolean;
    getValue(dc: DialogContext, memory: object, path: string, defaultValue?: any): any;
    setValue(dc: DialogContext, memory: object, path: string, value: any): void;
    removeValue(dc: DialogContext, memory: object, path: string): void;
}
