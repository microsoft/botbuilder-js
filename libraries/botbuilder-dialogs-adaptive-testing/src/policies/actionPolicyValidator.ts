/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ResourceExplorer } from 'botbuilder-dialogs-declarative'
import { ActionPolicyType  } from './actionPolicyTypes'
import { ActionPolicy } from './actionPolicy'
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
    ActionScope
} from '../../../botbuilder-dialogs-adaptive'
import { Dialog, DialogDependencies } from 'botbuilder-dialogs';
import { ActionPolicyException } from './ActionPolicyException';

///  <summary>
///  Validator used to verify a dialog with its triggers and actions are not violating
///  any Action Policies. ValidatePolicies will throw an <see cref="ActionPolicyException"/>
///  if any policy violations are found.
///  </summary>
export class ActionPolicyValidator {
    
    private _resources: ResourceExplorer;
    
    public constructor (resources: ResourceExplorer) {
        this._resources = resources;
    }
    
    public validatePolicies(dialog: Dialog) {
        const asAdaptive = dialog as AdaptiveDialog;
        //  validate policies for all triggers and their child actions
        for (const trigger of asAdaptive.triggers) {
            this.ValidateCondition(trigger);
        }
    }
    
    private ValidateCondition(condition: OnCondition) {
        let triggerKind = this._resources.getKindForType(condition);
        let parentKinds: string[];
        parentKinds.push(triggerKind);
        //  Validate the actions of the trigger
        this.ValidateKind(parentKinds, triggerKind, condition.actions);
    }
    
    private ValidateKind(parentKinds: string[], kind: string, dialogs: Dialog[]) {
        const  kindPolicy = this.actionPolicies.find((item) => item.Kind === kind);

        if ((kindPolicy != null)) {
            this.ValidatePolicy(parentKinds, kindPolicy, dialogs);
        }
        
        if ((dialogs != null)) {
            for (const dialog of dialogs) {
                let actionKind = this._resources.getKindForType(dialog);
                let parentKindsInner: string[];
                parentKindsInner.concat(parentKinds);
                parentKindsInner.push(actionKind);

                let actionPolicy = this.actionPolicies.find((item) => item.Kind === actionKind);
                if ((actionPolicy != null)) {
                    this.ValidatePolicy(parentKindsInner, actionPolicy, dialogs, dialog);
                }
                
                this.ValidateKind(parentKindsInner, actionKind, this.getDialogs(dialog));
            }
        }
    }
    
    private ValidatePolicy(parentKinds: string[], policy: ActionPolicy, dialogs: Dialog[], dialog: Dialog = undefined) {
        switch (policy.ActionPolicyType) {
            case ActionPolicyType.LastAction:
                //  This dialog must be the last in the list
                if ((dialogs.indexOf(dialog) < (dialogs.length - 1))) {
                    throw new ActionPolicyException(policy, dialog);
                }
                
                break;
            case ActionPolicyType.Interactive:
                //  This dialog is interactive, so cannot be under NonInteractive triggers
                for (let parentKind in parentKinds) {
                    let parentPolicy = this.actionPolicies.find((item) => item.Kind === parentKind);
                    if (((parentPolicy != null) 
                                && (parentPolicy.ActionPolicyType == ActionPolicyType.TriggerNotInteractive))) {
                        throw new ActionPolicyException(policy, dialog);
                    }
                    
                }
                
                break;
            case ActionPolicyType.AllowedTrigger:
                //  ensure somewhere up the chain the specific trigger type is found
                if (parentKinds.some( (pk) => policy.Actions.some((a) => pk == a))) {
                    return;
                }

                //  Trigger type not found up the chain.  This action is in the wrong trigger.
                throw new ActionPolicyException(policy, dialog);
                break;
            case ActionPolicyType.TriggerNotInteractive:
                //  ensure no dialogs, or child dialogs, are Input dialogs
                let childDialogs = dialogs.filter(d => d.id != dialog.id);

                while (childDialogs.length > 0) {
                    let childDialog = childDialogs[0];
                    let childKind = this._resources.getKindForType(childDialog);
                    let childPolicy = this.actionPolicies.find((item) => item.kind === childKind);
                    if (childPolicy && (childPolicy.ActionPolicyType == ActionPolicyType.Interactive)) {
                        //  Interactive action found below TriggerNotInteractive trigger
                        throw new ActionPolicyException(policy, dialog);
                    }
                    
                
                    childDialogs.shift();
                    let innerChildDialogs = this.getDialogs(childDialog);
                    if ((innerChildDialogs != null)) {
                        childDialogs.concat(innerChildDialogs);
                    }
                }
                
                break;
            case ActionPolicyType.TriggerRequiresAction:
                //  ensure the required action is present in the dialogs chain
                let childActions = dialogs.filter(d => d.id != dialog.id);
                while (childActions.length > 0) {
                    let childDialog = childActions[0];
                    let childKind = this._resources.getKindForType(childDialog);
                    
                    if (policy.Actions.some((pa) => pa == childKind )) {
                        //  found the action required
                        return;
                    }
                    
                    childActions.shift();
                    let innerChildDialogs = this.getDialogs(childDialog);
                    if ((innerChildDialogs != null)) {
                        childActions.concat(innerChildDialogs);
                    }
                    
                }
                
                //  Required action not found
                throw new ActionPolicyException(policy, dialog);
            default:
                throw new Error(`Invalid ActionPolicy.ActionPolicyType: ${policy.ActionPolicyType}`);
        }
        
    }
    
    private getDialogs(dialog: Dialog): Dialog[] {
        if ((dialog instanceof AdaptiveDialog)) {
            return dialog.dialogs.getDialogs();
        }
        
        if ((dialog instanceof  ActionScope)) {
            return dialog.actions;
        }
        
        let dialogs: Dialog[];
        if (typeof ((dialog as any) as DialogDependencies).getDependencies == 'function') {
            for(const dependency of ((dialog as any) as DialogDependencies).getDependencies()) {

                if ((dependency instanceof  ActionScope)) {
                    dialogs.concat(dependency.actions);
                }

                dialogs.push(dependency);
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
        ]
    }
}