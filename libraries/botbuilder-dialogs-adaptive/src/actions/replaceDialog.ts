/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, TurnPath } from 'botbuilder-dialogs';
import { BaseInvokeDialog, BaseInvokeDialogConfiguration } from './baseInvokeDialog';
import { BoolExpression } from '../expressionProperties';

export interface ReplaceDialogConfiguration extends BaseInvokeDialogConfiguration {
    disabled?: string | boolean;
}

export class ReplaceDialog<O extends object = {}> extends BaseInvokeDialog<O> {
    public static declarativeType = 'Microsoft.ReplaceDialog';

    /**
     * Creates a new `ReplaceWithDialog` instance.
     * @param dialogId ID of the dialog to goto.
     * @param options (Optional) static options to pass the dialog.
     */
    public constructor();
    public constructor(dialogIdToCall: string, options?: O);
    public constructor(dialogIdToCall?: string, options?: O) {
        super(dialogIdToCall, options);
    }

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public configure(config: ReplaceDialogConfiguration): this {
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

        const dialog = this.resolveDialog(dc);
        const boundOptions = this.bindOptions(dc, options);

        dc.state.setValue(TurnPath.ACTIVITYPROCESSED, this.activityProcessed.getValue(dc.state));

        return await dc.replaceDialog(dialog.id, boundOptions);
    }
}