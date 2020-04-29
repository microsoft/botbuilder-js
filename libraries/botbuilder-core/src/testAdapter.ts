/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line:no-require-imports
import assert from 'assert';
import { Activity, ActivityTypes, ConversationReference, ResourceResponse, TokenResponse, TokenExchangeRequest, SignInUrlResponse } from 'botframework-schema';
import { BotAdapter } from './botAdapter';
import {ExtendedUserTokenProvider} from './extendedUserTokenProvider';
import { TurnContext } from './turnContext';

/**
 * Signature for a function that can be used to inspect individual activities returned by a bot
 * that's being tested using the `TestAdapter`.
 *
 * ```TypeScript
 * type TestActivityInspector = (activity: Partial<Activity>, description: string) => void;
 * ```
 * @param TestActivityInspector.activity The activity being inspected.
 * @param TestActivityInspector.description Text to log in the event of an error.
 */
export type TestActivityInspector = (activity: Partial<Activity>, description: string) => void;

/**
 * Test adapter used for unit tests. This adapter can be used to simulate sending messages from the
 * user to the bot.
 *
 * @remarks
 * The following example sets up the test adapter and then executes a simple test:
 *
 * ```JavaScript
 * const { TestAdapter } = require('botbuilder');
 *
 * const adapter = new TestAdapter(async (context) => {
 *      await context.sendActivity(`Hello World`);
 * });
 *
 * adapter.test(`hi`, `Hello World`)
 *        .then(() => done());
 * ```
 */
export class TestAdapter extends BotAdapter implements ExtendedUserTokenProvider {
    /**
     * @private
     * INTERNAL: used to drive the promise chain forward when running tests.
     */
    public readonly activityBuffer: Partial<Activity>[] = [];

    /**
     * `Activity` template that will be merged with all activities sent to the logic under test.
     */
    public readonly template: Partial<Activity>;

    /**
     * List of updated activities passed to the adapter which can be inspected after the current
     * turn completes.
     *
     * @remarks
     * This example shows how to test that expected updates have been preformed:
     *
     * ```JavaScript
     * adapter.test('update', '1 updated').then(() => {
     *    assert(adapter.updatedActivities.length === 1);
     *    assert(adapter.updatedActivities[0].id === '12345');
     *    done();
     * });
     * ```
     */
    public readonly updatedActivities: Partial<Activity>[] = [];

    /**
     * List of deleted activities passed to the adapter which can be inspected after the current
     * turn completes.
     *
     * @remarks
     * This example shows how to test that expected deletes have been preformed:
     *
     * ```JavaScript
     * adapter.test('delete', '1 deleted').then(() => {
     *    assert(adapter.deletedActivities.length === 1);
     *    assert(adapter.deletedActivities[0].activityId === '12345');
     *    done();
     * });
     * ```
     */
    public readonly deletedActivities: Partial<ConversationReference>[] = [];

    private sendTraceActivities: boolean = false;
    private nextId: number = 0;

    private readonly ExceptionExpected: string = 'ExceptionExpected';

    /**
     * Creates a new TestAdapter instance.
     * @param logic The bots logic that's under test.
     * @param template (Optional) activity containing default values to assign to all test messages received.
     */
    constructor(private logic: (context: TurnContext) => Promise<void>, template?: Partial<Activity>, sendTraceActivities?: boolean) {
        super();
        this.sendTraceActivities = sendTraceActivities || false;
        this.template = {
            channelId: 'test',
            serviceUrl: 'https://test.com',
            from: { id: 'user', name: 'User1' },
            recipient: { id: 'bot', name: 'Bot' },
            conversation: { id: 'Convo1' },
            ...template
        } as Partial<Activity>;
    }

    /**
     * @private
     * INTERNAL: called by the logic under test to send a set of activities. These will be buffered
     * to the current `TestFlow` instance for comparison against the expected results.
     * @param context Context object for the current turn of conversation with the user.
     * @param activities Set of activities sent by logic under test.
     */
    public sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const responses: ResourceResponse[] = activities
            .filter((a: Partial<Activity>) => this.sendTraceActivities || a.type !== 'trace')
            .map((activity: Partial<Activity>) => {
                this.activityBuffer.push(activity);

                return { id: (this.nextId++).toString() };
            });

        return Promise.resolve(responses);
    }

    /**
     * @private
     * INTERNAL: called by the logic under test to replace an existing activity. These are simply
     * pushed onto an [updatedActivities](#updatedactivities) array for inspection after the turn
     * completes.
     * @param context Context object for the current turn of conversation with the user.
     * @param activity Activity being updated.
     */
    public updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        this.updatedActivities.push(activity);

        return Promise.resolve();
    }

    /**
     * @private
     * INTERNAL: called by the logic under test to delete an existing activity. These are simply
     * pushed onto a [deletedActivities](#deletedactivities) array for inspection after the turn
     * completes.
     * @param context Context object for the current turn of conversation with the user.
     * @param reference `ConversationReference` for activity being deleted.
     */
    public deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        this.deletedActivities.push(reference);

        return Promise.resolve();
    }

    /**
     * The `TestAdapter` doesn't implement `continueConversation()` and will return an error if it's
     * called.
     */
    public continueConversation(
        reference: Partial<ConversationReference>,
        logic: (revocableContext: TurnContext) => Promise<void>
    ): Promise<void> {
        return Promise.reject(new Error(`not implemented`));
    }

    /**
     * @private
     * INTERNAL: called by a `TestFlow` instance to simulate a user sending a message to the bot.
     * This will cause the adapters middleware pipe to be run and it's logic to be called.
     * @param activity Text or activity from user. The current conversation reference [template](#template) will be merged the passed in activity to properly address the activity. Fields specified in the activity override fields in the template.
     */
    public receiveActivity(activity: string | Partial<Activity>): Promise<void> {
        // Initialize request
        // tslint:disable-next-line:prefer-object-spread
        const request: any = Object.assign(
            {},
            this.template,
            typeof activity === 'string' ? { type: ActivityTypes.Message, text: activity } : activity
        );
        if (!request.type) { request.type = ActivityTypes.Message; }
        if (!request.id) { request.id = (this.nextId++).toString(); }

        // Create context object and run middleware
        const context: TurnContext = this.createContext(request);

        return this.runMiddleware(context, this.logic);
    }

     /**
     * Creates a turn context.
     *
     * @param request An incoming request body.
     *
     * @remarks
     * Override this in a derived class to modify how the adapter creates a turn context.
     */
    protected createContext(request: Partial<Activity>): TurnContext {
        return new TurnContext(this, request);
    }
    /**
     * Sends something to the bot. This returns a new `TestFlow` instance which can be used to add
     * additional steps for inspecting the bots reply and then sending additional activities.
     *
     * @remarks
     * This example shows how to send a message and then verify that the response was as expected:
     *
     * ```JavaScript
     * adapter.send('hi')
     *        .assertReply('Hello World')
     *        .then(() => done());
     * ```
     * @param userSays Text or activity simulating user input.
     */
    public send(userSays: string | Partial<Activity>): TestFlow {
        return new TestFlow(this.receiveActivity(userSays), this);
    }

    /**
     * Send something to the bot and expects the bot to return with a given reply.
     *
     * @remarks
     * This is simply a wrapper around calls to `send()` and `assertReply()`. This is such a
     * common pattern that a helper is provided.
     *
     * ```JavaScript
     * adapter.test('hi', 'Hello World')
     *        .then(() => done());
     * ```
     * @param userSays Text or activity simulating user input.
     * @param expected Expected text or activity of the reply sent by the bot.
     * @param description (Optional) Description of the test case. If not provided one will be generated.
     * @param timeout (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`.
     */
    public test(
        userSays: string | Partial<Activity>,
        expected: string | Partial<Activity> | ((activity: Partial<Activity>, description?: string) => void),
        description?: string,
        timeout?: number
    ): TestFlow {
        return this.send(userSays)
            .assertReply(expected, description);
    }

    /**
     * Test a list of activities.
     *
     * @remarks
     * Each activity with the "bot" role will be processed with assertReply() and every other
     * activity will be processed as a user message with send().
     * @param activities Array of activities.
     * @param description (Optional) Description of the test case. If not provided one will be generated.
     * @param timeout (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`.
     */
    public testActivities(activities: Partial<Activity>[], description?: string, timeout?: number): TestFlow {
        if (!activities) {
            throw new Error('Missing array of activities');
        }

        const activityInspector: any = (expected: Partial<Activity>): TestActivityInspector =>
            (actual: Partial<Activity>, description2: string): any =>
                validateTranscriptActivity(actual, expected, description2);

        // Chain all activities in a TestFlow, check if its a user message (send) or a bot reply (assert)
        return activities.reduce(
            (flow: TestFlow, activity: Partial<Activity>) => {
                // tslint:disable-next-line:prefer-template
                const assertDescription: string = `reply ${ (description ? ' from ' + description : '') }`;

                return this.isReply(activity)
                    ? flow.assertReply(activityInspector(activity, description), assertDescription, timeout)
                    : flow.send(activity);
            },
            new TestFlow(Promise.resolve(), this));
    }

    private _userTokens: UserToken[] = [];
    private _magicCodes: TokenMagicCode[] = [];

    /**
     * Adds a fake user token so it can later be retrieved.
     * @param connectionName The connection name.
     * @param channelId The channel id.
     * @param userId The user id.
     * @param token The token to store.
     * @param magicCode (Optional) The optional magic code to associate with this token.
     */
    public addUserToken(connectionName: string, channelId: string, userId: string, token: string, magicCode: string = undefined) {
        const key: UserToken = new UserToken();
        key.ChannelId = channelId;
        key.ConnectionName = connectionName;
        key.UserId = userId;
        key.Token = token;

        if (!magicCode)
        {
            this._userTokens.push(key);
        }
        else
        {
            const mc = new TokenMagicCode();
            mc.Key = key;
            mc.MagicCode = magicCode;
            this._magicCodes.push(mc);
        }
    }

    /**
     * Retrieves the OAuth token for a user that is in a sign-in flow.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param magicCode (Optional) Optional user entered code to validate.
     */
    public async getUserToken(context: TurnContext, connectionName: string, magicCode?: string): Promise<TokenResponse> {
        const key: UserToken = new UserToken();
        key.ChannelId = context.activity.channelId;
        key.ConnectionName = connectionName;
        key.UserId = context.activity.from.id;

        if (magicCode) {
            var magicCodeRecord = this._magicCodes.filter(x => key.EqualsKey(x.Key));
            if (magicCodeRecord && magicCodeRecord.length > 0 && magicCodeRecord[0].MagicCode === magicCode) {
                // move the token to long term dictionary
                this.addUserToken(connectionName, key.ChannelId, key.UserId, magicCodeRecord[0].Key.Token);

                // remove from the magic code list
                const idx = this._magicCodes.indexOf(magicCodeRecord[0]);
                this._magicCodes = this._magicCodes.splice(idx, 1);
            }
        }

        var match = this._userTokens.filter(x => key.EqualsKey(x));

        if (match && match.length > 0)
        {
            return {
                connectionName: match[0].ConnectionName,
                token: match[0].Token,
                expiration: undefined
            };
        }
        else
        {
            // not found
            return undefined;
        }
    }

    /**
     * Signs the user out with the token server.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     */
    public async signOutUser(context: TurnContext, connectionName: string): Promise<void> {
        var channelId = context.activity.channelId;
        var userId = context.activity.from.id;
        
        var newRecords: UserToken[] = [];
        for (var i = 0; i < this._userTokens.length; i++) {
            var t = this._userTokens[i];
            if (t.ChannelId !== channelId ||
                t.UserId !== userId || 
                (connectionName && connectionName !== t.ConnectionName))
            {
                newRecords.push(t);
            }
        }
        this._userTokens = newRecords;
    }

    /**
     * Gets a signin link from the token server that can be sent as part of a SigninCard.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     */
    public async getSignInLink(context: TurnContext, connectionName: string): Promise<string> {
        return `https://fake.com/oauthsignin/${ connectionName }/${ context.activity.channelId }/${ context.activity.from.id }`;
    }

    /**
     * Signs the user out with the token server.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     */
    public async getAadTokens(context: TurnContext, connectionName: string, resourceUrls: string[]): Promise<{
        [propertyName: string]: TokenResponse;
    }> {
        return undefined;
    }

    
    private exchangeableTokens : {[key: string]: ExchangeableToken} = {};

    public addExchangeableToken(connectionName: string, channelId: string, userId: string, exchangeableItem: string, token: string) {
        const key: ExchangeableToken = new ExchangeableToken();
        key.ChannelId = channelId;
        key.ConnectionName = connectionName;
        key.UserId = userId;
        key.exchangeableItem = exchangeableItem;
        key.Token = token;
        this.exchangeableTokens[key.toKey()] = key;
    }

    public async getSignInResource(context: TurnContext, connectionName: string, userId?: string, finalRedirect?: string): Promise<SignInUrlResponse> {
        return {
            signInLink: `https://botframeworktestadapter.com/oauthsignin/${connectionName}/${context.activity.channelId}/${userId}`,
            tokenExchangeResource: {
                id: String(Math.random()),
                providerId: null,
                uri: `api://${connectionName}/resource`

            }
        }
    }


    public async exchangeToken(context: TurnContext, connectionName: string, userId: string, tokenExchangeRequest: TokenExchangeRequest): Promise<TokenResponse> {
        const exchangeableValue: string = tokenExchangeRequest.token ? tokenExchangeRequest.token : tokenExchangeRequest.uri;
        const key = new ExchangeableToken();
        key.ChannelId = context.activity.channelId;
        key.ConnectionName = connectionName;
        key.exchangeableItem =  exchangeableValue;
        key.UserId = userId;

        const tokenExchangeResponse = this.exchangeableTokens[key.toKey()];
        if (tokenExchangeResponse && tokenExchangeResponse.Token === this.ExceptionExpected) {
            throw new Error('Exception occurred during exchanging tokens');
        }

        return tokenExchangeResponse ? 
            {
                channelId: key.ChannelId,
                connectionName: key.ConnectionName,
                token: tokenExchangeResponse.Token,
                expiration: null
            } :
            null;
    }

    /**
     * Adds an instruction to throw an exception during exchange requests.
     * @param connectionName The connection name.
     * @param channelId The channel id.
     * @param userId The user id.
     * @param exchangeableItem The exchangeable token or resource URI.
     */
    public throwOnExchangeRequest(connectionName: string, channelId: string, userId: string, exchangeableItem: string): void {
        const token: ExchangeableToken = new ExchangeableToken();
        token.ChannelId = channelId;
        token.ConnectionName = connectionName;
        token.UserId = userId;
        token.exchangeableItem = exchangeableItem;
        const key = token.toKey();

        token.Token = this.ExceptionExpected;
        this.exchangeableTokens[key] = token;
    }

    /**
     * Indicates if the activity is a reply from the bot (role == 'bot')
     *
     * @remarks
     * Checks to see if the from property and if from.role exists on the Activity before
     * checking to see who the activity is from. Otherwise returns false by default.
     * @param activity Activity to check.
     */
    private isReply(activity: Partial<Activity>): boolean {
        if (activity.from && activity.from.role) {
            return activity.from.role && activity.from.role.toLocaleLowerCase() === 'bot';
        } else {
            return false;
        }
    }
}

class UserToken {
    public ConnectionName: string;
    public UserId: string;
    public ChannelId: string;
    public Token: string;

    public EqualsKey(rhs: UserToken): boolean {
        return rhs != null &&
            this.ConnectionName === rhs.ConnectionName &&
            this.UserId === rhs.UserId &&
            this.ChannelId === rhs.ChannelId;
    }
}

class TokenMagicCode {
    public Key: UserToken;
    public MagicCode: string;
}

class ExchangeableToken extends UserToken {
    public exchangeableItem: string;

    public EqualsKey(rhs: ExchangeableToken): boolean {
        return rhs != null &&
            this.exchangeableItem === rhs.exchangeableItem &&
            super.EqualsKey(rhs);
    }

    public toKey(): string {
        return this.exchangeableItem;
    }
}

/**
 * Support class for `TestAdapter` that allows for the simple construction of a sequence of tests.
 *
 * @remarks
 * Calling `adapter.send()` or `adapter.test()` will create a new test flow which you can chain
 * together additional tests using a fluent syntax.
 *
 * ```JavaScript
 * const { TestAdapter } = require('botbuilder');
 *
 * const adapter = new TestAdapter(async (context) => {
 *    if (context.text === 'hi') {
 *       await context.sendActivity(`Hello World`);
 *    } else if (context.text === 'bye') {
 *       await context.sendActivity(`Goodbye`);
 *    }
 * });
 *
 * adapter.test(`hi`, `Hello World`)
 *        .test(`bye`, `Goodbye`)
 *        .then(() => done());
 * ```
 */
export class TestFlow {

    /**
     * @private
     * INTERNAL: creates a new TestFlow instance.
     * @param previous Promise chain for the current test sequence.
     * @param adapter Adapter under tested.
     */
    constructor(public previous: Promise<void>, private adapter: TestAdapter) { }

    /**
     * Send something to the bot and expects the bot to return with a given reply. This is simply a
     * wrapper around calls to `send()` and `assertReply()`. This is such a common pattern that a
     * helper is provided.
     * @param userSays Text or activity simulating user input.
     * @param expected Expected text or activity of the reply sent by the bot.
     * @param description (Optional) Description of the test case. If not provided one will be generated.
     * @param timeout (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`.
     */
    public test(
        userSays: string | Partial<Activity>,
        expected: string | Partial<Activity> | ((activity: Partial<Activity>, description?: string) => void),
        description?: string,
        timeout?: number
    ): TestFlow {
        return this.send(userSays)
            .assertReply(expected, description || `test("${ userSays }", "${ expected }")`, timeout);
    }

    /**
     * Sends something to the bot.
     * @param userSays Text or activity simulating user input.
     */
    public send(userSays: string | Partial<Activity>): TestFlow {
        return new TestFlow(this.previous.then(() => this.adapter.receiveActivity(userSays)), this.adapter);
    }

    /**
     * Generates an assertion if the bots response doesn't match the expected text/activity.
     * @param expected Expected text or activity from the bot. Can be a callback to inspect the response using custom logic.
     * @param description (Optional) Description of the test case. If not provided one will be generated.
     * @param timeout (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`.
     */
    public assertReply(expected: string | Partial<Activity> | TestActivityInspector, description?: string, timeout?: number): TestFlow {
        function defaultInspector(reply: Partial<Activity>, description2?: string): void {
            if (typeof expected === 'object') {
                validateActivity(reply, expected);
            } else {
                assert.equal(reply.type, ActivityTypes.Message, `${ description2 } type === '${ reply.type }'. `);
                assert.equal(reply.text, expected, `${ description2 } text === "${ reply.text }"`);
            }
        }

        if (!description) { description = ''; }
        const inspector: TestActivityInspector = typeof expected === 'function' ? expected : defaultInspector;

        return new TestFlow(
            this.previous.then(() => {
                // tslint:disable-next-line:promise-must-complete
                return new Promise<void>((resolve: any, reject: any): void => {
                    if (!timeout) { timeout = 3000; }
                    const start: number = new Date().getTime();
                    const adapter: TestAdapter = this.adapter;

                    function waitForActivity(): void {
                        const current: number = new Date().getTime();
                        if ((current - start) > <number>timeout) {
                            // Operation timed out
                            let expecting: string;
                            switch (typeof expected) {
                                case 'string':
                                default:
                                    expecting = `"${ expected.toString() }"`;
                                    break;
                                case 'object':
                                    expecting = `"${ (expected as Activity).text }`;
                                    break;
                                case 'function':
                                    expecting = expected.toString();
                                    break;
                            }
                            reject(
                                new Error(`TestAdapter.assertReply(${ expecting }): ${ description } Timed out after ${ current - start }ms.`)
                            );
                        } else if (adapter.activityBuffer.length > 0) {
                            // Activity received
                            const reply: Partial<Activity> = adapter.activityBuffer.shift() as Activity;
                            try {
                                inspector(reply, description as string);
                            } catch (err) {
                                reject(err);
                            }
                            resolve();
                        } else {
                            setTimeout(waitForActivity, 5);
                        }
                    }
                    waitForActivity();
                });
            }),
            this.adapter);
    }

    /**
     * Generates an assertion that the turn processing logic did not generate a reply from the bot, as expected.
     * @param description (Optional) Description of the test case. If not provided one will be generated.
     * @param timeout (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`.
     */
    public assertNoReply(description?: string, timeout?: number): TestFlow {
        return new TestFlow(
            this.previous.then(() => {
                // tslint:disable-next-line:promise-must-complete
                return new Promise<void>((resolve: any, reject: any): void => {
                    if (!timeout) { timeout = 3000; }
                    const start: number = new Date().getTime();
                    const adapter: TestAdapter = this.adapter;

                    function waitForActivity(): void {
                        const current: number = new Date().getTime();
                        if ((current - start) > <number>timeout) {
                            // Operation timed out and received no reply
                            resolve();
                        } else if (adapter.activityBuffer.length > 0) {
                            // Activity received
                            const reply: Partial<Activity> = adapter.activityBuffer.shift() as Activity;
                            assert.strictEqual(reply, undefined, `${ JSON.stringify(reply) } is responded when waiting for no reply: '${ description }'`);
                            resolve();
                        } else {
                            setTimeout(waitForActivity, 5);
                        }
                    }
                    waitForActivity();
                });
            }),
            this.adapter);
    }

    /**
     * Generates an assertion if the bots response is not one of the candidate strings.
     * @param candidates List of candidate responses.
     * @param description (Optional) Description of the test case. If not provided one will be generated.
     * @param timeout (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`.
     */
    public assertReplyOneOf(candidates: string[], description?: string, timeout?: number): TestFlow {
        return this.assertReply(
            (activity: Partial<Activity>, description2: string) => {
                for (const candidate of candidates) {
                    if (activity.text === candidate) {
                        return;
                    }
                }
                assert.fail(`TestAdapter.assertReplyOneOf(): ${ description2 || '' } FAILED, Expected one of :${ JSON.stringify(candidates) }`);
            },
            description,
            timeout
        );
    }

    /**
     * Inserts a delay before continuing.
     * @param ms ms to wait
     */
    public delay(ms: number): TestFlow {
        return new TestFlow(
            this.previous.then(() => {
                return new Promise<void>((resolve: any, reject: any): void => { setTimeout(resolve, ms); });
            }),
            this.adapter
        );
    }

    /**
     * Adds a `then()` step to the tests promise chain.
     * @param onFulfilled Code to run if the test is currently passing.
     */
    public then(onFulfilled?: () => void): TestFlow {
        return new TestFlow(this.previous.then(onFulfilled), this.adapter);
    }

    /**
     * Adds a `catch()` clause to the tests promise chain.
     * @param onRejected Code to run if the test has thrown an error.
     */
    public catch(onRejected?: (reason: any) => void): TestFlow {
        return new TestFlow(this.previous.catch(onRejected), this.adapter);
    }

    /**
     * Start the test sequence, returning a promise to await
     */
    public startTest(): Promise<void> {
        return this.previous;
    }
}

/**
 * @private
 * @param activity an activity object to validate
 * @param expected expected object to validate against
 */
function validateActivity(activity: Partial<Activity>, expected: Partial<Activity>): void {
    // tslint:disable-next-line:forin
    Object.keys(expected).forEach((prop: any) => {
        assert.equal((<any>activity)[prop], (<any>expected)[prop]);
    });
}

/**
 * @private
 * Does a shallow comparison of:
 * - type
 * - text
 * - speak
 * - suggestedActions
 */
function validateTranscriptActivity(activity: Partial<Activity>, expected: Partial<Activity>, description: string): void {
    assert.equal(activity.type, expected.type, `failed "type" assert on ${ description }`);
    assert.equal(activity.text, expected.text, `failed "text" assert on ${ description }`);
    assert.equal(activity.speak, expected.speak, `failed "speak" assert on ${ description }`);
    assert.deepEqual(activity.suggestedActions, expected.suggestedActions, `failed "suggestedActions" assert on ${ description }`);
}
