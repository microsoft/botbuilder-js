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
    AssertReplyActivityConfiguration,
    AssertReplyConfiguration,
    AssertReplyOneOf,
    AssertReplyOneOfConfiguration,
    CustomEvent,
    CustomEventConfiguration,
    UserActivity,
    UserActivityConfiguration,
    UserConversationUpdate,
    UserConversationUpdateConfiguration,
    UserDelay,
    UserDelayConfiguration,
    UserSays,
    UserSaysConfiguration,
    UserTyping,
    UserTypingConfiguration,
} from './testActions';
import { AssertCondition, AssertConditionConfiguration } from './actions';
import { TestScript, TestScriptConfiguration } from './testScript';
import { UserTokenBasicMock, UserTokenBasicMockConfiguration } from './userTokenMocks';

type Type<T> = {
    $kind: string;
    new (...args: unknown[]): T;
};

/**
 * `ComponentRegistration` implementation for adaptive testing resources.
 */
export class AdaptiveTestComponentRegistration extends ComponentRegistration implements ComponentDeclarativeTypes {
    private _declarativeTypes: DeclarativeType<unknown, unknown>[] = [];

    /**
     * Initializes a new instance of `AdaptiveTestComponentRegistration`.
     */
    public constructor() {
        super();
        this._addDeclarativeType<AssertCondition, AssertConditionConfiguration>(AssertCondition);
        this._addDeclarativeType<AssertReply, AssertReplyConfiguration>(AssertReply);
        this._addDeclarativeType<AssertReplyActivity, AssertReplyActivityConfiguration>(AssertReplyActivity);
        this._addDeclarativeType<AssertReplyOneOf, AssertReplyOneOfConfiguration>(AssertReplyOneOf);
        this._addDeclarativeType<UserActivity, UserActivityConfiguration>(UserActivity);
        this._addDeclarativeType<CustomEvent, CustomEventConfiguration>(CustomEvent);
        this._addDeclarativeType<UserConversationUpdate, UserConversationUpdateConfiguration>(UserConversationUpdate);
        this._addDeclarativeType<UserDelay, UserDelayConfiguration>(UserDelay);
        this._addDeclarativeType<UserSays, UserSaysConfiguration>(UserSays);
        this._addDeclarativeType<UserTyping, UserTypingConfiguration>(UserTyping);
        this._addDeclarativeType<TestScript, TestScriptConfiguration>(TestScript);
        this._addDeclarativeType<UserTokenBasicMock, UserTokenBasicMockConfiguration>(UserTokenBasicMock);
    }

    /**
     * Gets adaptive testing `DeclarativeType` resources.
     * @param resourceExplorer `ResourceExplorer` with expected path to get all resources.
     * @returns Adaptive testing `DeclarativeType` resources.
     */
    public getDeclarativeTypes(_resourceExplorer: ResourceExplorer): DeclarativeType[] {
        return this._declarativeTypes;
    }

    /**
     * @private
     */
    private _addDeclarativeType<T, C>(type: Type<T>, loader?: CustomDeserializer<T, C>): void {
        const declarativeType: DeclarativeType<T, C> = {
            kind: type.$kind,
            type,
            loader,
        };
        this._declarativeTypes.push(declarativeType);
    }
}
