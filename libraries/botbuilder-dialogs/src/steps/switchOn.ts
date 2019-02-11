/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand } from '../dialogCommand';
import { DialogContext } from '../dialogContext';
import { DialogTurnResult, Dialog, DialogConfiguration } from '../dialog';

export interface SwitchOnConfiguration extends DialogConfiguration {
    /**
     * The in-memory state property to switch on.
     */
    property: string;
}

export class SwitchOn extends DialogCommand {
    private tests: { value: string; step: Dialog; }[] = [];
    private _default: Dialog;

    protected onComputeID(): string {
        return `switch(${this.bindingPath()})`;
    }

    /**
     * The in-memory state property to switch on.
     */
    public set property(value: string) {
        this.inputBindings['value'] = value;
    }

    public get property(): string {
        return this.inputBindings['value'];
    }

    public addTest(value: string, step: Dialog): this {
        // Save test to list
        this.tests.push({ value: value, step: step });
        
        // Save step to be automatically registered with the DialogSet that the Condition dialog
        // is added to.
        this.steps.push(step);
        
        return this;
    }

    public caseDo(value: string, step: Dialog): this {
        this.addTest(value, step);
        return this;
    }

    public defaultDo(step: Dialog): this {
        this._default = step;
        this.steps.push(step);
        return this;
    }

    protected async onRunCommand(dc: DialogContext, options: object): Promise<DialogTurnResult> {
        // Normalize value to switch on
        // - Choice prompts return a FoundChoice object which nest the value one level.
        let value = options['value'];
        if (typeof value === 'object' && typeof value.hasOwnProperty('value')) {
            value = value['value'];
        }

        // Look for first matching value.
        const v = value.toString();
        const comparer = typeof value === 'boolean' ? compareLowercase : compareEqual;
        for (let i = 0; i < this.tests.length; i++) {
            const test = this.tests[i];
            const result = comparer(v, test.value);
            if (result) {
                // Replace condition with step
            }
        }

        // Branch to default step or just end
        if (this._default) {
            return await dc.replaceDialog(this._default.id);
        } else {
            return await dc.endDialog();
        }
    }

    static create(config: SwitchOnConfiguration): SwitchOn {
        const dialog = new SwitchOn();
        dialog.property = config.property;
        Dialog.configure(dialog, config);
        return dialog;
    }
}

function compareEqual(a: string, b: string): boolean {
    return a == b;
}

function compareLowercase(a: string, b: string): boolean {
    return a.toLowerCase() == b.toLowerCase();
}
