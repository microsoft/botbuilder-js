/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogContext, Configurable, DialogConfiguration } from 'botbuilder-dialogs';
import { ActionScopeResult, ActionScopeCommands } from './actionScope';
import { BoolExpression } from '../expressionProperties';

export interface BreakLoopConfiguration extends DialogConfiguration {
    disabled?: string | boolean;
}

export class BreakLoop<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.BreakLoop';

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public configure(config: BreakLoopConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
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

        const actionScopeResult: ActionScopeResult = {
            actionScopeCommand: ActionScopeCommands.BreakLoop
        };

        return await dc.endDialog(actionScopeResult);
    }

    protected onComputeId(): string {
        return `BreakLoop[]`;
    }
}