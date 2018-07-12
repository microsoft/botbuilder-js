import { Activity } from 'botbuilder';
import { Choice } from 'botbuilder-prompts';
import { DialogContext } from '../dialogContext';
import { SequenceStep, SequenceStepContext } from '../sequence';
import { PromptOptions } from '../prompts/prompt';
export declare class FillFieldStep<O extends PromptOptions = PromptOptions> implements SequenceStep {
    private field;
    private promptDialogId;
    private prompt;
    private choicesOrOptions;
    private options;
    constructor(field: string, promptDialogId: string, prompt: string | Partial<Activity>, choicesOrOptions?: O | (string | Choice)[], options?: O);
    readonly id: string;
    onStep(dc: DialogContext, step: SequenceStepContext): Promise<void>;
}
