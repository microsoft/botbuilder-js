// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type { AuthenticationConfiguration, ICredentialProvider } from 'botframework-connector';
import type { ResourceExplorer } from 'botbuilder-dialogs-declarative';

import type {
    ActivityHandlerBase,
    BotFrameworkAdapter,
    BotTelemetryClient,
    ChannelServiceHandler,
    ComponentRegistration,
    ConversationState,
    Middleware,
    MiddlewareSet,
    SkillConversationIdFactoryBase,
    SkillHttpClient,
    Storage,
    UserState,
} from 'botbuilder';

// Services describes all the things that can be manipulated as a part of the runtime
export interface IServices {
    // Core
    bot: ActivityHandlerBase;
    resourceExplorer: ResourceExplorer;
    componentRegistration: {
        components: typeof ComponentRegistration.components;
        add: typeof ComponentRegistration.add;
    };

    // Middlewares, potentially shared across all the things
    middlewares: MiddlewareSet;

    // Skills
    authenticationConfiguration: AuthenticationConfiguration;
    channelServiceHandler: ChannelServiceHandler;
    skillClient: SkillHttpClient;
    skillConversationIdFactory: SkillConversationIdFactoryBase;

    // State and Storage
    userState: UserState;
    conversationState: ConversationState;
    storage: Storage;

    // Adapters
    credentialProvider: ICredentialProvider;
    adapter: BotFrameworkAdapter;
    customAdapters: Map<string, BotFrameworkAdapter>; // TODO(jgummersall) WeakMap for GC?

    // Telemetry
    botTelemetryClient: BotTelemetryClient;
    telemetryMiddleware: Middleware;
}
