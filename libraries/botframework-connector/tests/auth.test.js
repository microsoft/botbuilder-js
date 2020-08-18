const assert = require('assert');
const { AuthenticationConstants, ChannelValidation, ClaimsIdentity, EndorsementsValidator, EnterpriseChannelValidation,
    GovernmentChannelValidation, JwtTokenValidation, MicrosoftAppCredentials, SimpleCredentialProvider } = require('../lib');
const { StatusCodes } = require('botframework-schema');

describe('Bot Framework Connector - Auth Tests', function() {

    describe('Connector Tokens', function() {
        this.timeout(20000);

        let header;
        let genericCredentials;
        let emptyCredentials;
        before(async () => {
            const tokenGenerator = new MicrosoftAppCredentials('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
            header = `Bearer ${ await tokenGenerator.getToken(true) }`;
            genericCredentials = new SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
            emptyCredentials = new SimpleCredentialProvider('', '');
        });

        describe('EmptyHeader', function() {
            it('Bot with noCredentials should throw', async () => {
                try {
                    await JwtTokenValidation.validateAuthHeader('', emptyCredentials, undefined, '', '');
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(err.message === `'authHeader' required.`, `unexpected error thrown: "${ err.message }"`);
                    assert.equal(err.statusCode, StatusCodes.BAD_REQUEST);
                }
            });
        });

        describe('Emulator', function() {
            it('MsaHeader correct AppId and ServiceUrl should validate', async () => {
                const credentials = new SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '');
                const claims = await JwtTokenValidation.validateAuthHeader(header, credentials, undefined, '', '');
                assert(claims.isAuthenticated);
            });

            it('MsaHeader Bot AppId differs should not validate', async () => {
                const credentials = new SimpleCredentialProvider('00000000-0000-0000-0000-000000000000', '');
                try {
                    await JwtTokenValidation.validateAuthHeader(header, credentials, undefined, '', '');
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(err.message.substring('Unauthorized. Invalid AppId passed on token:'), `unexpected error thrown: "${ err.message }"`);
                    assert.strictEqual(err.statusCode, StatusCodes.UNAUTHORIZED);
                }
            });

            it('MsaHeader Bot AppId missing should not validate', async () => {
                try {
                    await JwtTokenValidation.validateAuthHeader(header, emptyCredentials, undefined, '', '');
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(err.message.substring('Unauthorized. Invalid AppId passed on token:'), `unexpected error thrown: "${ err.message }"`);
                    assert.strictEqual(err.statusCode, StatusCodes.UNAUTHORIZED);
                }
            });
        });

        describe('Channel', function() {
            it('MsaHeader with valid ServiceUrl should be trusted', async () => {
                const credentials = new SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '');
                await JwtTokenValidation.authenticateRequest({ serviceUrl: 'https://smba.trafficmanager.net/amer-client-ss.msg/' }, header, credentials, undefined);
                assert(MicrosoftAppCredentials.isTrustedServiceUrl('https://smba.trafficmanager.net/amer-client-ss.msg/'));
            });

            it('Obtain MsaHeader from a user specified tenant', async () => {
                const tokenGenerator = new MicrosoftAppCredentials('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F', 'microsoft.com');
                const header = `Bearer ${ await tokenGenerator.getToken(true) }`;
                const credentials = new SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '');
                const claims = await JwtTokenValidation.authenticateRequest({ serviceUrl: 'https://smba.trafficmanager.net/amer-client-ss.msg/' }, header, credentials, undefined);
                assert(claims.getClaimValue('tid') == '72f988bf-86f1-41af-91ab-2d7cd011db47');
            });

            it('MsaHeader with invalid ServiceUrl should not be trusted', async () => {
                const credentials = new SimpleCredentialProvider('7f74513e-6f96-4dbc-be9d-9a81fea22b88', '');
                try {
                    await JwtTokenValidation.authenticateRequest({ serviceUrl: 'https://webchat.botframework.com/' }, header, credentials, undefined);
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(!MicrosoftAppCredentials.isTrustedServiceUrl('https://webchat.botframework.com/'));
                }
            });

            it('with AuthenticationDisabled should be anonymous', async () => {
                const claims = await JwtTokenValidation.authenticateRequest({ serviceUrl: 'https://webchat.botframework.com/' }, '', emptyCredentials, undefined);
                assert(claims.isAuthenticated);
                assert.equal(claims.claims.length, 0);
            });

            it('with authentication disabled and serviceUrl should not be trusted', async () => {
                const claims = await JwtTokenValidation.authenticateRequest({ serviceUrl: 'https://webchat.botframework.com/' }, '', emptyCredentials, undefined);
                assert(claims.isAuthenticated);
                assert(!MicrosoftAppCredentials.isTrustedServiceUrl('https://webchat.botframework.com/'));
            });
        });

        describe('EndorsementsValidator', function() {
            it('with null channelId should pass', function(done) {
                var isEndorsed = EndorsementsValidator.validate(null, []);
                assert(isEndorsed);
                done();
            });

            it('with null endorsements should throw', (done) => {
                assert.throws(() => EndorsementsValidator.validate('foo', null));
                done();
            });

            it('with unendorsed channelId should fail', function(done) {
                var isEndorsed = EndorsementsValidator.validate('channelOne', []);
                assert(!isEndorsed);
                done();
            });

            it('with mismatched endorsements should fail', (done) => {
                var isEndorsed = EndorsementsValidator.validate('right', ['wrong']);
                assert(!isEndorsed);
                done();
            });

            it('with endorsed channelId should pass', (done) => {
                var isEndorsed = EndorsementsValidator.validate('right', ['right']);
                assert(isEndorsed);
                done();
            });

            it('with endorsed channelId and many endorsements should pass', (done) => {
                var isEndorsed = EndorsementsValidator.validate('right', ['wrong', 'right']);
                assert(isEndorsed);
                done();
            });

            it('with empty channelId should pass', (done) => {
                var isEndorsed = EndorsementsValidator.validate('', ['wrong', 'right']);
                assert(isEndorsed);
                done();
            });
        });

        describe('ChannelValidator', function() {
            it('validateIdentity should fail if unauthenticated', async () => {
                try {
                    await ChannelValidation.validateIdentity(new ClaimsIdentity([], false), undefined);
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(err.message === 'Unauthorized. Is not authenticated', `unexpected error thrown: "${ err.message }"`);
                    assert.strictEqual(err.statusCode, StatusCodes.UNAUTHORIZED);
                }
            });

            it('validateIdentity should fail if no identity', async () => {
                try {
                    await ChannelValidation.validateIdentity(undefined, undefined);
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(err.message === 'Unauthorized. Is not authenticated', `unexpected error thrown: "${ err.message }"`);
                    assert.strictEqual(err.statusCode, StatusCodes.UNAUTHORIZED);
                }
            });

            it('validateIdentity should fail if no issuer', async () => {
                try {
                    await ChannelValidation.validateIdentity(new ClaimsIdentity([{ type: 'peanut', value: 'peanut' }], true), genericCredentials);
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(err.message === 'Unauthorized. Issuer Claim MUST be present.', `unexpected error thrown: "${ err.message }"`);
                    assert.strictEqual(err.statusCode, StatusCodes.UNAUTHORIZED);
                }
            });

            it('validateIdentity should fail if wrong issuer', async () => {
                try {
                    await ChannelValidation.validateIdentity(new ClaimsIdentity([{ type: 'iss', value: 'peanut' }], true), genericCredentials);
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(err.message === 'Unauthorized. Issuer Claim MUST be present.', `unexpected error thrown: "${ err.message }"`);
                    assert.strictEqual(err.statusCode, StatusCodes.UNAUTHORIZED);
                }
            });

            it('validateIdentity should fail if no audience', async () => {
                try {
                    await ChannelValidation.validateIdentity(new ClaimsIdentity([{ type: 'iss', value: 'https://api.botframework.com' }], true), genericCredentials);
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(err.message === 'Unauthorized. Invalid AppId passed on token: null', `unexpected error thrown: "${ err.message }"`);
                    assert.strictEqual(err.statusCode, StatusCodes.UNAUTHORIZED);
                }
            });

            it('validateIdentity should fail if wrong audience', async () => {
                try {
                    await ChannelValidation.validateIdentity(new ClaimsIdentity([
                        { type: 'iss', value: 'https://api.botframework.com' },
                        { type: 'aud', value: 'peanut' }
                    ], true), genericCredentials);
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(err.message === 'Unauthorized. Invalid AppId passed on token: peanut', `unexpected error thrown: "${ err.message }"`);
                    assert.strictEqual(err.statusCode, StatusCodes.UNAUTHORIZED);
                }
            });

            it('validateIdentity should work', async () => {
                await ChannelValidation.validateIdentity(new ClaimsIdentity([
                    { type: 'iss', value: 'https://api.botframework.com' },
                    { type: 'aud', value: genericCredentials.appId }
                ], true), genericCredentials);
            });
        });

        describe('GovernmentChannelValidator', function() {
            it('validateIdentity should fail if no identity', async () => {
                try {
                    await GovernmentChannelValidation.validateIdentity(new ClaimsIdentity([], false), undefined);
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(err.message === 'Unauthorized. Is not authenticated', `unexpected error thrown: "${ err.message }"`);
                    assert.strictEqual(err.statusCode, StatusCodes.UNAUTHORIZED);
                }
            });

            it('validateIdentity should fail if wrong issuer', async () => {
                try {
                    await GovernmentChannelValidation.validateIdentity(new ClaimsIdentity([{ type: 'iss', value: 'peanut' }], true), genericCredentials);
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(err.message === 'Unauthorized. Issuer Claim MUST be present.', `unexpected error thrown: "${ err.message }"`);
                    assert.strictEqual(err.statusCode, StatusCodes.UNAUTHORIZED);
                }
            });

            it('validateIdentity should fail if no audience', async () => {
                try {
                    await GovernmentChannelValidation.validateIdentity(new ClaimsIdentity([{ type: 'iss', value: 'https://api.botframework.us' }], true), genericCredentials);
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(err.message === 'Unauthorized. Invalid AppId passed on token: null', `unexpected error thrown: "${ err.message }"`);
                    assert.strictEqual(err.statusCode, StatusCodes.UNAUTHORIZED);
                }
            });

            it('validateIdentity should fail if wrong audience', async () => {
                try {
                    await GovernmentChannelValidation.validateIdentity(new ClaimsIdentity([
                        { type: 'iss', value: 'https://api.botframework.us' },
                        { type: 'aud', value: 'peanut' }
                    ], true), genericCredentials);
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(err.message === 'Unauthorized. Invalid AppId passed on token: peanut', `unexpected error thrown: "${ err.message }"`);
                    assert.strictEqual(err.statusCode, StatusCodes.UNAUTHORIZED);
                }
            });

            it('validateIdentity should work', async () => {
                try {
                    await GovernmentChannelValidation.validateIdentity(new ClaimsIdentity([
                        { type: 'iss', value: 'https://api.botframework.us' },
                        { type: 'aud', value: genericCredentials.appId }
                    ], true), genericCredentials);
                } catch (err) {
                    throw err;
                }
            });
        });

        describe('EnterpriseChannelValidator', function() {
            it('validateIdentity should fail if unauthenticated', async () => {
                try {
                    await EnterpriseChannelValidation.validateIdentity(new ClaimsIdentity([], false), undefined);
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(err.message === 'Unauthorized. Is not authenticated', `unexpected error thrown: "${ err.message }"`);
                    assert.strictEqual(err.statusCode, StatusCodes.UNAUTHORIZED);
                }
            });

            it('validateIdentity should fail if no identity', async () => {
                try {
                    await EnterpriseChannelValidation.validateIdentity(undefined, undefined);
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(err.message === 'Unauthorized. No valid identity.', `unexpected error thrown: "${ err.message }"`);
                    assert.strictEqual(err.statusCode, StatusCodes.UNAUTHORIZED);
                }
            });

            it('validateIdentity should fail if wrong issuer', async () => {
                try {
                    await EnterpriseChannelValidation.validateIdentity(new ClaimsIdentity([{ type: 'iss', value: 'peanut' }], true), genericCredentials);
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(err.message === 'Unauthorized. Issuer Claim MUST be present.', `unexpected error thrown: "${ err.message }"`);
                    assert.strictEqual(err.statusCode, StatusCodes.UNAUTHORIZED);
                }
            });

            it('validateIdentity should fail if no audience', async () => {
                try {
                    await EnterpriseChannelValidation.validateIdentity(new ClaimsIdentity([{ type: 'iss', value: 'https://api.botframework.com' }], true), genericCredentials);
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(err.message === 'Unauthorized. Invalid AppId passed on token: null', `unexpected error thrown: "${ err.message }"`);
                    assert.strictEqual(err.statusCode, StatusCodes.UNAUTHORIZED);
                }
            });

            it('validateIdentity should fail if wrong audience', async () => {
                try {
                    await EnterpriseChannelValidation.validateIdentity(new ClaimsIdentity([
                        { type: 'iss', value: 'https://api.botframework.com' },
                        { type: 'aud', value: 'peanut' }
                    ], true), genericCredentials);
                    throw new Error('Expected validation to fail.');
                } catch (err) {
                    assert(err.message === 'Unauthorized. Invalid AppId passed on token: peanut', `unexpected error thrown: "${ err.message }"`);
                    assert.strictEqual(err.statusCode, StatusCodes.UNAUTHORIZED);
                }
            });

            it('validateIdentity should work', async () => {
                try {
                    await EnterpriseChannelValidation.validateIdentity(new ClaimsIdentity([
                        { type: 'iss', value: 'https://api.botframework.com' },
                        { type: 'aud', value: genericCredentials.appId }
                    ], true), genericCredentials);
                } catch (err) {
                    throw err;
                }
            });
        });
    });

    describe('JwtTokenValidation', () => {
        describe('getAppIdFromClaims()', () => {
            it('should get appId from claims', () => {
                const appId = 'uuid.uuid4()';
                const v1Claims = [];
                const v2Claims = [{ type: AuthenticationConstants.VersionClaim, value : '2.0' }];
    
                // Empty array of Claims should yield undefined
                assert.strictEqual(JwtTokenValidation.getAppIdFromClaims(v1Claims), undefined);
        
                // AppId exists, but there is no version (assumes v1)
                v1Claims[0] = { type: AuthenticationConstants.AppIdClaim, value: appId };
                assert.strictEqual(JwtTokenValidation.getAppIdFromClaims(v1Claims), appId);
        
                // AppId exists with v1 version
                v1Claims[1] = { type: AuthenticationConstants.VersionClaim, value: '1.0' };
                assert.strictEqual(JwtTokenValidation.getAppIdFromClaims(v1Claims), appId);
        
                // v2 version should yield undefined with no "azp" claim
                assert.strictEqual(JwtTokenValidation.getAppIdFromClaims(v2Claims), undefined);
        
                // v2 version with azp
                v2Claims[1] = { type: AuthenticationConstants.AuthorizedParty, value: appId };
                assert.strictEqual(JwtTokenValidation.getAppIdFromClaims(v2Claims), appId);
            });
    
            it('should throw an error if claims is falsy', () => {
                try {
                    JwtTokenValidation.getAppIdFromClaims();
                } catch (e) {
                    assert.strictEqual(e.message, 'JwtTokenValidation.getAppIdFromClaims(): missing claims.');
                }
            });
        });

        describe('isValidTokenFormat()', () => {
            it('should return false with a falsy authHeader', () => {
                const isValid = JwtTokenValidation.isValidTokenFormat();
                assert(!isValid);
            });

            it('should return false if authHeader.split(" ").length !== 2', () => {
                let isValid = JwtTokenValidation.isValidTokenFormat('a');
                assert(!isValid);

                isValid = JwtTokenValidation.isValidTokenFormat('a ');
                assert(!isValid);

                isValid = JwtTokenValidation.isValidTokenFormat('a b c');
                assert(!isValid);
            });

            it('should return false if parsed scheme is not "Bearer"', () => {
                const isValid = JwtTokenValidation.isValidTokenFormat('NotBearer Token');
                assert(!isValid);
            });

            it('should return true for a correct Auth Header', () => {
                const isValid = JwtTokenValidation.isValidTokenFormat('Bearer Token');
                assert(isValid);
            });
        });
    });
});
