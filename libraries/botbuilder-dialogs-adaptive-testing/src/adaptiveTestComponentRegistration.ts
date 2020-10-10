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
import { Properties } from 'botbuilder-dialogs';

type Type<T> = {
    $kind: string;
    new (...args: unknown[]): T;
};

type Configuration<T> = {
    [K in keyof Partial<T>]: unknown;
};

export class AdaptiveTestComponentRegistration extends ComponentRegistration implements ComponentDeclarativeTypes {
    private _declarativeTypes: DeclarativeType<unknown, unknown>[] = [];

    public constructor() {
        super();
        this._addDeclarativeType(AssertCondition);
        this._addDeclarativeType(AssertReply);
        this._addDeclarativeType(AssertReplyActivity);
        this._addDeclarativeType(AssertReplyOneOf);
        this._addDeclarativeType(UserActivity);
        this._addDeclarativeType(UserConversationUpdate);
        this._addDeclarativeType(UserDelay);
        this._addDeclarativeType(UserSays);
        this._addDeclarativeType(UserTyping);
        this._addDeclarativeType(TestScript);
        this._addDeclarativeType(UserTokenBasicMock);
    }

    public getDeclarativeTypes(_resourceExplorer: ResourceExplorer): DeclarativeType[] {
        return this._declarativeTypes;
    }

    private _addDeclarativeType<T, C = Configuration<Properties<T>>>(
        type: Type<T>,
        loader?: CustomDeserializer<T, C>
    ): void {
        const declarativeType: DeclarativeType<T, C> = {
            kind: type.$kind,
            type,
            loader,
        };
        this._declarativeTypes.push(declarativeType);
    }
}
