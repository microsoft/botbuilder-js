// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotComponent } from 'botbuilder-core';
import { ComponentDeclarativeTypes } from 'botbuilder-dialogs-declarative';
import { ServiceCollection, Configuration } from 'botbuilder-dialogs-adaptive-runtime-core';

import { AssertCondition } from './actions';

import {
    AssertNoActivity,
    AssertReply,
    AssertReplyActivity,
    AssertReplyOneOf,
    CustomEvent,
    MemoryAssertions,
    SetProperties,
    UserActivity,
    UserConversationUpdate,
    UserDelay,
    UserSays,
    UserTyping,
} from './testActions';

import { HttpRequestSequenceMock } from './httpRequestMocks/httpRequestSequenceMock';
import { SettingStringMock } from './settingMocks/settingStringMock';
import { TestScript } from './testScript';
import { UserTokenBasicMock } from './userTokenMocks';

export class AdaptiveTestBotComponent extends BotComponent {
    configureServices(services: ServiceCollection, _configuration: Configuration): void {
        services.composeFactory<ComponentDeclarativeTypes[]>('declarativeTypes', (declarativeTypes) =>
            declarativeTypes.concat({
                getDeclarativeTypes() {
                    return [
                        { kind: AssertCondition.$kind, type: AssertCondition },
                        { kind: AssertNoActivity.$kind, type: AssertNoActivity },
                        { kind: AssertReply.$kind, type: AssertReply },
                        { kind: AssertReplyActivity.$kind, type: AssertReplyActivity },
                        { kind: AssertReplyOneOf.$kind, type: AssertReplyOneOf },
                        { kind: CustomEvent.$kind, type: CustomEvent },
                        { kind: MemoryAssertions.$kind, type: MemoryAssertions },
                        { kind: HttpRequestSequenceMock.$kind, type: HttpRequestSequenceMock },
                        { kind: SetProperties.$kind, type: SetProperties },
                        { kind: SettingStringMock.$kind, type: SettingStringMock },
                        { kind: UserActivity.$kind, type: UserActivity },
                        { kind: UserConversationUpdate.$kind, type: UserConversationUpdate },
                        { kind: UserDelay.$kind, type: UserDelay },
                        { kind: UserSays.$kind, type: UserSays },
                        { kind: UserTyping.$kind, type: UserTyping },
                        { kind: TestScript.$kind, type: TestScript },
                        { kind: UserTokenBasicMock.$kind, type: UserTokenBasicMock },
                    ];
                },
            })
        );
    }
}
