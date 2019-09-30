/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PathResolver } from './pathResolver';
import { DialogContext } from '../dialogContext';

export class ParentStateResolver implements PathResolver {
    private readonly alias: string;

    constructor(alias = '$') {
        this.alias = alias;
    }

    public matched(dc: DialogContext, path: string): boolean {
        return (path.startsWith(this.alias) && path.length > 0)
    }

    public getValue(dc: DialogContext, memory: object[], path: string, defaultValue?: any): any {
        if (!dc.parent) { throw new Error(`ParentStateResolver: no parent dialog for path "${path}".`) }

        return dc.parent.state.getValue('dialog.' + path.substr(1), defaultValue);
    }

    public setValue(dc: DialogContext, memory: object[], path: string, value: any): void {
        if (!dc.parent) { throw new Error(`ParentStateResolver: no parent dialog for path "${path}".`) }

        return dc.parent.state.setValue('dialog.' + path.substr(1), value);
    }

    public removeValue(dc: DialogContext, memory: object[], path: string): void {
        if (!dc.parent) { throw new Error(`ParentStateResolver: no parent dialog for path "${path}".`) }

        return dc.parent.state.removeValue('dialog.' + path.substr(1));
    }
}