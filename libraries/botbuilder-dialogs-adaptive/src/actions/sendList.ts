/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog } from 'botbuilder-dialogs';
import { ActivityProperty } from '../activityProperty';

export interface SendListConfiguration extends DialogConfiguration {
    /**
     * In-memory state property that contains the map or list.
     */
    listProperty?: string;

    /**
     * Template to use for the main message body.
     */
    messageTemplate?: string;

    /**
     * (Optional) template used to format individual items.
     */
    itemTemplate?: string;
}

export class SendList extends Dialog {
    private readonly _messageTemplate = new ActivityProperty();
    private readonly _itemTemplate = new ActivityProperty();

    /**
     * Creates a new `SendList` instance.
     * @param listProperty In-memory state property that contains the map or list.
     * @param messageTemplate Template to use for the main message body.
     * @param itemTemplate (Optional) template used to format individual items.
     */
    constructor();
    constructor(listProperty: string, messageTemplate: string, itemTemplate?: string);
    constructor(listProperty?: string, messageTemplate?: string, itemTemplate?: string) {
        super();
        if (listProperty) { this.listProperty = listProperty }
        if (messageTemplate) { this.messageTemplate = messageTemplate }
        if (itemTemplate) { this.itemTemplate = itemTemplate }
    }

    protected onComputeId(): string {
        return `SendList[${this.listProperty}]`;
    }

    /**
     * In-memory state property that contains the map or list.
     */
    public listProperty: string;

    /**
     * Template to use for the main message body.
     */
    public set messageTemplate(value: string) {
        this._messageTemplate.value = value;
    }

    public get messageTemplate(): string {
        return this._messageTemplate.value as string;
    }

    /**
     * (Optional) template used to format individual items.
     */
    public set itemTemplate(value: string) {
        this._itemTemplate.value = value;
    }

    public get itemTemplate(): string {
        return this._itemTemplate.value as string;
    }

    public configure(config: SendListConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // Ensure templates configured
        if (!this.messageTemplate) {
            this.messageTemplate = '{list}';
        } else if (this.messageTemplate.indexOf('{list') < 0) {
            this.messageTemplate += '\n\n{list}';
        }
        if (!this.itemTemplate) {
            this.itemTemplate = '- {item}\n';
        } else if (this.itemTemplate.indexOf('{item') < 0) {
            this.itemTemplate += ' {item}\n';
        }

        // Render list content
        let list = '';
        const value = dc.state.getValue(this.listProperty).value;
        if (Array.isArray(value) && value.length > 0) {
            value.forEach((item) => {
                list += this._itemTemplate.format(dc, { item: item }).text;
            });
        } else if (typeof value === 'object') {
            for (const key in value) {
                list += this._itemTemplate.format(dc, { key: key, item: value[key] }).text;
            }
        }

        // Render message
        const activity = this._messageTemplate.format(dc, { utterance: dc.context.activity.text || '', list: list });
        const result = await dc.context.sendActivity(activity);
        return await dc.endDialog(result);
    }
}