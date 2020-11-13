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
} from 'botbuilder-core';
import { Configurable, Converter, ConverterFactory, Dialog, DialogManager } from 'botbuilder-dialogs';
import {
    LanguageGeneratorExtensions,
    LanguagePolicy,
    LanguagePolicyConverter,
    ResourceExtensions,
} from 'botbuilder-dialogs-adaptive';
import { ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { TestAction } from './testAction';
import { SetTestOptionsMiddleware } from './setTestOptionsMiddleware';
import { UserTokenMock, UserTokenMocksConverter } from './userTokenMocks';

class DialogConverter implements Converter<string, Dialog> {
    public constructor(private readonly _resourceExplorer: ResourceExplorer) {}

    public convert(value: string | Dialog): Dialog {
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
    userTokenMocks?: string[] | UserTokenMock[];
    script?: TestAction[];
    enableTrace?: boolean;
    languagePolicy?: Record<string, string[]> | LanguagePolicy;
}

/**
 * A mock Test Script that can be used for unit testing bot's logic.
 */
export class TestScript extends Configurable implements TestScriptConfiguration {
    public static $kind = 'Microsoft.Test.Script';

    /**
     * A description of the test sequence.
     */
    public description: string;

    /**
     * The dialog to use for the root dialog.
     */
    public dialog: Dialog;

    /**
     * The locale (default: en-us).
     */
    public locale = 'en-us';

    /**
     * Language policy.
     */
    public languagePolicy: LanguagePolicy;

    /**
     * The mock data for Microsoft.OAuthInput.
     */
    public userTokenMocks: UserTokenMock[] = [];

    /**
     * The sequence of test actions to perform to validate the dialog behavior.
     */
    public script: TestAction[] = [];

    /**
     * If true then trace activities will be sent to the test script.
     */
    public enableTrace = false;

    public getConverter(property: keyof TestScriptConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'dialog':
                return DialogConverter;
            case 'userTokenMocks':
                return UserTokenMocksConverter;
            case 'languagePolicy':
                return new LanguagePolicyConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Build default test adapter.
     * @param testName Name of test.
     * @param middlewares Middlewares to be added to the adapter.
     * @returns Test adapter.
     */
    public defaultTestAdapter(testName?: string, ...middlewares: Middleware[]): TestAdapter {
        const storage = new MemoryStorage();
        const userState = new UserState(storage);
        const convoState = new ConversationState(storage);

        const adapter = new TestAdapter(TestAdapter.createConversation(testName));
        useBotState(adapter, userState, convoState);
        adapter.use(new SetTestOptionsMiddleware());

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
     * @param resourceExplorer The resource explorer to use.
     * @param testName Name of the test.
     * @param callback The bot logic.
     * @param adapter Optional test adapter.
     * @param middlewares Middlewares to be added to the adapter.
     */
    public async execute(
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

        this.userTokenMocks.forEach((userTokenMock) => {
            userTokenMock.setup(adapter);
        });

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
            await testAction.execute(adapter, callback);
        }
    }
}
