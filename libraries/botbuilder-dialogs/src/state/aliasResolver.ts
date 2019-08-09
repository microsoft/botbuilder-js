/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PathResolver } from './pathResolver';
import { DialogContext } from '../dialogContext';

export class AliasResolver implements PathResolver {
    private readonly alias: string;
    private readonly mapper: (path: string) => string;

    constructor(alias: string, mapper: (path: string) => string) {
        this.alias = alias;
        this.mapper = mapper;
    }

    public matched(dc: DialogContext, path: string): boolean {
        return (path.startsWith(this.alias) && path.length > 0)
    }

    public getValue(dc: DialogContext, memory: object, path: string): any {
        return dc.state.getValue(this.mapper(path));
    }

    public setValue(dc: DialogContext, memory: object, path: string, value: any): void {
        return dc.state.setValue(this.mapper(path), value);
    }

    public removeValue(dc: DialogContext, memory: object, path: string): void {
        return dc.state.removeValue(this.mapper(path));
    }
}