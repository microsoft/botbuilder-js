/**
 * This file directly tests the abstract class AppCredentials and its subclasses:
 * CertificateAppCredentials & MicrosoftAppCredentials
 */

const { strictEqual } = require('assert');
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
        strictEqual(certCreds.certificatekey, CERT_KEY);

        const msAppCreds = new MicrosoftAppCredentials(APP_ID, APP_PASSWORD);
        strictEqual(msAppCreds.appId, '2cd87869-38a0-4182-9251-d056e8f0ac24');
        strictEqual(msAppCreds.appPassword, APP_PASSWORD);
    });
});
