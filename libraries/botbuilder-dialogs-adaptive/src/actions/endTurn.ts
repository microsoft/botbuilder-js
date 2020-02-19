/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogContext, DialogConfiguration, Configurable } from 'botbuilder-dialogs';
import { ActivityTypes } from 'botbuilder-core';
import { BoolExpression } from '../expressionProperties';

export interface EndTurnConfiguration extends DialogConfiguration {
    disabled?: string | boolean;
}

export class EndTurn<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.EndTurn';

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public configure(config: EndTurnConfiguration): this {
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
        return Dialog.EndOfTurn;
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        const activity = dc.context.activity;
        if (activity.type === ActivityTypes.Message) {
            return await dc.endDialog();
        } else {
            return Dialog.EndOfTurn;
        }
    }

    protected onComputeId(): string {
        return `EndTurn[]`;
    }
}