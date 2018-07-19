import { ActivityTypes } from '../../botbuilder/lib';
import { Dialog, DialogTurnResult } from './dialog';
import { DialogContext } from './dialogContext';

export interface SequenceStep {
    getId(stepIndex: number): string;
    onStep(dc: DialogContext, step: SequenceStepContext): Promise<DialogTurnResult>;
}

export interface SequenceStepContext {
    readonly id: string;
    result?: any;
    values: object;
    state: object;
    next(): Promise<DialogTurnResult>;
}

export class SequenceDialog extends Dialog {
    private readonly steps: SequenceStepInfo[];

    constructor (dialogId: string, steps: SequenceStep[]) {
        super(dialogId);
        let index = 0; 
        this.steps = steps.map((s) => {
            return {
                id: s.getId(index++),
                step: s 
            } as SequenceStepInfo;
        });
    }

    public async dialogBegin(dc: DialogContext, dialogArgs?: any): Promise<DialogTurnResult> {
        return await this.runNextStep(dc, Object.assign({}, dialogArgs));
    }

    public async dialogContinue(dc: DialogContext): Promise<DialogTurnResult> {
        const state = dc.activeDialog.state as SequenceState;
        return await this.runStep(dc, state);
    }

    public async dialogResume(dc: DialogContext, result?: any): Promise<DialogTurnResult> {
        const state = dc.activeDialog.state as SequenceState;
        return await this.runStep(dc, state, result);
    }

    private async runNextStep(dc: DialogContext, values: object, afterId?: string): Promise<DialogTurnResult> {
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
                values: values,
                stepId: this.steps[0].id,
                stepState: {}
            };
            dc.activeDialog.state = state;
            return await this.runStep(dc, state);
        } else {
            return await dc.end();
        }
    }

    private async runStep(dc: DialogContext, state: SequenceState, result?: any): Promise<DialogTurnResult> {
        const step: SequenceStepContext = {
            id: state.stepId,
            result: result,
            values: state.values,
            state: state.stepState,
            next: () => this.runNextStep(dc, state.values, state.stepId)
        }
        return await this.onRunStep(dc, step);
    }

    protected async onRunStep(dc: DialogContext, step: SequenceStepContext): Promise<DialogTurnResult> {
        const steps = this.steps.filter((s) => s.id === step.id);
        return await steps[0].step.onStep(dc, step);
    }
}

interface SequenceStepInfo {
    id: string;
    step: SequenceStep;
}

export interface SequenceState {
    values: object;
    stepId: string;
    stepState: object;
}