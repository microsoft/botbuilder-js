/**
 * This file directly tests the abstract class AppCredentials and its subclasses:
 * CertificateAppCredentials & MicrosoftAppCredentials
 */

const { AuthenticationConstants, CertificateAppCredentials, MicrosoftAppCredentials } = require('../');
const { ok: assert, strictEqual } = require('assert');
const { createWebResource } = require('botbuilder-stdlib/lib/azureCoreHttpCompat');

const APP_ID = '2cd87869-38a0-4182-9251-d056e8f0ac24';
const APP_PASSWORD = 'password';
const CERT_KEY = 'key';
const CERT_THUMBPRINT = 'thumbprint';
const TENANT = 'tenantId';

describe('AppCredentials', function () {
    it('should have oAuthScope, oAuthEndpoint already configured on construction', async function () {
        // AppCredentials is an Abstract class, so we are testing its subclasses:
        // CertificateAppCredentials and MicrosoftAppCredentials.
        const certCreds = new CertificateAppCredentials(APP_ID, CERT_THUMBPRINT, CERT_KEY);
        strictEqual(
            certCreds.oAuthEndpoint,
            AuthenticationConstants.ToChannelFromBotLoginUrlPrefix + AuthenticationConstants.DefaultChannelAuthTenant,
        );
        strictEqual(certCreds.oAuthScope, AuthenticationConstants.ToBotFromChannelTokenIssuer);

        const msAppCreds = new MicrosoftAppCredentials(APP_ID, APP_PASSWORD, TENANT);
        strictEqual(msAppCreds.oAuthEndpoint, AuthenticationConstants.ToChannelFromBotLoginUrlPrefix + TENANT);
        strictEqual(msAppCreds.oAuthScope, AuthenticationConstants.ToBotFromChannelTokenIssuer);
    });

    it('should have set subclass specific properties with constructor parameters', async function () {
        const certCreds = new CertificateAppCredentials(APP_ID, CERT_THUMBPRINT, CERT_KEY);
        strictEqual(certCreds.appId, APP_ID);
        strictEqual(certCreds.certificateThumbprint, CERT_THUMBPRINT);
        strictEqual(certCreds.certificatePrivateKey, CERT_KEY);

        const msAppCreds = new MicrosoftAppCredentials(APP_ID, APP_PASSWORD);
        strictEqual(msAppCreds.appId, APP_ID);
        strictEqual(msAppCreds.appPassword, APP_PASSWORD);
    });

    describe('signRequest', function () {
        it('should not sign request when appId is falsy', async function () {
            const creds = new MicrosoftAppCredentials('');
            const webRequest = await creds.signRequest(createWebResource());
            assert(!webRequest.headers.Authorization);
        });

        it('should not sign request when appId is anonymous skill appId', async function () {
            const creds = new MicrosoftAppCredentials(AuthenticationConstants.AnonymousSkillAppId);
            const webRequest = await creds.signRequest(createWebResource());
            assert(!webRequest.headers.Authorization);
        });
    });

    describe('MicrosoftAppCredentials', function () {
        it('should set oAuthScope when passed in the constructor', function () {
            const oAuthScope = 'oAuthScope';
            const tokenGenerator = new MicrosoftAppCredentials(APP_ID, undefined, undefined, oAuthScope);
            strictEqual(tokenGenerator.oAuthScope, oAuthScope);
        });

        it('should set update the tokenCacheKey when oAuthScope is set after construction', function () {
            const tokenGenerator = new MicrosoftAppCredentials(APP_ID);
            strictEqual(
                tokenGenerator.tokenCacheKey,
                `${APP_ID}${AuthenticationConstants.ToBotFromChannelTokenIssuer}-cache`,
            );

            const oAuthScope = 'oAuthScope';
            tokenGenerator.oAuthScope = oAuthScope;
            strictEqual(tokenGenerator.tokenCacheKey, `${APP_ID}${oAuthScope}-cache`);

            /* CertificateAppCredentials */
            const certCreds = new CertificateAppCredentials(APP_ID, CERT_THUMBPRINT, CERT_KEY);
            strictEqual(
                certCreds.tokenCacheKey,
                `${APP_ID}${AuthenticationConstants.ToBotFromChannelTokenIssuer}-cache`,
            );
            certCreds.oAuthScope = oAuthScope;
            strictEqual(certCreds.tokenCacheKey, `${APP_ID}${oAuthScope}-cache`);
        });

        it('should fail to get a token with an appId and no appPassword', async function () {
            const tokenGenerator = new MicrosoftAppCredentials(APP_ID);
            await assert.rejects(tokenGenerator.getToken(true), { errorCode: 'invalid_client_credential' });
        });
    });
});
