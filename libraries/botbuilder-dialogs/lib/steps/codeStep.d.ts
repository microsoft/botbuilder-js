import { TurnContext } from 'botbuilder';
import { DialogContext } from '../dialogContext';
import { SequenceStep, SequenceStepContext } from '../sequence';
export declare type CodeStepHandler = (dc: DialogContext, step: SequenceStepContext) => Promise<void>;
export declare class CodeStep implements SequenceStep {
    private readonly handler;
    constructor(idOrHandler: string | CodeStepHandler, handler?: CodeStepHandler);
    readonly id: string | undefined;
    onStep(dc: DialogContext<TurnContext>, step: SequenceStepContext): Promise<void>;
}
