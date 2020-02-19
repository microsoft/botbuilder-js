/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogContext, Configurable, DialogConfiguration } from 'botbuilder-dialogs';
import { ActionScopeResult, ActionScopeCommands } from './actionScope';
import { StringExpression, BoolExpression } from '../expressionProperties';

export interface GotoActionConfiguration extends DialogConfiguration {
    actionId?: string;
    disabled?: string | boolean;
}

export class GotoAction<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.GotoAction';

    public constructor();
    public constructor(actionId?: string) {
        super();
        if (actionId) { this.actionId = new StringExpression(actionId); }
    }

    /**
     * The action id to go.
     */
    public actionId: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public configure(config: GotoActionConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'actionId':
                        this.actionId = new StringExpression(value);
                        break;
                    case 'disabled':
                        this.disabled = new BoolExpression(value);
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (!this.actionId) {
            throw new Error(`Action id cannot be null.`);
        }

        const actionScopeResult: ActionScopeResult = {
            actionScopeCommand: ActionScopeCommands.GotoAction,
            actionId: this.actionId.getValue(dc.state)
        };

        return await dc.endDialog(actionScopeResult);
    }

    protected onComputeId(): string {
        return `GotoAction[${ this.actionId.toString() }]`;
    }
}