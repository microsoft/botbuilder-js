import { TurnContext, Activity } from 'botbuilder';
import { Choice } from 'botbuilder-prompts';
import { DialogContext } from '../dialogContext';
import { SequenceStep, SequenceStepContext } from '../sequence';
import { PromptOptions } from '../prompts/prompt';

export class FillFieldStep<O extends PromptOptions = PromptOptions> implements SequenceStep {
    constructor (private field: string, private promptDialogId: string, private prompt: string|Partial<Activity>,  private choicesOrOptions?: O|(string|Choice)[], private options?: O ) {
    }

    public get id(): string {
        return this.field + '-prompt';
    }
    
    public async onStep(dc: DialogContext, step: SequenceStepContext): Promise<void> {
        const state = step.stepState as PromptState;
        if (state.prompted) {
            step.form[this.field] = step.result;
            await step.next();
        } else {
            const value = step.form[this.field];
            if (value === undefined) {
                state.prompted = true;
                await dc.prompt(this.promptDialogId, this.prompt, this.choicesOrOptions, this.options);
            } else {
                await step.next();
            }
        }
    }
}

interface PromptState {
    prompted: boolean;
}
