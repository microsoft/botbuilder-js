/**
 * This file directly tests the abstract class AppCredentials and its subclasses:
 * CertificateAppCredentials & MicrosoftAppCredentials
 */

const { fail, strictEqual } = require('assert');
const { AuthenticationConstants, CertificateAppCredentials, MicrosoftAppCredentials } = require('../lib');

const APP_ID = '2cd87869-38a0-4182-9251-d056e8f0ac24';
const APP_PASSWORD = 'password';
const CERT_KEY = 'key';
const CERT_THUMBPRINT = 'thumbprint';
const TENANT = 'tenantId';

describe('AppCredentials', () => {
    it('should have oAuthScope, oAuthEndpoint already configured on construction', async () => {
        // AppCredentials is an Abstract class, so we are testing its subclasses:
        // CertificateAppCredentials and MicrosoftAppCredentials.
        const certCreds = new CertificateAppCredentials(APP_ID, CERT_THUMBPRINT, CERT_KEY);
        strictEqual(certCreds.oAuthEndpoint, AuthenticationConstants.ToChannelFromBotLoginUrlPrefix + AuthenticationConstants.DefaultChannelAuthTenant);
        strictEqual(certCreds.oAuthScope, AuthenticationConstants.ToBotFromChannelTokenIssuer);

        const msAppCreds = new MicrosoftAppCredentials(APP_ID, APP_PASSWORD, TENANT);
        strictEqual(msAppCreds.oAuthEndpoint, AuthenticationConstants.ToChannelFromBotLoginUrlPrefix + TENANT);
        strictEqual(msAppCreds.oAuthScope, AuthenticationConstants.ToBotFromChannelTokenIssuer);
    });

    it('should have set subclass specific properties with constructor parameters', async () => {
        const certCreds = new CertificateAppCredentials(APP_ID, CERT_THUMBPRINT, CERT_KEY);
        strictEqual(certCreds.appId, APP_ID);
        strictEqual(certCreds.certificateThumbprint, CERT_THUMBPRINT);
        strictEqual(certCreds.certificatePrivateKey, CERT_KEY);

        const msAppCreds = new MicrosoftAppCredentials(APP_ID, APP_PASSWORD);
        strictEqual(msAppCreds.appId, APP_ID);
        strictEqual(msAppCreds.appPassword, APP_PASSWORD);
    });

    describe('MicrosoftAppCredentials', () => {
        it('should set oAuthScope when passed in the constructor', () => {
            const oAuthScope = 'oAuthScope';
            const tokenGenerator = new MicrosoftAppCredentials(APP_ID, undefined, undefined, oAuthScope);
            strictEqual(tokenGenerator.oAuthScope, oAuthScope);
        });

        it('should set update the tokenCacheKey when oAuthScope is set after construction', () => {
            const tokenGenerator = new MicrosoftAppCredentials(APP_ID);
            strictEqual(tokenGenerator.tokenCacheKey, `${APP_ID}${AuthenticationConstants.ToBotFromChannelTokenIssuer}-cache`);
    
            const oAuthScope = 'oAuthScope';
            tokenGenerator.oAuthScope = oAuthScope;
            strictEqual(tokenGenerator.tokenCacheKey, `${APP_ID}${oAuthScope}-cache`);

            /* CertificateAppCredentials */
            const certCreds = new CertificateAppCredentials(APP_ID, CERT_THUMBPRINT, CERT_KEY);
            strictEqual(certCreds.tokenCacheKey, `${APP_ID}${AuthenticationConstants.ToBotFromChannelTokenIssuer}-cache`);
            certCreds.oAuthScope = oAuthScope;
            strictEqual(certCreds.tokenCacheKey, `${APP_ID}${oAuthScope}-cache`);
        });

        it('should fail to get a token with an appId and no appPassword', async () => {
            const tokenGenerator = new MicrosoftAppCredentials(APP_ID);
            try {
                await tokenGenerator.getToken(true);
                fail('Should not have successfully retrieved token.');
            } catch (e) {
                // e.message evaluation per adal-node@0.2.1:
                // https://github.com/AzureAD/azure-activedirectory-library-for-nodejs/blob/eeff5215bd7a6629edbd1d71450a0db68f029838/lib/authentication-context.js#L277
                strictEqual(e.message, 'The clientSecret parameter is required.');
            }
        });
    });
});
