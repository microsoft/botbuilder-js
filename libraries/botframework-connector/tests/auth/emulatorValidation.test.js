const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { EmulatorValidation, AuthenticationConstants } = require('../..');
const { strictEqual } = require('assert');

function generateMockBearerToken(issuer) {
    const secretKey = 'ThisIsASuperMockSecretKey123456789';
    const tenantId = uuidv4();
    const completeIssuer = issuer ? issuer.replace('{0}', tenantId) : null;

    const payload = {
        name: 'John Doe',
        role: 'Admin',
        tid: tenantId,
        iss: completeIssuer,
        aud: 'https://api.example.com',
    };

    const options = {
        expiresIn: '1h',
    };

    return `Bearer ${jwt.sign(payload, secretKey, options)}`;
}

describe('EmulatorValidation', function () {
    it('should return false on token BadFormat', function () {
        // Token with bad format is not processed
        let authHeader = '';
        strictEqual(EmulatorValidation.isTokenFromEmulator(authHeader), false);

        // If the token doesn't contain an issuer value, it returns false
        authHeader = generateMockBearerToken(null);
        strictEqual(EmulatorValidation.isTokenFromEmulator(authHeader), false);
    });

    it('should return false on invalid token issuer', function () {
        const authHeader = generateMockBearerToken('https://mockIssuer.com');
        strictEqual(EmulatorValidation.isTokenFromEmulator(authHeader), false);
    });

    it('should return true on valid token issuer', function () {
        // Validate issuer with V1 Token
        let authHeader = generateMockBearerToken(`${AuthenticationConstants.ValidTokenIssuerUrlTemplateV1}{0}/`);
        strictEqual(EmulatorValidation.isTokenFromEmulator(authHeader), true);

        // Validate issuer with V2 Token
        authHeader = generateMockBearerToken(`${AuthenticationConstants.ValidTokenIssuerUrlTemplateV2}{0}/v2.0`);
        strictEqual(EmulatorValidation.isTokenFromEmulator(authHeader), true);

        // Validate Government issuer with V1 Token
        authHeader = generateMockBearerToken(`${AuthenticationConstants.ValidGovernmentTokenIssuerUrlTemplateV1}{0}/`);
        strictEqual(EmulatorValidation.isTokenFromEmulator(authHeader), true);

        // Validate Government issuer with V2 Token
        authHeader = generateMockBearerToken(
            `${AuthenticationConstants.ValidGovernmentTokenIssuerUrlTemplateV2}{0}/v2.0`,
        );
        strictEqual(EmulatorValidation.isTokenFromEmulator(authHeader), true);
    });
});
