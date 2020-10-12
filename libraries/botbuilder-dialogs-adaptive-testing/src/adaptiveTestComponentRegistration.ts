/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ComponentRegistration } from 'botbuilder-core';
import {
    ComponentDeclarativeTypes,
    CustomDeserializer,
    DeclarativeType,
    ResourceExplorer,
} from 'botbuilder-dialogs-declarative';
import {
    AssertReply,
    AssertReplyActivity,
    AssertReplyOneOf,
    UserActivity,
    UserConversationUpdate,
    UserDelay,
    UserSays,
    UserTyping,
} from './testActions';
import { AssertCondition } from './actions';
import { TestScript } from './testScript';
import { UserTokenBasicMock } from './userTokenMocks';
import { NonFunctionKeys } from 'utility-types';

type Type<T> = {
    $kind: string;
    new (...args: unknown[]): T;
};

export class AdaptiveTestComponentRegistration extends ComponentRegistration implements ComponentDeclarativeTypes {
    private _declarativeTypes: DeclarativeType<unknown, unknown>[] = [];

    public constructor() {
        super();
        this._addDeclarativeType<AssertCondition, NonFunctionKeys<AssertCondition>>(AssertCondition);
        this._addDeclarativeType<AssertReply, NonFunctionKeys<AssertReply>>(AssertReply);
        this._addDeclarativeType<AssertReplyActivity, NonFunctionKeys<AssertReplyActivity>>(AssertReplyActivity);
        this._addDeclarativeType<AssertReplyOneOf, NonFunctionKeys<AssertReplyOneOf>>(AssertReplyOneOf);
        this._addDeclarativeType<UserActivity, NonFunctionKeys<UserActivity>>(UserActivity);
        this._addDeclarativeType<UserConversationUpdate, NonFunctionKeys<UserConversationUpdate>>(
            UserConversationUpdate
        );
        this._addDeclarativeType<UserDelay, NonFunctionKeys<UserDelay>>(UserDelay);
        this._addDeclarativeType<UserSays, NonFunctionKeys<UserDelay>>(UserSays);
        this._addDeclarativeType<UserTyping, NonFunctionKeys<UserTyping>>(UserTyping);
        this._addDeclarativeType<TestScript, NonFunctionKeys<TestScript>>(TestScript);
        this._addDeclarativeType<UserTokenBasicMock, NonFunctionKeys<UserTokenBasicMock>>(UserTokenBasicMock);
    }

    public getDeclarativeTypes(_resourceExplorer: ResourceExplorer): DeclarativeType[] {
        return this._declarativeTypes;
    }

    private _addDeclarativeType<T, C>(type: Type<T>, loader?: CustomDeserializer<T, C>): void {
        const declarativeType: DeclarativeType<T, C> = {
            kind: type.$kind,
            type,
            loader,
        };
        this._declarativeTypes.push(declarativeType);
    }
}
