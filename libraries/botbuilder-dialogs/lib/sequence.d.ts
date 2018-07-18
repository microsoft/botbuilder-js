import { Dialog, DialogTurnResult } from './dialog';
import { DialogContext } from './dialogContext';
export interface SequenceStep {
    getId(stepIndex: number): string;
    onStep(dc: DialogContext, step: SequenceStepContext): Promise<DialogTurnResult>;
}
export interface SequenceStepContext {
    result?: any;
    values: object;
    state: object;
    next(): Promise<DialogTurnResult>;
}
export declare class Sequence extends Dialog {
    private readonly steps;
    constructor(steps: SequenceStep[]);
    dialogBegin(dc: DialogContext, args?: any): Promise<DialogTurnResult>;
    dialogContinue(dc: DialogContext): Promise<DialogTurnResult>;
    dialogResume(dc: DialogContext, result?: any): Promise<DialogTurnResult>;
    private runNextStep(dc, form, afterId?);
    private runStep(dc, state, result?);
}
export interface SequenceState {
    values: object;
    stepId: string;
    stepState: object;
}
