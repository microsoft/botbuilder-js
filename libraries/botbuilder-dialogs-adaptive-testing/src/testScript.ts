/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    ConversationState,
    MemoryStorage,
    UserState,
    useBotState,
    TestAdapter,
    Middleware,
    TurnContext,
    ActivityTypes,
    RegisterClassMiddleware,
    TelemetryLoggerMiddleware,
} from 'botbuilder-core';
import {
    Configurable,
    Converter,
    ConverterFactory,
    Dialog,
    DialogManager,
    DialogTurnStateConstants,
} from 'botbuilder-dialogs';
import {
    LanguageGeneratorExtensions,
    LanguagePolicy,
    LanguagePolicyConverter,
    ResourceExtensions,
} from 'botbuilder-dialogs-adaptive';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { Inspector, TestAction } from './testAction';
import { SetTestOptionsMiddleware } from './setTestOptionsMiddleware';
import { UserTokenMock, UserTokenMocksConverter } from './userTokenMocks';
import { DialogContextInspector, DialogInspector } from './dialogInspector';
import { HttpRequestMock, HttpRequestMocksConverter } from './httpRequestMocks/httpRequestMock';
import { MockHttpRequestMiddleware } from './mocks/mockHttpRequestMiddleware';
import { MockSettingsMiddleware } from './mocks/mockSettingsMiddleware';
import { SettingMock, SettingMocksConverter } from './settingMocks/settingMock';
import { TestTelemetryClient } from './testTelemetryClient';

class DialogConverter implements Converter<string, Dialog> {
    constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    convert(value: string | Dialog): Dialog {
        if (value instanceof Dialog) {
            return value;
        }

        let resource = this._resourceExplorer.getResource(value);
        if (!resource) {
            resource = this._resourceExplorer.getResource(`${value}.dialog`);
        }

        if (resource) {
            return this._resourceExplorer.loadType<Dialog>(resource);
        }

        return undefined;
    }
}

export interface TestScriptConfiguration {
    description?: string;
    dialog?: string | Dialog;
    locale?: string;
    languagePolicy?: Record<string, string[]> | LanguagePolicy;
    httpRequestMocks?: string[] | HttpRequestMock[];
    userTokenMocks?: string[] | UserTokenMock[];
    settingMocks?: string[] | SettingMock[];
    script?: TestAction[];
    enableTrace?: boolean;
}

/**
 * A mock Test Script that can be used for unit testing bot's logic.
 */
export class TestScript extends Configurable implements TestScriptConfiguration {
    static $kind = 'Microsoft.Test.Script';

    /**
     * Configuration to use for the test.
     */
    configuration: Record<string, string>;

    /**
     * A description of the test sequence.
     */
    description: string;

    /**
     * The dialog to use for the root dialog.
     */
    dialog: Dialog;

    /**
     * The locale (default: en-us).
     */
    locale = 'en-us';

    /**
     * Language policy.
     */
    languagePolicy: LanguagePolicy;

    /**
     * Gets the mock data for Microsoft.HttpRequest.
     */
    httpRequestMocks: HttpRequestMock[] = [];

    /**
     * The mock data for Microsoft.OAuthInput.
     */
    userTokenMocks: UserTokenMock[] = [];

    /**
     * The mock data for settings.
     */
    settingMocks: SettingMock[] = [];

    /**
     * The sequence of test actions to perform to validate the dialog behavior.
     */
    script: TestAction[] = [];

    /**
     * If true then trace activities will be sent to the test script.
     */
    enableTrace = false;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof TestScriptConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'dialog':
                return DialogConverter;
            case 'languagePolicy':
                return new LanguagePolicyConverter();
            case 'httpRequestMocks':
                return HttpRequestMocksConverter;
            case 'userTokenMocks':
                return UserTokenMocksConverter;
            case 'settingMocks':
                return SettingMocksConverter;
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Build default test adapter.
     *
     * @param testName Name of test.
     * @param middlewares Middlewares to be added to the adapter.
     * @returns Test adapter.
     */
    defaultTestAdapter(testName?: string, ...middlewares: Middleware[]): TestAdapter {
        const storage = new MemoryStorage();
        const userState = new UserState(storage);
        const convoState = new ConversationState(storage);

        const adapter = new TestAdapter(TestAdapter.createConversation(testName));
        useBotState(adapter, userState, convoState);
        adapter
            .use(new RegisterClassMiddleware(this.configuration, DialogTurnStateConstants.configuration))
            .use(new SetTestOptionsMiddleware());

        middlewares.forEach((middleware) => {
            adapter.use(middleware);
        });

        adapter.onTurnError = async (context, err) => {
            await context.sendActivity(err.message);
        };

        return adapter;
    }

    /**
     * Starts the execution of the test sequence.
     *
     * @param resourceExplorer The resource explorer to use.
     * @param testName Name of the test.
     * @param callback The bot logic.
     * @param adapter Optional test adapter.
     * @param middlewares Middlewares to be added to the adapter.
     */
    async execute(
        resourceExplorer: ResourceExplorer,
        testName?: string,
        callback?: (context: TurnContext) => Promise<void>,
        adapter?: TestAdapter,
        ...middlewares: Middleware[]
    ): Promise<void> {
        if (!adapter) {
            adapter = this.defaultTestAdapter(testName, ...middlewares);
        }

        adapter.enableTrace = this.enableTrace;
        adapter.locale = this.locale;
        adapter.use(new MockHttpRequestMiddleware(this.httpRequestMocks));
        adapter.use(new MockSettingsMiddleware(this.settingMocks));
        const client = new TestTelemetryClient();
        adapter.use(new TelemetryLoggerMiddleware(client, true));

        this.userTokenMocks.forEach((userTokenMock) => {
            userTokenMock.setup(adapter);
        });

        const inspect: Inspector = async (inspector: DialogContextInspector): Promise<void> => {
            const di = new DialogInspector(this.dialog, resourceExplorer);
            const activity = TurnContext.applyConversationReference(
                { name: 'inspector', type: ActivityTypes.Event },
                adapter.conversation,
                true
            );
            await adapter.processActivity(activity, async (turnContext) => await di.inspect(turnContext, inspector));
        };

        if (!callback) {
            const dm = new DialogManager(this.dialog);
            ResourceExtensions.useResourceExplorer(dm, resourceExplorer);
            LanguageGeneratorExtensions.useLanguageGeneration(dm);

            if (this.languagePolicy) {
                LanguageGeneratorExtensions.useLanguagePolicy(dm, this.languagePolicy);
            }

            callback = dm.onTurn.bind(dm);
        }

        for (let i = 0; i < this.script.length; i++) {
            const testAction = this.script[i];
            await testAction.execute(adapter, callback, inspect);
        }
    }
}
