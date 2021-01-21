/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { ActionPolicyType } from './actionPolicyTypes';
import { ActionPolicy } from './actionPolicy';
import {
    BreakLoop,
    ContinueLoop,
    GotoAction,
    CancelDialog,
    CancelAllDialogs,
    EndDialog,
    RepeatDialog,
    ThrowException,
    Ask,
    AttachmentInput,
    ChoiceInput,
    ConfirmInput,
    DateTimeInput,
    NumberInput,
    OAuthInput,
    TextInput,
    OnEndOfConversationActivity,
    AdaptiveDialog,
    OnCondition,
    ActionScope,
} from 'botbuilder-dialogs-adaptive';
import { Dialog, isDialogDependencies } from 'botbuilder-dialogs';
import { ActionPolicyException } from './ActionPolicyException';
import { Assertion, assert } from 'botbuilder-stdlib';

// Asserts that a given value is an instance of a constructor that, itself, has a static $kind property
type ConstructorKind = { constructor: { $kind: string } };
const assertConstructorKind: Assertion<ConstructorKind> = (val, path) => {
    assert.unsafe.castObjectAs<ConstructorKind>(val, path);
    assert.string(val.constructor?.$kind, path.concat('constructor', '$kind'));
};

///  <summary>
///  Validator used to verify a dialog with its triggers and actions are not violating
///  any Action Policies. ValidatePolicies will throw an <see cref="ActionPolicyException"/>
///  if any policy violations are found.
///  </summary>
export class ActionPolicyValidator {
    public validatePolicies(dialog: Dialog): void {
        if (dialog instanceof AdaptiveDialog) {
            for (const trigger of dialog.triggers) {
                this.validateCondition(trigger);
            }
        }
    }

    private validateCondition(condition: OnCondition): void {
        assertConstructorKind(condition, ['condition']);
        const triggerKind = condition.constructor.$kind;

        this.validateKind([triggerKind], triggerKind, condition.actions);
    }

    private validateKind(parentKinds: string[], kind: string, dialogs?: Dialog[]): void {
        const kindPolicy = this.actionPolicies.find((item) => item.kind === kind);
        if (kindPolicy) {
            this.validatePolicy(parentKinds, kindPolicy, dialogs);
        }

        if (dialogs?.length) {
            for (const dialog of dialogs) {
                assertConstructorKind(dialog, ['dialog']);

                const actionKind = dialog.constructor?.$kind;
                const parentKindsInner = [...parentKinds, actionKind];

                const actionPolicy = this.actionPolicies.find((item) => item.kind === actionKind);
                if (actionPolicy) {
                    this.validatePolicy(parentKindsInner, actionPolicy, dialogs, dialog);
                }

                this.validateKind(parentKindsInner, actionKind, this.getDialogs(dialog));
            }
        }
    }

    private validatePolicy(parentKinds: string[], policy: ActionPolicy, dialogs: Dialog[], dialog?: Dialog): void {
        switch (policy.actionPolicyType) {
            case ActionPolicyType.LastAction:
                //  This dialog must be the last in the list
                if (dialogs.indexOf(dialog) < dialogs.length - 1) {
                    throw new ActionPolicyException(policy, dialog);
                }

                break;

            case ActionPolicyType.Interactive: {
                //  This dialog is interactive, so cannot be under NonInteractive triggers
                for (const parentKind in parentKinds) {
                    const parentPolicy = this.actionPolicies.find((item) => item.kind === parentKind);
                    if (parentPolicy?.actionPolicyType === ActionPolicyType.TriggerNotInteractive) {
                        throw new ActionPolicyException(policy, dialog);
                    }
                }

                break;
            }

            case ActionPolicyType.AllowedTrigger:
                //  ensure somewhere up the chain the specific trigger type is found
                if (parentKinds.some((pk) => policy.actions.some((a) => pk === a))) {
                    return;
                }

                //  Trigger type not found up the chain.  This action is in the wrong trigger.
                throw new ActionPolicyException(policy, dialog);

            case ActionPolicyType.TriggerNotInteractive: {
                //  ensure no dialogs, or child dialogs, are Input dialogs
                const childDialogs = dialogs.filter((d) => d.id !== dialog?.id);

                while (childDialogs.length) {
                    const childDialog = childDialogs.shift();
                    assertConstructorKind(childDialog, ['childDialog']);

                    const childKind = childDialog.constructor.$kind;
                    const childPolicy = this.actionPolicies.find((item) => item.kind === childKind);
                    if (childPolicy?.actionPolicyType === ActionPolicyType.Interactive) {
                        //  Interactive action found below TriggerNotInteractive trigger
                        throw new ActionPolicyException(policy, dialog);
                    }

                    const innerChildDialogs = this.getDialogs(childDialog);
                    if (innerChildDialogs) {
                        childDialogs.push(...innerChildDialogs);
                    }
                }

                break;
            }
            case ActionPolicyType.TriggerRequiresAction: {
                //  ensure the required action is present in the dialogs chain
                const childActions = dialogs.filter((d) => d.id !== dialog?.id);
                while (childActions.length) {
                    const childDialog = childActions.shift();
                    assertConstructorKind(childDialog, ['childDialog']);

                    const childKind = childDialog.constructor.$kind;
                    if (policy.actions.some((pa) => pa === childKind)) {
                        //  found the action required
                        return;
                    }

                    const innerChildDialogs = this.getDialogs(childDialog);
                    if (innerChildDialogs) {
                        childActions.push(...innerChildDialogs);
                    }
                }

                //  Required action not found
                throw new ActionPolicyException(policy, dialog);
            }
            default:
                throw new Error(`Invalid ActionPolicy.ActionPolicyType: ${policy.actionPolicyType}`);
        }
    }

    private getDialogs(dialog: Dialog): Dialog[] {
        if (dialog instanceof AdaptiveDialog) {
            return dialog.dialogs.getDialogs();
        }

        if (dialog instanceof ActionScope) {
            return dialog.actions;
        }

        const dialogs: Dialog[] = [];

        if (isDialogDependencies(dialog)) {
            for (const dependency of dialog.getDependencies()) {
                if (dependency instanceof ActionScope) {
                    dialogs.push(...dependency.actions);
                }
            }
        }

        return dialogs;
    }

    get actionPolicies(): ActionPolicy[] {
        return [
            //  LastAction (dialog continues)
            new ActionPolicy(BreakLoop.$kind, ActionPolicyType.LastAction),
            new ActionPolicy(ContinueLoop.$kind, ActionPolicyType.LastAction),
            new ActionPolicy(GotoAction.$kind, ActionPolicyType.LastAction),

            //  LastAction (dialog ends)
            new ActionPolicy(CancelDialog.$kind, ActionPolicyType.LastAction),
            new ActionPolicy(CancelAllDialogs.$kind, ActionPolicyType.LastAction),
            new ActionPolicy(EndDialog.$kind, ActionPolicyType.LastAction),
            new ActionPolicy(RepeatDialog.$kind, ActionPolicyType.LastAction),
            new ActionPolicy(ThrowException.$kind, ActionPolicyType.LastAction),

            //  Interactive (Input Dialogs)
            new ActionPolicy(Ask.$kind, ActionPolicyType.Interactive),
            new ActionPolicy(AttachmentInput.$kind, ActionPolicyType.Interactive),
            new ActionPolicy(ChoiceInput.$kind, ActionPolicyType.Interactive),
            new ActionPolicy(ConfirmInput.$kind, ActionPolicyType.Interactive),
            new ActionPolicy(DateTimeInput.$kind, ActionPolicyType.Interactive),
            new ActionPolicy(NumberInput.$kind, ActionPolicyType.Interactive),
            new ActionPolicy(OAuthInput.$kind, ActionPolicyType.Interactive),
            new ActionPolicy(TextInput.$kind, ActionPolicyType.Interactive),

            new ActionPolicy(OnEndOfConversationActivity.$kind, ActionPolicyType.TriggerNotInteractive),

            // ? yield return new ActionPolicy(OnBeginDialog.Kind, ActionPolicyType.TriggerNotInteractive);
            // ? yield return new ActionPolicy(OnConversationUpdateActivity.Kind, ActionPolicyType.TriggerNotInteractive);
            // AllowedTrigger (Action only valid in n Triggers)
            // TriggerRequiresAction (Trigger requries one of n actions)
        ];
    }
}
