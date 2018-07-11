import { TurnContext } from 'botbuilder';
import { Dialog } from './dialog';
import { DialogContext } from './dialogContext';
export interface SequenceStep<C extends TurnContext> {
    id: string | undefined;
    onStep(dc: DialogContext<C>, step: SequenceStepContext): Promise<void>;
}
export interface SequenceStepContext {
    result?: any;
    form: object;
    stepState: object;
    next(): Promise<void>;
}
export declare class Sequence<C extends TurnContext> extends Dialog<C> {
    private readonly steps;
    add(step: SequenceStep<C>): this;
    dialogBegin(dc: DialogContext<C>, args?: any): Promise<void>;
    dialogContinue(dc: DialogContext<C>): Promise<void>;
    dialogResume(dc: DialogContext<C>, result?: any): Promise<void>;
    private runNextStep(dc, form, afterId?);
    private runStep(dc, state, result?);
}
export interface SequenceState {
    form: object;
    stepId: string;
    stepState: object;
}
