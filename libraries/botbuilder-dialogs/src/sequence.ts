import { TurnContext, Promiseable, ActivityTypes } from 'botbuilder';
import { Dialog } from './dialog';
import { DialogContext } from './dialogContext';

export interface SequenceStep<C extends TurnContext> {
    readonly id: string|undefined;
    onStep(dc: DialogContext<C>, step: SequenceStepContext): Promise<void>;
}

export interface SequenceStepContext {
    result?: any;
    form: object;
    stepState: object;
    next(): Promise<void>;
}

export class Sequence<C extends TurnContext> extends Dialog<C> {
    private readonly steps: SequenceStepInfo<C>[] = [];


    public add(step: SequenceStep<C>): this {
        this.steps.push({ id: step.id || this.steps.length.toString(), step: step });
        return this;
    }

    public async dialogBegin(dc: DialogContext<C>, args?: any): Promise<void> {
        await this.runNextStep(dc, Object.assign({}, args));
    }

    public async dialogContinue(dc: DialogContext<C>): Promise<void> {
        // Don't do anything for non-message activities
        if (dc.context.activity.type === ActivityTypes.Message) {
            const state = dc.activeDialog.state as SequenceState;
            await this.runStep(dc, state);
        }
    }

    public async dialogResume(dc: DialogContext<C>, result?: any): Promise<void> {
        const state = dc.activeDialog.state as SequenceState;
        await this.runStep(dc, state, result);
    }

    private async runNextStep(dc: DialogContext<C>, form: object, afterId?: string): Promise<void> {
        // Find next step id
        let index = 0; 
        if (afterId) {
            for (let i = 0; i < this.steps.length; i++) {
                if (this.steps[i].id === afterId) {
                    index = i + 1;
                    break;
                }
            }
        }
        if (index < this.steps.length) {
            // Update state
            const state: SequenceState = {
                form: form,
                stepId: this.steps[0].id,
                stepState: {}
            };
            dc.activeDialog.state = state;
            await this.runStep(dc, state);
        } else {
            await dc.end();
        }
    }

    private async runStep(dc: DialogContext<C>, state: SequenceState, result?: any): Promise<void> {
        const steps = this.steps.filter((s) => s.id === state.stepId);
        const sc: SequenceStepContext = {
            result: result,
            form: state.form,
            stepState: state.stepState,
            next: () => this.runNextStep(dc, state.form, state.stepId)
        }
        await steps[0].step.onStep(dc, sc);
    }
}

interface SequenceStepInfo<C extends TurnContext> {
    id: string;
    step: SequenceStep<C>;
}

export interface SequenceState {
    form: object;
    stepId: string;
    stepState: object;
}