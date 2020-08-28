/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionConverter, StringExpressionConverter } from 'adaptive-expressions';
import { BuilderRegistration, ComponentRegistration, DefaultTypeBuilder, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { DialogExpressionConverter } from 'botbuilder-dialogs-adaptive';
import { AssertReply, AssertReplyActivity, AssertReplyOneOf, UserActivity, UserConversationUpdate, UserDelay, UserSays, UserTyping } from './testActions';
import { AssertCondition } from './actions';
import { TestScript } from './testScript';

export class AdaptiveDialogTestComponentRegistration implements ComponentRegistration {
    public getBuilderRegistrations(resourceExplorer: ResourceExplorer): BuilderRegistration[] {
        return [{
            kind: 'Microsoft.Test.AssertCondition',
            builder: new DefaultTypeBuilder(AssertCondition, resourceExplorer, {
                'condition': new ExpressionConverter(),
                'description': new StringExpressionConverter()
            })
        }, {
            kind: 'Microsoft.Test.AssertReply',
            builder: new DefaultTypeBuilder(AssertReply, resourceExplorer, {})
        }, {
            kind: 'Microsoft.Test.AssertReplyActivity',
            builder: new DefaultTypeBuilder(AssertReplyActivity, resourceExplorer, {})
        }, {
            kind: 'Microsoft.Test.AssertReplyOneOf',
            builder: new DefaultTypeBuilder(AssertReplyOneOf, resourceExplorer, {})
        }, {
            kind: 'Microsoft.Test.UserActivity',
            builder: new DefaultTypeBuilder(UserActivity, resourceExplorer, {})
        }, {
            kind: 'Microsoft.Test.UserConversationUpdate',
            builder: new DefaultTypeBuilder(UserConversationUpdate, resourceExplorer, {})
        }, {
            kind: 'Microsoft.Test.UserDelay',
            builder: new DefaultTypeBuilder(UserDelay, resourceExplorer, {})
        }, {
            kind: 'Microsoft.Test.UserSays',
            builder: new DefaultTypeBuilder(UserSays, resourceExplorer, {})
        }, {
            kind: 'Microsoft.Test.UserTyping',
            builder: new DefaultTypeBuilder(UserTyping, resourceExplorer, {})
        }, {
            kind: 'Microsoft.Test.Script',
            builder: new DefaultTypeBuilder(TestScript, resourceExplorer, {
                'dialog': new DialogExpressionConverter(resourceExplorer)
            })
        }];
    }
}