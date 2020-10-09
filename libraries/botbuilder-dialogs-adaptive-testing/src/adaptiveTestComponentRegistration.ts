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

type Type = {
    $kind: string;
    new (): unknown;
};

export class AdaptiveTestComponentRegistration extends ComponentRegistration implements ComponentDeclarativeTypes {
    private _declarativeTypes: DeclarativeType[] = [];

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

    private _addDeclarativeType(type: Type, loader?: CustomDeserializer<unknown, unknown>): void {
        const declarativeType: DeclarativeType = {
            kind: type.$kind,
            type,
            loader,
        };
        this._declarativeTypes.push(declarativeType);
    }
}
