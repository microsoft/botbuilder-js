// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const nock = require('nock');
const restify = require('restify');
const sinon = require('sinon');
const supertest = require('supertest');
const { CloudAdapter, TurnContext, StatusCodes, ActivityTypes, DeliveryModes } = require('..');
const { jwt, oauth, sinonExt } = require('botbuilder-test-utils');

const {
    AuthenticationConfiguration,
    EmulatorValidation,
    ParameterizedBotFrameworkAuthentication,
    PasswordServiceClientCredentialFactory,
    SkillValidation,
    makeAuthValidator,
} = require('botframework-connector');

const reference = {
    activityId: '1234',
    channelId: 'test',
    serviceUrl: 'https://service.url',
    user: { id: 'user', name: 'User Name' },
    bot: { id: 'bot', name: 'Bot Name' },
    conversation: {
        id: 'convo1',
        properties: {
            foo: 'bar',
        },
    },
};

const incoming = TurnContext.applyConversationReference({ text: 'test', type: ActivityTypes.Message }, reference, true);

const outgoing = TurnContext.applyConversationReference({ text: 'test', type: ActivityTypes.Message }, reference);

const invoke = TurnContext.applyConversationReference({ type: ActivityTypes.Invoke }, reference, true);

const expectReplies = TurnContext.applyConversationReference(
    { deliveryMode: DeliveryModes.ExpectReplies, text: 'test', type: ActivityTypes.Message },
    reference,
    true
);

describe.only('CloudAdapter', () => {
    jwt.mocha();
    oauth.mocha();
    const sandbox = sinonExt.mocha();

    const makeAdapter = async ({
        appId = 'appId',
        appPassword = 'password',
        callerId = 'caller:id',
        connectorClientNock = undefined,
        expectReplies = false,
        invokeResponse = null,
        loginUrl = 'login.url',
        nockMatcher = null,
        oauthScope = 'oauth:scope',
        skipJwtVerify = false,
    } = {}) => {
        const { issuer, metadata, sign, verify } = jwt.stub();

        const credentialFactory = new PasswordServiceClientCredentialFactory(appId, appPassword);
        const authConfig = new AuthenticationConfiguration();

        const authValidator = (expectedClaim) =>
            makeAuthValidator(
                {
                    issuer,
                },
                metadata,
                async (_, identity) => {
                    assert(
                        identity.claims.find((c) => c.type === expectedClaim.type && c.value === expectedClaim.value),
                        'could not locate expected claim'
                    );
                }
            );

        const auth = new ParameterizedBotFrameworkAuthentication(
            credentialFactory,
            authConfig,
            true,
            loginUrl,
            oauthScope,
            callerId,
            authValidator({ type: 'test', value: 'general' }),
            authValidator({ type: 'test', value: 'emulator' }),
            authValidator({ type: 'test', value: 'skill' })
        );

        const adapter = new CloudAdapter(auth, appId);

        connectorClientNock =
            connectorClientNock ||
            nock(reference.serviceUrl)
                .post(`/v3/conversations/${reference.conversation.id}/activities/${reference.activityId}`)
                .reply(200, {});

        if (nockMatcher) {
            connectorClientNock = nockMatcher(connectorClientNock);
        }

        const app = restify.createServer();

        app.post('/api/messages', async (req, res) => {
            await adapter.process(req, res, async (turnContext) => {
                sinon.assert.match(turnContext, sinon.match.instanceOf(TurnContext));

                if (invokeResponse) {
                    turnContext.turnState.set(adapter.InvokeResponseKey, {
                        status: StatusCodes.OK,
                        body: invokeResponse,
                    });
                }

                if (!expectReplies) {
                    await turnContext.sendActivity(outgoing);
                }
            });
        });

        return {
            adapter,
            app: supertest(app),
            sign,
            verify: () => {
                if (!skipJwtVerify) verify();
                if (!expectReplies) connectorClientNock.done();
                sandbox().verify();
            },
        };
    };

    describe('process', () => {
        beforeEach(() => {
            nock.enableNetConnect('127.0.0.1');
        });

        it('works with general auth', async () => {
            const { app, sign, verify } = await makeAdapter();

            await app
                .post('/api/messages')
                .set('Authorization', `Bearer ${sign({ test: 'general' })}`)
                .send(incoming)
                .expect(200);

            verify();
        });

        it('works with expectReplies', async () => {
            const { app, sign, verify } = await makeAdapter({ expectReplies: true });

            const res = await app
                .post('/api/messages')
                .set('Authorization', `Bearer ${sign({ test: 'general' })}`)
                .send(expectReplies)
                .expect(200);

            assert.ok(res.body.length);

            verify();
        });

        it('works with emulator auth', async () => {
            const { app, sign, verify } = await makeAdapter();

            const authHeader = `Bearer ${sign({ test: 'emulator' })}`;
            sandbox()
                .mock(EmulatorValidation)
                .expects('isTokenFromEmulator')
                .withArgs(authHeader)
                .once()
                .resolves(true);

            await app.post('/api/messages').set('Authorization', authHeader).send(incoming).expect(200);
            verify();
        });

        it('works with skills auth', async () => {
            const { app, sign, verify } = await makeAdapter();

            const authHeader = `Bearer ${sign({ test: 'skill' })}`;
            sandbox().mock(SkillValidation).expects('isSkillToken').withArgs(authHeader).once().resolves(true);

            await app.post('/api/messages').set('Authorization', authHeader).send(incoming).expect(200);
            verify();
        });

        it('yields 401 for unauthenticated request', async () => {
            const { app } = await makeAdapter();
            await app.post('/api/messages').set('Authorization', `Bearer malformed`).send(incoming).expect(401);
        });

        it('yields a 501 for invoke with no response', async () => {
            const { app, sign, verify } = await makeAdapter();

            await app
                .post('/api/messages')
                .set('Authorization', `Bearer ${sign({ test: 'general' })}`)
                .send(invoke)
                .expect(501);

            verify();
        });

        it('returns invoke response', async () => {
            const invokeResponse = { hello: 'world' };
            const { app, sign, verify } = await makeAdapter({ invokeResponse });

            const res = await app
                .post('/api/messages')
                .set('Authorization', `Bearer ${sign({ test: 'general' })}`)
                .send(invoke)
                .expect(200);

            assert.deepStrictEqual(JSON.parse(res.body), invokeResponse);

            verify();
        });
    });

    describe('CloudAdapterBase', () => {
        describe('continueConversation', () => {
            it('works', async () => {
                const appId = 'proactiveAppId';
                const oauthScope = 'oauth:scope';

                const { match: nockMatcher, verify: verifyOauth } = oauth.stub({ clientId: appId, scope: oauthScope });

                const { adapter, verify } = await makeAdapter({
                    appId,
                    nockMatcher,
                    oauthScope,
                    skipJwtVerify: true,
                });

                await adapter.continueConversation(reference, async (turnContext) => {
                    sinon.assert.match(turnContext, sinon.match.instanceOf(TurnContext));
                    await turnContext.sendActivity(outgoing);
                });

                verify();
                verifyOauth();
            });
        });

        describe('updateActivity', () => {
            it('works', async () => {
                const connectorClientNock = nock(reference.serviceUrl)
                    .put(`/v3/conversations/${reference.conversation.id}/activities/${reference.activityId}`)
                    .reply(200);

                const { adapter, sign, verify } = await makeAdapter({ connectorClientNock });

                await adapter.processActivity(`Bearer ${sign({ test: 'general' })}`, incoming, async (turnContext) => {
                    await adapter.updateActivity(turnContext, incoming);
                });

                verify();
            });
        });

        describe('deleteActivity', () => {
            it('works', async () => {
                const connectorClientNock = nock(reference.serviceUrl)
                    .delete(`/v3/conversations/${reference.conversation.id}/activities/${reference.activityId}`)
                    .reply(200);

                const { adapter, sign, verify } = await makeAdapter({ connectorClientNock });

                await adapter.processActivity(`Bearer ${sign({ test: 'general' })}`, incoming, async (turnContext) => {
                    await adapter.deleteActivity(turnContext, reference);
                });

                verify();
            });
        });
    });
});
