/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ArrayExpression, StringExpression } from 'adaptive-expressions';
import { DialogContext, DialogTurnResult, DialogPath, DialogEvent, TurnPath, DialogTurnStatus } from 'botbuilder-dialogs';
import { SendActivity } from '../actions/sendActivity';

/**
 * Ask for an open-ended response.
 * This sends an activity and then terminates the turn with `DialogTurnStatus.completeAndWait`.
 * The next activity from the user will then be handled by the parent adaptive dialog.
 * It also builds in a model of the properties that are expected in response through `DialogPath.expectedProperties`.
 * `DialogPath.retries` is updated as the same question is asked multiple times.
 */
export class Ask extends SendActivity {

    public constructor(text?: string, expectedProperties?: ArrayExpression<string>) {
        super(text);
        this.expectedProperties = expectedProperties;
    }

    /**
     * Gets or sets properties expected to be filled by response.
     */
    public expectedProperties: ArrayExpression<string>;

    /**
     * Gets or sets the default operation that will be used when no operation is recognized.
     */
    public defaultOperation: StringExpression;

    public async beginDialog(dc: DialogContext, options?: object): Promise<DialogTurnResult> {
        // get number of retries from memory
        let retries: number = dc.state.getValue<number>(DialogPath.retries, 0);

        const expected: string[] = this.expectedProperties ? this.expectedProperties.getValue(dc.state) : undefined;
        const trigger: DialogEvent = dc.state.getValue<DialogEvent>(TurnPath.dialogEvent);
        const lastExpectedProperties: string[] = dc.state.getValue<string[]>(DialogPath.expectedProperties);
        const lastTrigger: DialogEvent = dc.state.getValue<DialogEvent>(DialogPath.lastTriggerEvent);

        if (expected && lastExpectedProperties && lastTrigger
            && !expected.some((prop: string): boolean => !lastExpectedProperties.some((lastProp: string): boolean => lastProp === prop))
            && !lastExpectedProperties.some((lastProp: string): boolean => !expected.some((prop: string): boolean => prop === lastProp))
            && lastTrigger.name === trigger.name) {
            retries++;
        } else {
            retries = 0;
        }

        dc.state.setValue(DialogPath.retries, retries);
        dc.state.setValue(DialogPath.lastTriggerEvent, trigger);
        dc.state.setValue(DialogPath.expectedProperties, expected);

        const result = await super.beginDialog(dc, options);
        result.status = DialogTurnStatus.completeAndWait;
        return result;
    }
}
