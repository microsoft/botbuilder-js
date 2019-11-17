/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogContext, DialogTurnResult, DialogConfiguration } from 'botbuilder-dialogs';
import { ActivityTypes } from 'botbuilder-core';

export interface ExpectMessageConfiguration extends DialogConfiguration {
    anyOf?: string|string[];
}

export class ExpectMessage extends Dialog {

    public constructor();
    public constructor(anyOf: string|string[]);
    public constructor(config: ExpectMessageConfiguration);
    public constructor(configOrAnyOf?: ExpectMessageConfiguration|string|string[]) {
        super();
        if (configOrAnyOf) {
            if (Array.isArray(configOrAnyOf) || typeof configOrAnyOf == 'string') {
                this.configure({ anyOf: configOrAnyOf });
            } else {
                this.configure(configOrAnyOf);
            }
        }
    }

    public anyOf: string[];

    protected onComputeId(): string {
        const label = this.anyOf ? this.anyOf.join(', ') : '<undefined>';
        return `ExpectMessage[${this.hashedLabel(label)}]`;
    }

    public configure(config: ExpectMessageConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch(key) {
                    case 'anyOf':
                        if (Array.isArray(value) && value.length > 0) {
                            this.anyOf = value;
                        } else if (typeof value == 'string') {
                            this.anyOf = [value];
                        }
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

    public async beginDialog(dc: DialogContext, options?: any): Promise<DialogTurnResult> {
        return Dialog.EndOfTurn;
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // Ensure configured
        if (!Array.isArray(this.anyOf) || this.anyOf.length == 0) { throw new Error(`${this.id}: the 'anyOf' property isn't configured.`) }

        // Assert that a message was received
        const { type, text } = dc.context.activity;
        if (type != ActivityTypes.Message) { throw new Error(`${this.id}: received an activity of type '${type}' instead of 'message'.`) }

        // Assert that message matches expected message(s)
        for (const message of this.anyOf) {
            if (message == text) {
                return await dc.endDialog();
            }
        }

        throw new Error(`${this.id}: unexpected message received: ${text}`);
    }
}
