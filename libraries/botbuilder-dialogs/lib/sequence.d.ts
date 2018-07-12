import { Dialog } from './dialog';
import { DialogContext } from './dialogContext';
export interface SequenceStep {
    readonly id: string | undefined;
    onStep(dc: DialogContext, step: SequenceStepContext): Promise<void>;
}
export interface SequenceStepContext {
    result?: any;
    form: object;
    stepState: object;
    next(): Promise<void>;
}
export declare class Sequence extends Dialog {
    private readonly steps;
    constructor(steps: SequenceStep[]);
    dialogBegin(dc: DialogContext, args?: any): Promise<void>;
    dialogContinue(dc: DialogContext): Promise<void>;
    dialogResume(dc: DialogContext, result?: any): Promise<void>;
    private runNextStep(dc, form, afterId?);
    private runStep(dc, state, result?);
}
export interface SequenceState {
    form: object;
    stepId: string;
    stepState: object;
}
