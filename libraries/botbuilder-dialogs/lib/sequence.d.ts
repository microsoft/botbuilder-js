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
export declare class Sequence extends Dialog {
    private readonly steps;
    constructor(steps: SequenceStep[]);
    dialogBegin(dc: DialogContext, dialogArgs?: any): Promise<DialogTurnResult>;
    dialogContinue(dc: DialogContext): Promise<DialogTurnResult>;
    dialogResume(dc: DialogContext, result?: any): Promise<DialogTurnResult>;
    private runNextStep(dc, values, afterId?);
    private runStep(dc, state, result?);
    protected onRunStep(dc: DialogContext, step: SequenceStepContext): Promise<DialogTurnResult>;
}
export interface SequenceState {
    values: object;
    stepId: string;
    stepState: object;
}
