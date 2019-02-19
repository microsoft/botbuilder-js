/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, Dialog, DialogCommand, DialogContext } from 'botbuilder-dialogs';
import { ActivityProperty } from '../activityProperty';

export class SendList extends DialogCommand {

    protected onComputeID(): string {
        return `sendList(${this.bindingPath()})`;
    }

    public listProperty: string;

    public messageTemplate = new ActivityProperty();

    public itemTemplate = new ActivityProperty();

    protected async onRunCommand(dc: DialogContext): Promise<DialogTurnResult> {
        // Render list content
        let list = '';
        const value = dc.state.getValue(this.listProperty);
        if (Array.isArray(value) && value.length > 0) {
            value.forEach((item) => {
                list += this.itemTemplate.format(dc, { item: item }).text;
            });
        } else if (typeof value === 'object') {
            for (const key in value) {
                list += this.itemTemplate.format(dc, { key: key, item: value[key] }).text;
            }
        }

        // Render message
        const activity = this.messageTemplate.format(dc, { utterance: dc.context.activity.text || '', list: list });
        const result = await dc.context.sendActivity(activity);
        return await dc.endDialog(result);
    }

    static create(listProperty: string, messageTemplate: string, itemTemplate?: string, config?: DialogConfiguration): SendList {
        itemTemplate = itemTemplate || '- {item}\n';
        if (messageTemplate.indexOf('{list}') < 0) {
            messageTemplate += '\n\n{list}';
        }
        if (itemTemplate.indexOf('{item') < 0) {
            itemTemplate += ' {item}\n';
        }
        
        const dialog = new SendList();
        dialog.listProperty = listProperty;
        dialog.messageTemplate.value = messageTemplate;
        dialog.itemTemplate.value = itemTemplate;
        if (config) {
            Dialog.configure(dialog, config);
        }
        return dialog;
    }
}