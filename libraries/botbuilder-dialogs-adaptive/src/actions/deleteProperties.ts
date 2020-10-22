/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BoolExpression, BoolExpressionConverter, Expression, StringExpression } from 'adaptive-expressions';
import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';

class PropertiesConverter implements Converter<string[], StringExpression[]> {
    public convert(value: string[] | StringExpression[]): StringExpression[] {
        const results: StringExpression[] = [];
        value.forEach((item: string | StringExpression) => {
            results.push(item instanceof StringExpression ? item : new StringExpression(item));
        });
        return results;
    }
}

export interface DeletePropertiesConfiguration extends DialogConfiguration {
    properties?: string[] | StringExpression[];
    disabled?: boolean | string | Expression | BoolExpression;
}

/**
 * Deletes a collection of properties from memory.
 */
export class DeleteProperties<O extends object = {}> extends Dialog<O> implements DeletePropertiesConfiguration {
    public static $kind = 'Microsoft.DeleteProperties';

    public constructor();

    /**
     * Initializes a new instance of the [DeleteProperties](xref:botbuilder-dialogs-adaptive.DeleteProperties) class.
     * @param properties Optional. Collection of property paths to remove.
     */
    public constructor(properties?: string[]) {
        super();
        if (properties) {
            this.properties = properties.map((property): StringExpression => new StringExpression(property));
        }
    }

    /**
     * Collection of property paths to remove.
     */
    public properties: StringExpression[] = [];

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public getConverter(property: keyof DeletePropertiesConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'properties':
                return new PropertiesConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) is started and pushed onto the dialog stack.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (this.properties && this.properties.length > 0) {
            for (let i = 0; i < this.properties.length; i++) {
                dc.state.deleteValue(this.properties[i].getValue(dc.state));
            }
        }

        return await dc.endDialog();
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `DeleteProperties[${this.properties.map((property): string => property.toString()).join(',')}]`;
    }
}
