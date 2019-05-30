/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { InputDialogConfiguration, InputDialog, InputDialogOptions, InputState, PromptType } from "./inputDialog";
import { DialogContext } from "botbuilder-dialogs";
import { Attachment } from "botbuilder-core";

export interface AttachmentInputConfiguration extends InputDialogConfiguration {
    outputFormat?: AttachmentOutputFormat;
}

export enum AttachmentOutputFormat {
    all = 'all',
    first = 'first'
}

export class AttachmentInput extends InputDialog<InputDialogOptions> {

    public outputFormat = AttachmentOutputFormat.first;
    
    constructor();
    constructor(property: string, prompt: PromptType);
    constructor(property: string, entityName: string, prompt: PromptType);
    constructor(property?: string, entityName?: string|PromptType, prompt?: PromptType) {
        super();
        if (property) {
            if(!prompt) {
                prompt = entityName;
                entityName = undefined;
            }
            this.property = property;
            if (typeof entityName == 'string') { this.entityName = entityName }
            this.prompt.value = prompt;
        }
    }

    public configure(config: AttachmentInputConfiguration): this {
        return super.configure(config);
    }

    protected onComputeID(): string {
        return `textInput[${this.bindingPath()}]`;
    }

    protected getDefaultInput(dc: DialogContext): any {
        const attachments = dc.context.activity.attachments;
        return Array.isArray(attachments) && attachments.length > 0 ? attachments : undefined;
    }
    
    protected async onRecognizeInput(dc: DialogContext, consultation: boolean): Promise<InputState> {
        // Recognize input and filter out non-attachments
        let input: Attachment|Attachment[] = dc.state.getValue(InputDialog.INPUT_PROPERTY);
        const attachments = Array.isArray(input) ? input : [input];
        const first = attachments.length > 0 ? attachments[0] : undefined;
        if (typeof first != 'object' || (!first.contentUrl && !first.content)) {
            return InputState.unrecognized;
        }

        // Format output and return success
        switch (this.outputFormat) {
            case AttachmentOutputFormat.all:
                dc.state.setValue(InputDialog.INPUT_PROPERTY, attachments);
                break;
            case AttachmentOutputFormat.first:
                dc.state.setValue(InputDialog.INPUT_PROPERTY, first);
                break;
        }

        return InputState.valid;
    }
}