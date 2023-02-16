const { ChannelServiceRoutes, ChannelServiceHandler, WebRequest, StatusCodes } = require('../');
const assert = require('assert');
const sinon = require('sinon');

class MockResponse {
    constructor(expects, done) {
        this.expects = expects;
        this.statusCode = 0;
        this.body = {};
        this.done = done;
    }

    end() {
        try {
            assert.deepStrictEqual(this.statusCode, this.expects.statusCode, 'not equal');
            assert.deepStrictEqual(this.body, this.expects.body, 'not equal');
            this.done();
        } catch (err) {
            this.done(err);
        }
    }

    status(code) {
        this.statusCode = code;
    }

    send(body) {
        this.body = body;
    }
}

describe('channelServiceRoutes', function () {
    let sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('constructor()', function () {
        it('should succeed with correct parameters', function () {
            const testHandler = sandbox.mock(ChannelServiceHandler);
            const channelServiceRoutes = new ChannelServiceRoutes(testHandler);

            assert.strictEqual(channelServiceRoutes.channelServiceHandler, testHandler);
        });
    });

    describe('register()', function () {
        let channel, server;
        beforeEach(function () {
            const testHandler = sandbox.mock(ChannelServiceHandler);
            channel = new ChannelServiceRoutes(testHandler);
            server = {
                post: sandbox.spy(),
                get: sandbox.spy(),
                put: sandbox.spy(),
                del: sandbox.spy(),
            };
        });

        it('should register webservers', function () {
            channel.register(server, 'test');

            assert(server.post.calledWith('test/v3/conversations/:conversationId/activities'));
            assert(server.post.calledWith('test/v3/conversations/:conversationId/activities/:activityId'));
            assert(server.post.calledWith('test/v3/conversations/:conversationId/activities/history'));
            assert(server.post.calledWith('test/v3/conversations'));
            assert(server.post.calledWith('test/v3/conversations/:conversationId/attachments'));
            assert(server.get.calledWith('test/v3/conversations/:conversationId/activities/:activityId/members'));
            assert(server.get.calledWith('test/v3/conversations'));
            assert(server.get.calledWith('test/v3/conversations/:conversationId/members'));
            assert(server.get.calledWith('test/v3/conversations/:conversationId/pagedmembers'));
            assert(server.put.calledWith('test/v3/conversations/:conversationId/activities/:activityId'));
            assert(server.del.calledWith('test/v3/conversations/:conversationId/members/:memberId'));
            assert(server.del.calledWith('test/v3/conversations/:conversationId/activities/:activityId'));
        });
    });

    describe('private functions', function () {
        const handlers = {};
        const req = {
            body: {
                type: '',
            },
            headers: {},
            params: {},
            query: {},
            on(handler, callback) {
                handlers[handler] = callback;
            },
            executeHandler(handler, attr) {
                if (!!handlers[handler] && typeof handlers[handler] == 'function') {
                    handlers[handler](attr);
                }
            },
        };
        const testResource = { id: 'testId' };
        const errorHandler = ChannelServiceRoutes.handleError;
        let readActivityStub;
        let readBodyStub;

        afterEach(function () {
            ChannelServiceRoutes.handleError = errorHandler;
            if (readActivityStub) {
                readActivityStub.restore();
            }
            if (readBodyStub) {
                readBodyStub.restore();
            }
        });

        describe('processSendToConversation()', function () {
            it('should end successfully', function (done) {
                try {
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: testResource,
                        },
                        done
                    );

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleSendToConversation = sandbox.stub().resolves(testResource);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processSendToConversation(req, res, Function);
                } catch (err) {
                    done(err);
                }
            });

            it('should throw a handleSendToConversation error', function (done) {
                try {
                    const resourceResponse = { error: 'handleSendToConversation error' };
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: resourceResponse,
                        },
                        done
                    );

                    ChannelServiceRoutes.handleError = (err) => {
                        assert.deepStrictEqual(
                            err,
                            resourceResponse,
                            `expected: ${JSON.stringify(resourceResponse)}. received: ${JSON.stringify(err)}`
                        );
                        done();
                    };
                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleSendToConversation = sandbox.stub().rejects(resourceResponse);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processSendToConversation(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });

            it('should throw a readActivity error', function (done) {
                try {
                    const resourceResponse = { error: 'readActivity error' };
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: resourceResponse,
                        },
                        done
                    );

                    ChannelServiceRoutes.handleError = (err) => {
                        assert.deepStrictEqual(
                            err,
                            resourceResponse,
                            `expected: ${JSON.stringify(resourceResponse)}. received: ${JSON.stringify(err)}`
                        );
                        done();
                    };

                    const service = sandbox.createStubInstance(ChannelServiceHandler);

                    readActivityStub = sandbox.stub(ChannelServiceRoutes, 'readActivity');
                    readActivityStub.rejects(resourceResponse);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processSendToConversation(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });
        });

        describe('processReplyToActivity()', function () {
            it('should end successfully', function (done) {
                try {
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: testResource,
                        },
                        done
                    );

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleReplyToActivity = sandbox.stub().resolves(testResource);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processReplyToActivity(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });

            it('should throw a handleReplyToActivity error', function (done) {
                try {
                    const resourceResponse = { error: 'handleReplyToActivity error' };
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: resourceResponse,
                        },
                        done
                    );

                    ChannelServiceRoutes.handleError = (err) => {
                        assert.deepStrictEqual(
                            err,
                            resourceResponse,
                            `expected: ${JSON.stringify(resourceResponse)}. received: ${JSON.stringify(err)}`
                        );
                        done();
                    };

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleReplyToActivity = sandbox.stub().rejects(resourceResponse);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processReplyToActivity(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });

            it('should throw a readActivity error', function (done) {
                try {
                    const resourceResponse = { error: 'readActivity error' };
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: resourceResponse,
                        },
                        done
                    );

                    ChannelServiceRoutes.handleError = (err) => {
                        assert.deepStrictEqual(
                            err,
                            resourceResponse,
                            `expected: ${JSON.stringify(resourceResponse)}. received: ${JSON.stringify(err)}`
                        );
                        done();
                    };

                    const service = sandbox.createStubInstance(ChannelServiceHandler);

                    readActivityStub = sandbox.stub(ChannelServiceRoutes, 'readActivity');
                    readActivityStub.rejects(resourceResponse);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processReplyToActivity(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });
        });

        describe('processUpdateActivity()', function () {
            it('should end successfully', function (done) {
                try {
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: testResource,
                        },
                        done
                    );

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleUpdateActivity = sandbox.stub().resolves(testResource);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processUpdateActivity(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });

            it('should throw a handleUpdateActivity error', function (done) {
                try {
                    const resourceResponse = { error: 'handleUpdateActivity error' };
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: resourceResponse,
                        },
                        done
                    );

                    ChannelServiceRoutes.handleError = (err) => {
                        assert.deepStrictEqual(
                            err,
                            resourceResponse,
                            `expected: ${JSON.stringify(resourceResponse)}. received: ${JSON.stringify(err)}`
                        );
                        done();
                    };

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleUpdateActivity = sandbox.stub().rejects(resourceResponse);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processUpdateActivity(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });

            it('should throw a readActivity error', function (done) {
                try {
                    const resourceResponse = { error: 'readActivity error' };
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: resourceResponse,
                        },
                        done
                    );

                    ChannelServiceRoutes.handleError = (err) => {
                        assert.deepStrictEqual(
                            err,
                            resourceResponse,
                            `expected: ${JSON.stringify(resourceResponse)}. received: ${JSON.stringify(err)}`
                        );
                        done();
                    };

                    const service = sandbox.createStubInstance(ChannelServiceHandler);

                    readActivityStub = sandbox.stub(ChannelServiceRoutes, 'readActivity');
                    readActivityStub.rejects(resourceResponse);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processUpdateActivity(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });
        });

        describe('processDeleteActivity()', function () {
            it('should end successfully', function (done) {
                try {
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: {},
                        },
                        done
                    );

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleDeleteActivity = sandbox.stub().resolves();

                    const channel = new ChannelServiceRoutes(service);
                    channel.processDeleteActivity(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });

            it('should throw a handleDeleteActivity error', function (done) {
                try {
                    const resourceResponse = { error: 'handleDeleteActivity error' };
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: resourceResponse,
                        },
                        done
                    );

                    ChannelServiceRoutes.handleError = (err) => {
                        assert.deepStrictEqual(
                            err,
                            resourceResponse,
                            `expected: ${JSON.stringify(resourceResponse)}. received: ${JSON.stringify(err)}`
                        );
                        done();
                    };

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleDeleteActivity = sandbox.stub().rejects(resourceResponse);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processDeleteActivity(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });
        });

        describe('processGetActivityMembers()', function () {
            it('should end successfully', function (done) {
                try {
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: testResource,
                        },
                        done
                    );

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleGetActivityMembers = sandbox.stub().resolves(testResource);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processGetActivityMembers(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });

            it('should throw a handleGetActivityMembers error', function (done) {
                try {
                    const resourceResponse = { error: 'handleGetActivityMembers error' };
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: resourceResponse,
                        },
                        done
                    );

                    ChannelServiceRoutes.handleError = (err) => {
                        assert.deepStrictEqual(
                            err,
                            resourceResponse,
                            `expected: ${JSON.stringify(resourceResponse)}. received: ${JSON.stringify(err)}`
                        );
                        done();
                    };

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleGetActivityMembers = sandbox.stub().rejects(resourceResponse);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processGetActivityMembers(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });
        });

        describe('processCreateConversation()', function () {
            it('should end successfully', function (done) {
                try {
                    const res = new MockResponse(
                        {
                            statusCode: 201,
                            body: testResource,
                        },
                        done
                    );

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleCreateConversation = sandbox.stub().resolves(testResource);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processCreateConversation(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });

            it('should throw a handleCreateConversation error', function (done) {
                try {
                    const resourceResponse = { error: 'handleCreateConversation error' };
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: resourceResponse,
                        },
                        done
                    );

                    ChannelServiceRoutes.handleError = (err) => {
                        assert.deepStrictEqual(
                            err,
                            resourceResponse,
                            `expected: ${JSON.stringify(resourceResponse)}. received: ${JSON.stringify(err)}`
                        );
                        done();
                    };

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleCreateConversation = sandbox.stub().rejects(resourceResponse);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processCreateConversation(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });
        });

        describe('processGetConversations()', function () {
            it('should end successfully', function (done) {
                try {
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: testResource,
                        },
                        done
                    );

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleGetConversations = sandbox.stub().resolves(testResource);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processGetConversations(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });

            it('should throw a handleGetConversations error', function (done) {
                try {
                    const resourceResponse = { error: 'handleGetConversations error' };
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: resourceResponse,
                        },
                        done
                    );

                    ChannelServiceRoutes.handleError = (err) => {
                        assert.deepStrictEqual(
                            err,
                            resourceResponse,
                            `expected: ${JSON.stringify(resourceResponse)}. received: ${JSON.stringify(err)}`
                        );
                        done();
                    };

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleGetConversations = sandbox.stub().rejects(resourceResponse);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processGetConversations(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });
        });

        describe('processGetConversationMembers()', function () {
            it('should end successfully', function (done) {
                try {
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: testResource,
                        },
                        done
                    );

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleGetConversationMembers = sandbox.stub().resolves(testResource);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processGetConversationMembers(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });

            it('should throw a handleGetConversationMembers error', function (done) {
                try {
                    const resourceResponse = { error: 'handleGetConversationMembers error' };
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: resourceResponse,
                        },
                        done
                    );

                    ChannelServiceRoutes.handleError = (err) => {
                        assert.deepStrictEqual(
                            err,
                            resourceResponse,
                            `expected: ${JSON.stringify(resourceResponse)}. received: ${JSON.stringify(err)}`
                        );
                        done();
                    };

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleGetConversationMembers = sandbox.stub().rejects(resourceResponse);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processGetConversationMembers(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });
        });

        describe('processGetConversationPagedMembers()', function () {
            it('should end successfully', function (done) {
                try {
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: testResource,
                        },
                        done
                    );

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleGetConversationPagedMembers = sandbox.stub().resolves(testResource);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processGetConversationPagedMembers(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });

            it('should throw a handleGetConversationPagedMembers error', function (done) {
                try {
                    const resourceResponse = { error: 'handleGetConversationPagedMembers error' };
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: resourceResponse,
                        },
                        done
                    );

                    ChannelServiceRoutes.handleError = (err) => {
                        assert.deepStrictEqual(
                            err,
                            resourceResponse,
                            `expected: ${JSON.stringify(resourceResponse)}. received: ${JSON.stringify(err)}`
                        );
                        done();
                    };

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleGetConversationPagedMembers = sandbox.stub().rejects(resourceResponse);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processGetConversationPagedMembers(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });
        });

        describe('processDeleteConversationMember()', function () {
            it('should end successfully', function (done) {
                try {
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: {},
                        },
                        done
                    );

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleDeleteConversationMember = sandbox.stub().resolves(testResource);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processDeleteConversationMember(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });

            it('should throw a handleDeleteConversationMember error', function (done) {
                try {
                    const resourceResponse = { error: 'handleDeleteConversationMember error' };
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: resourceResponse,
                        },
                        done
                    );

                    ChannelServiceRoutes.handleError = (err) => {
                        assert.deepStrictEqual(
                            err,
                            resourceResponse,
                            `expected: ${JSON.stringify(resourceResponse)}. received: ${JSON.stringify(err)}`
                        );
                        done();
                    };

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleDeleteConversationMember = sandbox.stub().rejects(resourceResponse);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processDeleteConversationMember(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });
        });

        describe('processSendConversationHistory()', function () {
            it('should end successfully', function (done) {
                try {
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: testResource,
                        },
                        done
                    );

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleSendConversationHistory = sandbox.stub().resolves(testResource);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processSendConversationHistory(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });

            it('should throw a handleSendConversationHistory error', function (done) {
                try {
                    const resourceResponse = { error: 'handleSendConversationHistory error' };
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: resourceResponse,
                        },
                        done
                    );

                    ChannelServiceRoutes.handleError = (err) => {
                        assert.deepStrictEqual(
                            err,
                            resourceResponse,
                            `expected: ${JSON.stringify(resourceResponse)}. received: ${JSON.stringify(err)}`
                        );
                        done();
                    };

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleSendConversationHistory = sandbox.stub().rejects(resourceResponse);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processSendConversationHistory(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });

            it('should throw a readBody error', function (done) {
                try {
                    const resourceResponse = { error: 'readBody error' };
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: resourceResponse,
                        },
                        done
                    );

                    ChannelServiceRoutes.handleError = (err) => {
                        assert.deepStrictEqual(
                            err,
                            resourceResponse,
                            `expected: ${JSON.stringify(resourceResponse)}. received: ${JSON.stringify(err)}`
                        );
                        done();
                    };

                    const service = sandbox.createStubInstance(ChannelServiceHandler);

                    readBodyStub = sandbox.stub(ChannelServiceRoutes, 'readBody');
                    readBodyStub.rejects(resourceResponse);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processSendConversationHistory(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });
        });

        describe('processUploadAttachment()', function () {
            it('should end successfully', function (done) {
                try {
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: testResource,
                        },
                        done
                    );

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleUploadAttachment = sandbox.stub().resolves(testResource);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processUploadAttachment(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });

            it('should throw a handleUploadAttachment error', function (done) {
                try {
                    const resourceResponse = { error: 'handleUploadAttachment error' };
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: resourceResponse,
                        },
                        done
                    );

                    ChannelServiceRoutes.handleError = (err) => {
                        assert.deepStrictEqual(
                            err,
                            resourceResponse,
                            `expected: ${JSON.stringify(resourceResponse)}. received: ${JSON.stringify(err)}`
                        );
                        done();
                    };

                    const service = sandbox.createStubInstance(ChannelServiceHandler);
                    service.handleUploadAttachment = sandbox.stub().rejects(resourceResponse);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processUploadAttachment(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });

            it('should throw a readBody error', function (done) {
                try {
                    const resourceResponse = { error: 'readBody error' };
                    const res = new MockResponse(
                        {
                            statusCode: 200,
                            body: resourceResponse,
                        },
                        done
                    );

                    ChannelServiceRoutes.handleError = (err) => {
                        assert.deepStrictEqual(
                            err,
                            resourceResponse,
                            `expected: ${JSON.stringify(resourceResponse)}. received: ${JSON.stringify(err)}`
                        );
                        done();
                    };

                    const service = sandbox.createStubInstance(ChannelServiceHandler);

                    readBodyStub = sandbox.stub(ChannelServiceRoutes, 'readBody');
                    readBodyStub.rejects(resourceResponse);

                    const channel = new ChannelServiceRoutes(service);
                    channel.processUploadAttachment(req, res, Function);
                } catch (error) {
                    done(error);
                }
            });
        });

        describe('readActivity()', function () {
            it('should throw with invalid body', async function () {
                const req = sandbox.mock(WebRequest);
                req.body = {};

                ChannelServiceRoutes.readActivity(req).catch((err) => {
                    assert.strictEqual(err.statusCode, StatusCodes.BAD_REQUEST);
                });
            });

            it('should return activity', async function () {
                const req = sandbox.mock(WebRequest);
                req.body = {
                    type: 'testactivity',
                    timestamp: Date.now(),
                    expiration: '2200-01-01',
                    localTimeStamp: Date.now(),
                };

                ChannelServiceRoutes.readActivity(req).then((activity) => {
                    assert.strictEqual(activity.type, 'testactivity');
                });
            });
        });

        describe('readBody()', function () {
            it('should return request.body from "on" events', function (done) {
                const source = { test: true };

                const request = {
                    ...req,
                    body: null,
                };

                // readBody Promise wrapper to resolve after the readBody request.on('data') and request.on('end') are assigned.
                new Promise((resolve) => {
                    ChannelServiceRoutes.readBody(request)
                        .then((body) => {
                            assert.deepStrictEqual(
                                body,
                                source,
                                `expected: ${JSON.stringify(source)}. received: ${JSON.stringify(body)}`
                            );
                            done();
                        })
                        .catch((err) => done(err));

                    resolve();
                }).then(() => {
                    // After the Promise resolve, trigger the request on handlers.
                    request.executeHandler('data', JSON.stringify(source));
                    request.executeHandler('end');
                });
            });
        });
    });
});
