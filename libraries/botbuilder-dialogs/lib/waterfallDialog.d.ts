import { DialogContext } from './dialogContext';
import { Dialog, DialogTurnResult, DialogReason } from './dialog';
/**
 * Function signature of a waterfall step.
 *
 * @remarks
 *
 * ```TypeScript
 * type WaterfallStep = (dc: DialogContext, args?: any, next?: SkipStepFunction) => Promise<DialogTurnResult>;
 * ```
 * @param WaterfallStep.context The dialog context for the current turn of conversation.
 * @param WaterfallStep.step Contextual information for the current step being executed.
 */
export declare type WaterfallStep<O extends object = {}> = (dc: DialogContext, step: WaterfallStepContext<O>) => Promise<DialogTurnResult>;
export interface WaterfallStepContext<O extends object = {}> {
    /** The index of the current waterfall step being executed. */
    readonly index: number;
    /** Any options the waterfall dialog was called with. */
    readonly options: O;
    /** The reason the waterfall step is being executed. */
    readonly reason: DialogReason;
    /** Results returned by a dialog called in the previous waterfall step. */
    readonly result: any;
    /** A dictionary of values which will be persisted across all waterfall steps. */
    readonly values: object;
    /**
     * Used to skip to the next waterfall step.
     * @param result (Optional) result to pass to the next step.
     */
    next(result?: any): Promise<DialogTurnResult>;
}
/**
 * When called within a waterfall step the dialog will skip to the next waterfall step.
 *
 * ```TypeScript
 * type SkipStepFunction = (args?: any) => Promise<DialogTurnResult>;
 * ```
 * @param SkipStepFunction.args (Optional) additional argument(s) to pass into the next step.
 */
export declare type SkipStepFunction = (args?: any) => Promise<DialogTurnResult>;
/**
 * Dialog optimized for prompting a user with a series of questions.
 *
 * @remarks
 * Waterfalls accept a stack of functions which will be executed in sequence. Each waterfall step
 * can ask a question of the user and the users response will be passed as an argument to the next
 * waterfall step.
 */
export declare class WaterfallDialog<O extends object = {}> extends Dialog<O> {
    private readonly steps;
    /**
     * Creates a new waterfall dialog containing the given array of steps.
     * @param steps Array of waterfall steps.
     */
    constructor(dialogId: string, steps: WaterfallStep<O>[]);
    dialogBegin(dc: DialogContext, options?: O): Promise<DialogTurnResult>;
    dialogContinue(dc: DialogContext): Promise<DialogTurnResult>;
    dialogResume(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult>;
    protected onStep(dc: DialogContext, step: WaterfallStepContext<O>): Promise<DialogTurnResult>;
    private runStep(dc, index, reason, result?);
}
