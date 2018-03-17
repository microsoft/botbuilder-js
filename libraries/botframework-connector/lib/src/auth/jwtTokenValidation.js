var emulatorValidation_1 = require('./emulatorValidation');
var channelValidation_1 = require('./channelValidation');
var microsoftAppCredentials_1 = require('./microsoftAppCredentials');
var JwtTokenValidation;
(function (JwtTokenValidation) {
    async;
    function assertValidActivity(activity, authHeader, credentials) {
        if (!authHeader) {
            // No auth header was sent. We might be on the anonymous code path.
            var isAuthDisabled = await, credentials_1, isAuthenticationDisabled = ();
            if (isAuthDisabled) {
                // We are on the anonymous code path.
                return;
            }
            // No Auth Header. Auth is required. Request is not authorized.
            throw new Error('Unauthorized Access. Request is not authorized');
        }
        var usingEmulator = emulatorValidation_1.EmulatorValidation.isTokenFromEmulator(authHeader);
        if (usingEmulator) {
            await;
            emulatorValidation_1.EmulatorValidation.authenticateEmulatorToken(authHeader, credentials);
        }
        else {
            await;
            channelValidation_1.ChannelValidation.authenticateChannelTokenWithServiceUrl(authHeader, credentials, activity.serviceUrl);
        }
        // On the standard Auth path, we need to trust the URL that was incoming.
        microsoftAppCredentials_1.MicrosoftAppCredentials.trustServiceUrl(activity.serviceUrl);
    }
})(JwtTokenValidation = exports.JwtTokenValidation || (exports.JwtTokenValidation = {}));
//# sourceMappingURL=jwtTokenValidation.js.map