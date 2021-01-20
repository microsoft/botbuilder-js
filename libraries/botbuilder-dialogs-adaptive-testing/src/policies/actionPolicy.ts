/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ActionPolicyType  } from './actionPolicyTypes'

export class ActionPolicy {
    policyType: ActionPolicyType;
    actions: string[];
    kind: string;
    public constructor (kind: string, actionPolicyType: ActionPolicyType, actions: string[] = undefined) {
        this.policyType = actionPolicyType;
        this.actions = actions;
        this.kind = kind;
    }
    
    public get Kind(): string {
        return this.kind;
    }

    public set Kind(newKind: string) {
        this.kind = newKind;
    }

    public get ActionPolicyType(): ActionPolicyType {
        return this.policyType;
    }
    
    public set ActionPolicyType(newPolicyType: ActionPolicyType) {
        this.policyType = newPolicyType;
    }
    
    public get Actions(): string[] {
        return this.actions;
    }

    public set Actions(newActions: string[]) {
        this.actions = newActions;
    }
}