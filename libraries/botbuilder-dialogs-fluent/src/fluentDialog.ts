import { 
    Dialog, 
    DialogContext,
    DialogReason, 
    DialogTurnResult,
} from 'botbuilder-dialogs'

import { 
    DialogFlowContext,
    DialogFlowTask
} from './'

import { 
    DialogFlowDispatcher,
    FluentDialogState
 } from './dialogFlowDispatcher';


/**
 * Similar with a durable function, a FluentDialog uses event sourcing to enable arbitrarily complex user 
 * interactions in a seemingly uninterrupted execution flow. 
 * Behind the scenes, the yield operator in the dialog flow function yields control of the execution thread 
 * back to a dialog flow dispatcher. The dispatcher then commits any new actions that the dialog flow function 
 * scheduled (such as starting a child dialog, receiving an activity or making an async call) to storage.
 * The transparent commit action updates the execution history of the dialog flow by appending all new events 
 * into the dialog state, much like an append-only log. 
 * Once the history is updated, the dialog ends its turn and, when it is later resumed, the dispatcher re-executes
 * the entire function from the start to rebuild the local state. 
 * During the replay, if the code tries to begin a child dialog (or do any  async work), the dispatcher consults
 * the execution history, replays that result and the function code continues to run. 
 * The replay continues until the function code is finished or until it yields a new suspension task.
 * @param O (Optional) type of options passed to the fluent dialog in the call to `DialogContext.beginDialog()`.
 * @param T (Optional) type of value returned by the dialog flow function.
 */
export class FluentDialog<O extends object = {}, T = any> extends Dialog<O> {

    /**
     * Creates a new FluentDialog instance.
     *
     * @param dialogId Unique ID of the dialog within the component or set its being added to.
     * @param dialogFlow The workflow generator function.
     */
    constructor(
        dialogId: string, 
        private readonly dialogFlow: (context: DialogFlowContext<O>) => Generator<DialogFlowTask, T>
    ) {
        super(dialogId);
    }

    /**
     * @inheritdoc
     */
    public override beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        const state: FluentDialogState<O> = dc.activeDialog!.state as FluentDialogState<O>;
        state.options = options || ({} as O);
        state.history = [];

        return this.runWorkflow(dc, DialogReason.beginCalled);
    }

    /**
     * @inheritdoc
     */
    public override continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        return this.resumeDialog(dc, DialogReason.continueCalled);
    }

    /**
     * @inheritdoc
     */
    public override resumeDialog(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        return this.runWorkflow(dc, reason, result);
    }

    /**
     * Executes the dialog flow up to the next task 
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param reason The [Reason](xref:botbuilder-dialogs.DialogReason) the workflow is being executed.
     * @param result Optional, result returned by a dialog called in the previous workflow step.
     * @returns A Promise that represents the work queued to execute.
     */
    protected runWorkflow(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        const dispatcher = new DialogFlowDispatcher<O,T>(dc);
        return dispatcher.run(this.dialogFlow, reason, result);
    }
}
