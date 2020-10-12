/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Converters, DialogTurnResult, DialogContext, Dialog, Properties } from 'botbuilder-dialogs';
import {
    BoolExpression,
    BoolExpressionConverter,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';

export class DeleteProperty<O extends object = {}> extends Dialog<O> {
    public static $kind = 'Microsoft.DeleteProperty';

    /**
     * Creates a new `DeleteProperty` instance.
     * @param property (Optional) property to delete.
     */
    public constructor();
    public constructor(property?: string) {
        super();
        if (property) {
            this.property = new StringExpression(property);
        }
    }

    /**
     * The property to delete.
     */
    public property: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public getConverters(): Converters<Properties<DeleteProperty>> {
        return {
            property: new StringExpressionConverter(),
            disabled: new BoolExpressionConverter(),
        };
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        dc.state.deleteValue(this.property.getValue(dc.state));
        return await dc.endDialog();
    }

    protected onComputeId(): string {
        return `DeleteProperty[${this.property.toString()}]`;
    }
}
