const assert = require('assert');
const Connector = require('../lib');

describe('Bot Framework Connector - Auth Tests', function () {

    describe('Connector Tokens', function () {
        this.timeout(20000);
        describe('AuthHeader', function () {

            it('with correct ChannelId should validate', function(done) {
                Connector.ChannelValidation.ToBotFromChannelTokenValidationParameters.ignoreExpiration = true;
                var header = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IkdDeEFyWG9OOFNxbzdQd2VBNy16NjVkZW5KUSIsIng1dCI6IkdDeEFyWG9OOFNxbzdQd2VBNy16NjVkZW5KUSJ9.eyJzZXJ2aWNldXJsIjoiaHR0cHM6Ly93ZWJjaGF0LmJvdGZyYW1ld29yay5jb20vIiwiaXNzIjoiaHR0cHM6Ly9hcGkuYm90ZnJhbWV3b3JrLmNvbSIsImF1ZCI6IjM5NjE5YTU5LTVhMGMtNGY5Yi04N2M1LTgxNmM2NDhmZjM1NyIsImV4cCI6MTUxNjczNzUyMCwibmJmIjoxNTE2NzM2OTIwfQ.TBgpxbDS-gx1wm7ldvl7To-igfskccNhp-rU1mxUMtGaDjnsU--usH4OXZfzRsZqMlnXWXug_Hgd_qOr5RH8wVlnXnMWewoZTSGZrfp8GOd7jHF13Gz3F1GCl8akc3jeK0Ppc8R_uInpuUKa0SopY0lwpDclCmvDlz4PN6yahHkt_666k-9UGmRt0DDkxuYjbuYG8EDZxyyAhr7J6sFh3yE2UGRpJjRDB4wXWqv08Cp0Gn9PAW2NxOyN8irFzZH5_YZqE3DXDAYZ_IOLpygXQR0O-bFIhLDVxSz6uCeTBRjh8GU7XJ_yNiRDoaby7Rd2IfRrSnvMkBRsB8MsWN8oXg';
                var credentials = new Connector.SimpleCredentialProvider('39619a59-5a0c-4f9b-87c5-816c648ff357', '');
                Connector.JwtTokenValidation.validateAuthHeader(header, credentials, undefined, 'webchat', 'https://webchat.botframework.com/')
                    .then(claims => {
                        assert(claims.isAuthenticated);
                        assert.notEqual(claims.claims.length, 0);
                        done();
                    })
                    .catch(err => done(err))
                    .then(() => {
                        Connector.ChannelValidation.ToBotFromChannelTokenValidationParameters.ignoreExpiration = false;
                    });
            });
    
            it('with incorrect ChannelId should not validate', function(done) {
                Connector.ChannelValidation.ToBotFromChannelTokenValidationParameters.ignoreExpiration = true;
                var header = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IkdDeEFyWG9OOFNxbzdQd2VBNy16NjVkZW5KUSIsIng1dCI6IkdDeEFyWG9OOFNxbzdQd2VBNy16NjVkZW5KUSJ9.eyJzZXJ2aWNldXJsIjoiaHR0cHM6Ly93ZWJjaGF0LmJvdGZyYW1ld29yay5jb20vIiwiaXNzIjoiaHR0cHM6Ly9hcGkuYm90ZnJhbWV3b3JrLmNvbSIsImF1ZCI6IjM5NjE5YTU5LTVhMGMtNGY5Yi04N2M1LTgxNmM2NDhmZjM1NyIsImV4cCI6MTUxNjczNzUyMCwibmJmIjoxNTE2NzM2OTIwfQ.TBgpxbDS-gx1wm7ldvl7To-igfskccNhp-rU1mxUMtGaDjnsU--usH4OXZfzRsZqMlnXWXug_Hgd_qOr5RH8wVlnXnMWewoZTSGZrfp8GOd7jHF13Gz3F1GCl8akc3jeK0Ppc8R_uInpuUKa0SopY0lwpDclCmvDlz4PN6yahHkt_666k-9UGmRt0DDkxuYjbuYG8EDZxyyAhr7J6sFh3yE2UGRpJjRDB4wXWqv08Cp0Gn9PAW2NxOyN8irFzZH5_YZqE3DXDAYZ_IOLpygXQR0O-bFIhLDVxSz6uCeTBRjh8GU7XJ_yNiRDoaby7Rd2IfRrSnvMkBRsB8MsWN8oXg';
                var credentials = new Connector.SimpleCredentialProvider('39619a59-5a0c-4f9b-87c5-816c648ff357', '');
                Connector.JwtTokenValidation.validateAuthHeader(header, credentials, undefined, 'foo', 'https://webchat.botframework.com/')
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => done())
                    .then(() => {
                        Connector.ChannelValidation.ToBotFromChannelTokenValidationParameters.ignoreExpiration = false;
                    });
            });
    
            it('with correct AppId and ServiceUrl should validate', function(done) {
                var tokenGenerator = new Connector.MicrosoftAppCredentials('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                tokenGenerator.getToken(true).then(token => {
                    var header = `Bearer ${token}`;
                    var credentials = new Connector.SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '');
                    Connector.JwtTokenValidation.validateAuthHeader(header, credentials, undefined, '', 'https://webchat.botframework.com/')
                        .then(claims => {
                            assert(claims.isAuthenticated);
                            assert.notEqual(claims.claims.length, 0);
                            done();
                        })
                        .catch(err => done(err));
                });
            });
    
            it('with BotAppId differs should not validate', function(done) {
                var tokenGenerator = new Connector.MicrosoftAppCredentials('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                tokenGenerator.getToken(true).then(token => {
                    var header = `Bearer ${token}`;
                    var credentials = new Connector.SimpleCredentialProvider('00000000-0000-0000-0000-000000000000', '');
                    Connector.JwtTokenValidation.validateAuthHeader(header, credentials, undefined, '', '')
                        .then(claims => done(new Error('Expected validation to fail.')))
                        .catch(err => {
                            assert(!!err);
                            done();
                        });
                });
            });
    
            it('with noCredentials should not validate', function(done) {
                var tokenGenerator = new Connector.MicrosoftAppCredentials('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                tokenGenerator.getToken(true).then(token => {
                    var header = `Bearer ${token}`;
                    var credentials = new Connector.SimpleCredentialProvider('', '');
                    Connector.JwtTokenValidation.validateAuthHeader(header, credentials, undefined, '', '')
                        .then(claims => done(new Error('Expected validation to fail.')))
                        .catch(err => {
                            assert(!!err);
                            done();
                        });
                });
            });
        });

        describe('EmptyHeader', function () {

            it('Bot with noCredentials should throw', function(done) {
                var credentials = new Connector.SimpleCredentialProvider('', '');
                Connector.JwtTokenValidation.validateAuthHeader('', credentials, undefined, '', '')
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });
        });

        describe('Emulator', function () {

            it('MsaHeader correct AppId and ServiceUrl should validate', function(done) {
                var tokenGenerator = new Connector.MicrosoftAppCredentials('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                tokenGenerator.getToken(true).then(token => {
                    var header = `Bearer ${token}`;
                    var credentials = new Connector.SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '');
                    Connector.JwtTokenValidation.validateAuthHeader(header, credentials, undefined, '', '')
                        .then(claims => {
                            assert(claims.isAuthenticated);
                            done();
                        })
                        .catch(err => done(err));
                });
            });
    
            it('MsaHeader Bot AppId differs should not validate', function(done) {
                var tokenGenerator = new Connector.MicrosoftAppCredentials('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                tokenGenerator.getToken(true).then(token => {
                    var header = `Bearer ${token}`;
                    var credentials = new Connector.SimpleCredentialProvider('00000000-0000-0000-0000-000000000000', '');
                    Connector.JwtTokenValidation.validateAuthHeader(header, credentials, undefined, '', '')
                        .then(claims => done(new Error('Expected validation to fail.')))
                        .catch(err => {
                            assert(!!err);
                            done();
                        });
                });
            });
        });

        describe('Channel', function () {

            it('MsaHeader with valid ServiceUrl should be trusted', function(done) {
                var tokenGenerator = new Connector.MicrosoftAppCredentials('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                tokenGenerator.getToken(true).then(token => {
                    var header = `Bearer ${token}`;
                    var credentials = new Connector.SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '');
                    Connector.JwtTokenValidation.authenticateRequest({ serviceUrl: 'https://smba.trafficmanager.net/amer-client-ss.msg/' }, header, credentials, undefined)
                        .then(claims => {
                            assert(Connector.MicrosoftAppCredentials.isTrustedServiceUrl('https://smba.trafficmanager.net/amer-client-ss.msg/'))
                            done();
                        })
                        .catch(err => done(err));
                });
            });
    
            it('MsaHeader with invalid ServiceUrl should not be trusted', function(done) {
                var tokenGenerator = new Connector.MicrosoftAppCredentials('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                tokenGenerator.getToken(true).then(token => {
                    var header = `Bearer ${token}`;
                    var credentials = new Connector.SimpleCredentialProvider('7f74513e-6f96-4dbc-be9d-9a81fea22b88', '');
                    Connector.JwtTokenValidation.authenticateRequest({ serviceUrl: 'https://webchat.botframework.com/' }, header, credentials, undefined)
                        .then(claims => done(new Error('Expected validation to fail.')))
                        .catch(err => {
                            assert(!Connector.MicrosoftAppCredentials.isTrustedServiceUrl('https://webchat.botframework.com/'))
                            done();
                        });
                });
            });
    
            it('with AuthenticationDisabled should be anonymous', function(done) {
                var credentials = new Connector.SimpleCredentialProvider('', '');
                Connector.JwtTokenValidation.authenticateRequest({ serviceUrl: 'https://webchat.botframework.com/' }, '', credentials, undefined)
                    .then(claims => {
                        assert(claims.isAuthenticated);
                        assert.equal(claims.claims.length, 0);
                        done();
                    })
                    .catch(err => done(err));
            });
    
            it('with authentication disabled and serviceUrl should not be trusted', function(done) {
                var credentials = new Connector.SimpleCredentialProvider('', '');
                Connector.JwtTokenValidation.authenticateRequest({ serviceUrl: 'https://webchat.botframework.com/' }, '', credentials, undefined)
                    .then(claims => {
                        assert(claims.isAuthenticated);
                        assert(!Connector.MicrosoftAppCredentials.isTrustedServiceUrl('https://webchat.botframework.com/'));
                        done();
                    })
                    .catch(err => done(err));
            });
        });

        describe('EndorsementsValidator', function () {
            it('with null channelId should pass', function(done) {
                var isEndorsed = Connector.EndorsementsValidator.validate(null, []);
                assert(isEndorsed);
                done();
            });
            
            it('with null endorsements should throw', function(done) {
                assert.throws(() => Connector.EndorsementsValidator.validate('foo', null));
                done();
            });
            
            it('with unendorsed channelId should fail', function(done) {
                var isEndorsed = Connector.EndorsementsValidator.validate('channelOne', []);
                assert(!isEndorsed);
                done();
            });
            
            it('with mismatched endorsements should fail', function(done) {
                var isEndorsed = Connector.EndorsementsValidator.validate('right', ['wrong']);
                assert(!isEndorsed);
                done();
            });
            
            it('with endorsed channelId should pass', function(done) {
                var isEndorsed = Connector.EndorsementsValidator.validate('right', ['right']);
                assert(isEndorsed);
                done();
            });
            
            it('with endorsed channelId and many endorsements should pass', function(done) {
                var isEndorsed = Connector.EndorsementsValidator.validate('right', ['wrong', 'right']);
                assert(isEndorsed);
                done();
            });
            
            it('with empty channelId should pass', function(done) {
                var isEndorsed = Connector.EndorsementsValidator.validate('', ['wrong', 'right']);
                assert(isEndorsed);
                done();
            });
        });

        describe('ChannelValidator', function () {
            it('validateIdentity should fail if unauthenticated', function(done) {
                Connector.ChannelValidation.validateIdentity(new Connector.ClaimsIdentity([], false), undefined)
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });

            it('validateIdentity should fail if no identity', function(done) {
                Connector.ChannelValidation.validateIdentity(undefined, undefined)
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });
            
            it('validateIdentity should fail if no issuer', function(done) {
                var credentials = new Connector.SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                Connector.ChannelValidation.validateIdentity(new Connector.ClaimsIdentity([{type: 'peanut', value: 'peanut'}], true), credentials)
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });

            it('validateIdentity should fail if wrong issuer', function(done) {
                var credentials = new Connector.SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                Connector.ChannelValidation.validateIdentity(new Connector.ClaimsIdentity([{type: 'iss', value: 'peanut'}], true), credentials)
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });

            it('validateIdentity should fail if no audience', function(done) {
                var credentials = new Connector.SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                Connector.ChannelValidation.validateIdentity(new Connector.ClaimsIdentity([{type: 'iss', value: 'https://api.botframework.com'}], true), credentials)
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });
            
            it('validateIdentity should fail if wrong audience', function(done) {
                var credentials = new Connector.SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                Connector.ChannelValidation.validateIdentity(new Connector.ClaimsIdentity([
                    {type: 'iss', value: 'https://api.botframework.com'},
                    {type: 'aud', value: 'peanut'}
                ], true), credentials)
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });

            it('validateIdentity should work', function(done) {
                var credentials = new Connector.SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                Connector.ChannelValidation.validateIdentity(new Connector.ClaimsIdentity([
                    {type: 'iss', value: 'https://api.botframework.com'},
                    {type: 'aud', value: credentials.appId}
                ], true), credentials)
                    .then(identity => done())
                    .catch(err => {
                        done(new Error('Should have validated successfully'));
                    });
            });
        });

        describe('GovernmentChannelValidator', function () {
            it('validateIdentity should fail if unauthenticated', function(done) {
                Connector.GovernmentChannelValidation.validateIdentity(new Connector.ClaimsIdentity([], false), undefined)
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });

            it('validateIdentity should fail if no identity', function(done) {
                Connector.GovernmentChannelValidation.validateIdentity(undefined, undefined)
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });
            
            it('validateIdentity should fail if no issuer', function(done) {
                var credentials = new Connector.SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                Connector.GovernmentChannelValidation.validateIdentity(new Connector.ClaimsIdentity([{type: 'peanut', value: 'peanut'}], true), credentials)
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });

            it('validateIdentity should fail if wrong issuer', function(done) {
                var credentials = new Connector.SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                Connector.GovernmentChannelValidation.validateIdentity(new Connector.ClaimsIdentity([{type: 'iss', value: 'peanut'}], true), credentials)
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });

            it('validateIdentity should fail if no audience', function(done) {
                var credentials = new Connector.SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                Connector.GovernmentChannelValidation.validateIdentity(new Connector.ClaimsIdentity([{type: 'iss', value: 'https://api.botframework.us'}], true), credentials)
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });
            
            it('validateIdentity should fail if wrong audience', function(done) {
                var credentials = new Connector.SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                Connector.GovernmentChannelValidation.validateIdentity(new Connector.ClaimsIdentity([
                    {type: 'iss', value: 'https://api.botframework.us'},
                    {type: 'aud', value: 'peanut'}
                ], true), credentials)
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });

            it('validateIdentity should work', function(done) {
                var credentials = new Connector.SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                Connector.GovernmentChannelValidation.validateIdentity(new Connector.ClaimsIdentity([
                    {type: 'iss', value: 'https://api.botframework.us'},
                    {type: 'aud', value: credentials.appId}
                ], true), credentials)
                    .then(identity => done())
                    .catch(err => {
                        done(new Error('Should have validated successfully'));
                    });
            });
        });

        describe('EnterpriseChannelValidator', function () {
            it('validateIdentity should fail if unauthenticated', function(done) {
                Connector.EnterpriseChannelValidation.validateIdentity(new Connector.ClaimsIdentity([], false), undefined)
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });

            it('validateIdentity should fail if no identity', function(done) {
                Connector.EnterpriseChannelValidation.validateIdentity(undefined, undefined)
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });
            
            it('validateIdentity should fail if no issuer', function(done) {
                var credentials = new Connector.SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                Connector.EnterpriseChannelValidation.validateIdentity(new Connector.ClaimsIdentity([{type: 'peanut', value: 'peanut'}], true), credentials)
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });

            it('validateIdentity should fail if wrong issuer', function(done) {
                var credentials = new Connector.SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                Connector.EnterpriseChannelValidation.validateIdentity(new Connector.ClaimsIdentity([{type: 'iss', value: 'peanut'}], true), credentials)
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });

            it('validateIdentity should fail if no audience', function(done) {
                var credentials = new Connector.SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                Connector.EnterpriseChannelValidation.validateIdentity(new Connector.ClaimsIdentity([{type: 'iss', value: 'https://api.botframework.com'}], true), credentials)
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });
            
            it('validateIdentity should fail if wrong audience', function(done) {
                var credentials = new Connector.SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                Connector.EnterpriseChannelValidation.validateIdentity(new Connector.ClaimsIdentity([
                    {type: 'iss', value: 'https://api.botframework.com'},
                    {type: 'aud', value: 'peanut'}
                ], true), credentials)
                    .then(claims => done(new Error('Expected validation to fail.')))
                    .catch(err => {
                        assert(!!err);
                        done();
                    });
            });

            it('validateIdentity should work', function(done) {
                var credentials = new Connector.SimpleCredentialProvider('2cd87869-38a0-4182-9251-d056e8f0ac24', '2.30Vs3VQLKt974F');
                Connector.EnterpriseChannelValidation.validateIdentity(new Connector.ClaimsIdentity([
                    {type: 'iss', value: 'https://api.botframework.com'},
                    {type: 'aud', value: credentials.appId}
                ], true), credentials)
                    .then(identity => done())
                    .catch(err => {
                        done(new Error('Should have validated successfully'));
                    });
            });
        });
    });
});