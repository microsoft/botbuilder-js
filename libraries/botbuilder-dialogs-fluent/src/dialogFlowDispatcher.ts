// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { 
    DialogFlowContext,
    DialogFlowTask,
    DialogFlowError,
    DialogFlowBoundCallable
 } from './';

import { 
    AbstractDialogFlowTask, 
    AsyncCallTask,
    DialogCallTask,
    RestartDialogFlowTask,
    SuspendDialogFlowTask,
    ReceiveActivityTask,
    TaskResult, 
    taskSucceeded, 
    taskFailed, 
    defaultProjector 
} from './tasks/';

import { 
    createHash, 
    randomUUID 
} from 'crypto';

import { 
    Choice,
    DialogContext,
    DialogReason, 
    DialogTurnResult,
    PromptOptions,
} from 'botbuilder-dialogs';

import { 
    Activity, 
    ResourceResponse, 
    TokenResponse, 
    TurnContext 
} from 'botbuilder-core';

import { Jsonify, JsonPrimitive, JsonValue } from 'type-fest';
import * as assert from 'node:assert';

/**
 * Workflow dispatcher implementation.
 */
export class DialogFlowDispatcher<O extends object, R = any> implements DialogFlowContext<O> {
    private readonly state: FluentDialogState<O>;
    private nextTask: number;

    /**
     * Initializes a new WorkflowDispatcher instance.
     * @param dc The dialog context for the current turn of conversation with the user.
     */
    constructor(private readonly dc: DialogContext) {
        this.state = dc.activeDialog!.state as FluentDialogState<O>
        this.nextTask = 0;
    }

    /**
     * @inheritdoc
     */
    public get options(): O {
        return this.state.options;
    }

    /**
     * @inheritdoc
     */
    public get channelId(): string {
        return this.dc.context.activity.channelId;
    }

    /**
     * @inheritdoc
     */
    public get dialogId(): string {
        return this.dc.activeDialog!.id
    }

    /**
     * @inheritdoc
     */
    public get isReplaying(): boolean {
        return (this.nextTask < this.state.history.length) || 
            !!(this.state.resumeState)
    }

    /**
     * @inheritdoc
     */
    public get currentUtcTime(): Date {
        return new Date(
            this.callBuiltIn(
                Date.now, 
                'currentUtcTime'));
    }

    /**
     * @inheritdoc
     */
    public newGuid(): string {
        return this.callBuiltIn(randomUUID, 'newGuid');
    }

    /**
     * @inheritdoc
     */
    public call<T>(
        task: (context: TurnContext) => Promise<T>
    ): DialogFlowTask<T> {
        return new AsyncCallTask<T>(task, defaultProjector);
    }

    /**
     * @inheritdoc
     */
    public callAsUser<T>(
        oauthDialogId: string, 
        task: (token: string, context: TurnContext) => Promise<T>
    ): DialogFlowTask<T> {
        return this.callDialog<TokenResponse|undefined>(oauthDialogId)
            .then((tokenResponse, context) => {
                if (!tokenResponse || !tokenResponse.token) {
                    throw new DialogFlowError("Sign-in failed.");
                }
                return task(tokenResponse.token, context);
            });
    }

    /**
     * @inheritdoc
     */
    public callDialog<T = any>(
        dialogId: string, 
        options?: object
    ): DialogFlowTask<T> {
        return new DialogCallTask<T>(dialogId, options, defaultProjector);
    }


    /**
     * Helper function to simplify formatting the options for calling a prompt dialog.
     *
     * @param dialogId ID of the prompt dialog to start.
     * @param promptOrOptions The text of the initial prompt to send the user,
     * or the [Activity](xref:botframework-schema.Activity) to send as the initial prompt.
     * @param choices Optional. Array of choices for the user to choose from,
     * for use with a [ChoicePrompt](xref:botbuilder-dialogs.ChoicePrompt).
     * @returns The task instance which will yield the prompt result.
     */
    public prompt<T = any>(
        dialogId: string,
        promptOrOptions: string | Partial<Activity> | PromptOptions,
        choices?: (string | Choice)[],
    ): DialogFlowTask<T> {
        let options: PromptOptions;
        if (
            (typeof promptOrOptions === 'object' && (promptOrOptions as Activity).type !== undefined) ||
            typeof promptOrOptions === 'string'
        ) {
            options = { prompt: promptOrOptions as string | Partial<Activity> };
        } else {
            options = { ...(promptOrOptions as PromptOptions) };
        }

        if (choices) {
            options.choices = choices;
        }

        return this.callDialog<T>(dialogId, options);
    }
    
    /**
     * @inheritdoc
     */
    public sendActivity(
        activityOrText: string | Partial<Activity>,
        speak?: string,
        inputHint?: string,
    ): DialogFlowTask<ResourceResponse|undefined> {        
        return this.call((context: TurnContext) => {
            return context.sendActivity(activityOrText, speak, inputHint);
        });
    }

    /**
     * @inheritdoc
     */
    public receiveActivity(): DialogFlowTask<Activity> {
        return new ReceiveActivityTask();
    }

    /**
     * @inheritdoc
     */
    public restart(options?: O): DialogFlowTask<never> {
        return new RestartDialogFlowTask(options);
    }

    /**
     * @inheritdoc
     */
    public bind<T extends (...args: any[]) => any>(
        func: T
    ): DialogFlowBoundCallable<Parameters<T>, Jsonify<ReturnType<T>>> {

        const context = this;
        const kind = `boundFunc_${func.name}_${func.length}`;

        function bound(...args: Parameters<T>) : Jsonify<ReturnType<T>> {
            const callId = context.getHashOf(`${args.toString()}`);
            if (context.nextTask == context.state.history.length) {
                assert.ok(!context.isReplaying);

                try {
                    context.state.history.push({
                        kind: kind,
                        hashedId: callId,
                        result: taskSucceeded(func(...args)) 
                    });
                } catch (error) {
                    context.state.history.push({
                        kind: kind,
                        hashedId: callId,
                        result: taskFailed(error)
                    });
                }
            }

            const entry = context.state.history[context.nextTask++];
    
            assert.equal(kind, entry.kind);
            assert.equal(callId, entry.hashedId);
    
            if (entry.result.success == true) {
                return entry.result.value;
            }
    
            throw new DialogFlowError(entry.result.error)
        }

        bound.project = <O>(projector: (value: Jsonify<ReturnType<T>>) => O) => {
            return (...args: Parameters<T>) : O => projector(bound(...args));
        };

        return bound;
    }

    /**
     * Starts or resumes the workflow.
     * @param dialogFlow The workflow function to run.
     * @param reason The reason for starting or resuming the workflow.
     * @param resumeResult The result of the previous suspension, if any.
     * @returns A promise that resolves to the turn result.
     */
    public async run(
        dialogFlow: (context: DialogFlowContext<O>) => Generator<DialogFlowTask, R>,
        reason: DialogReason,
        resumeResult?: any
    ): Promise<DialogTurnResult> {

        const generator = dialogFlow(this);

        // Replay the recorded histroy
        for (var it = generator.next(); it.done === false && this.nextTask < this.state.history.length; ) {

            it = this.replayNext(generator, it.value);
        }

        // Resume from the last suspension, unless the workflow is run for the first time
        if (reason !== DialogReason.beginCalled) {

            assert.ok(!it.done && it.value instanceof SuspendDialogFlowTask);
            assert.equal(it.value.kind, this.state.resumeState?.kind);
            assert.equal(this.getHashOf(it.value.id), this.state.resumeState?.hashedId);

            this.state.resumeState = undefined;

            it = this.record(
                generator, 
                it.value, 
                await it.value.onResume(this.dc.context, resumeResult));
        }

        // Execute and resume the async invocations 
        while ((it.done === false) && it.value instanceof AsyncCallTask) {

            it = this.record(
                generator, 
                it.value, 
                await it.value.invoke(this.dc.context));

        }

        assert.equal(this.nextTask, this.state.history.length);

        // If the workflow is being suspended, record the suspension point
        if (it.done === false) {

            assert.ok(it.value instanceof SuspendDialogFlowTask);

            this.state.resumeState = {
                hashedId: this.getHashOf(it.value.id),
                kind: it.value.kind
            }

            return await it.value.onSuspend(this.dc);
        }

        return await this.dc.endDialog(it.value);
    }


    /**
     * Gets the hash of a value.
     * @param value The value to hash.
     * @returns The hashed value.
     */
    private getHashOf(value: string): string {
        return createHash('sha256').update(value).digest("base64");
    }

    /**
     * Records the result of a task execution.
     * @param generator The generator to move forward.
     * @param task The task that was executed.
     * @param result The result of the task execution.
     * @returns The iterator used to continue the workflow.
     */
    private record(
        generator: Generator<DialogFlowTask, R>, 
        task: AbstractDialogFlowTask<any>,
        result: TaskResult
    ) : IteratorResult<DialogFlowTask, R> {

        assert.ok(!this.isReplaying);

        this.state.history.push({
            hashedId: this.getHashOf(task.id),
            kind: task.kind,
            result: result
        });

        this.nextTask = this.state.history.length;
        return task.replay(generator, result);
    }

    /**
     * Replays the next recorded task execution result.
     * @param generator The generator to move forward.
     * @param task The task that was executed
     * @returns The iterator used to continue the workflow.
     */
    private replayNext(
        generator: Generator<DialogFlowTask, R>, 
        task: DialogFlowTask
    ) : IteratorResult<DialogFlowTask, R> {

        assert.ok(this.nextTask < this.state.history.length);
        const entry = this.state.history[this.nextTask++];

        assert.ok(task instanceof AbstractDialogFlowTask, `Expected task to be an instance of AbstractDialogFlowTask`);
        assert.equal(task.kind, entry.kind);
        assert.equal(this.getHashOf(task.id), entry.hashedId);

        return task.replay(generator, entry.result);
    }
 
    /**
     * Calls a built-in function and records its result.
     * @param func The function to call.
     * @param kind The kind of the task.
     * @returns The result of the function call.
     */
    private callBuiltIn<T extends JsonPrimitive>(
        func: () => T, 
        kind: string
    ) : T {
        if (this.nextTask == this.state.history.length) {
            assert.ok(!this.state.resumeState);
            this.state.history.push({
                kind: kind,
                hashedId: '',
                result: {success: true, value: func()}
            });
        }

        assert.ok(this.nextTask < this.state.history.length);
        const entry = this.state.history[this.nextTask++];

        assert.ok(entry.result.success == true);
        assert.equal(kind, entry.kind);
        assert.equal('', entry.hashedId);
        return entry.result.value;
    }
}

/**
 * Represents a dialog execution flow history entry.
 */
export interface DialogFlowHistoryEntry {
    /**
     * The task's kind.
     */
    kind: string;

    /**
     * The hash of the task's persistent identifier.
     */
    hashedId: string;

    /**
     * The result of the task execution.
     */
    result: TaskResult;
}

/**
 * Represents the dialog execution flow suspension state.
 */
export interface DialogFlowResumeState {
    /**
     * The task's kind.
     */
    kind: string;

    /**
     * The hash of the task's persistent identifier.
     */
    hashedId: string;
}

/**
 * Represents the fluent dialog state.
 */
export interface FluentDialogState<O extends object> {
    /**
     * The dialog flow options.
     */
    options: O;

    /**
     * The dialog flow execution history.
     */
    history: DialogFlowHistoryEntry[];

    /**
     * The dialog flow suspension state.
     */
    resumeState?: DialogFlowResumeState;
}
