/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionConverter, StringExpressionConverter } from 'adaptive-expressions';
import { ComponentRegistration, ResourceExplorer, DeclarativeType } from 'botbuilder-dialogs-declarative';
import { DialogExpressionConverter } from 'botbuilder-dialogs-adaptive';
import { AssertReply, AssertReplyActivity, AssertReplyOneOf, UserActivity, UserConversationUpdate, UserDelay, UserSays, UserTyping } from './testActions';
import { AssertCondition } from './actions';
import { TestScript } from './testScript';

/**
 * Declarative components in adaptive testing.
 */
export class AdaptiveDialogTestComponentRegistration implements ComponentRegistration {
    public getDeclarativeTypes(resourceExplorer: ResourceExplorer): DeclarativeType[] {
        return [{
            kind: 'Microsoft.Test.AssertCondition',
            factory: AssertCondition,
            converters: {
                'condition': new ExpressionConverter(),
                'description': new StringExpressionConverter()
            }
        }, {
            kind: 'Microsoft.Test.AssertReply',
            factory: AssertReply
        }, {
            kind: 'Microsoft.Test.AssertReplyActivity',
            factory: AssertReplyActivity
        }, {
            kind: 'Microsoft.Test.AssertReplyOneOf',
            factory: AssertReplyOneOf
        }, {
            kind: 'Microsoft.Test.UserActivity',
            factory: UserActivity
        }, {
            kind: 'Microsoft.Test.UserConversationUpdate',
            factory: UserConversationUpdate
        }, {
            kind: 'Microsoft.Test.UserDelay',
            factory: UserDelay
        }, {
            kind: 'Microsoft.Test.UserSays',
            factory: UserSays
        }, {
            kind: 'Microsoft.Test.UserTyping',
            factory: UserTyping
        }, {
            kind: 'Microsoft.Test.Script',
            factory: TestScript,
            converters: {
                'dialog': new DialogExpressionConverter(resourceExplorer)
            }
        }];
    }
}