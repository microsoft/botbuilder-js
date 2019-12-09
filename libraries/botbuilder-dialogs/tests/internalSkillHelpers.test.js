const assert = require('assert');
const { AuthConstants, getAppIdFromClaims, GovConstants, isSkillClaim } = require('../lib/prompts/skillsHelpers');

describe('Internal Skills-related methods', function() {
    this.timeout(5000);
    describe('isSkillClaim()', () => {
        it('should return false for invalid claims and true for valid claims', () => {
            const versionClaim = {};
            const audClaim = {};
            const appIdClaim = {};
            const claims = [versionClaim, audClaim, appIdClaim];
            const audience = uuid();
            const appId = uuid();

            // No claims (falsey value)
            try {
                assert(!isSkillClaim());
                throw new Error('isSkillClaim() should have failed with undefined parameter');
            } catch (e) {
                assert.strictEqual(e.message, 'isSkillClaim(): missing claims.');
            }
    
            // Empty list of claims
            assert(!isSkillClaim(claims));
    
            // No Audience claim
            versionClaim.type = AuthConstants.VersionClaim;
            versionClaim.value = '1.0';
            assert(!isSkillClaim(claims));
    
            // Emulator Audience claim
            audClaim.type = AuthConstants.AudienceClaim;
            audClaim.value = AuthConstants.ToBotFromChannelTokenIssuer;
            assert(!isSkillClaim(claims));
    
            // Government Audience claim
            audClaim.value = GovConstants.ToBotFromChannelTokenIssuer;
            assert(!isSkillClaim(claims));

            // No AppId claim
            audClaim.value = audience;
            assert(!isSkillClaim(claims));
    
            // If not AppId != Audience, should return false
            appIdClaim.type = AuthConstants.AppIdClaim;
            appIdClaim.value = audience;
            assert(!isSkillClaim(claims));
    
            // All checks pass, should be good now
            audClaim.value = appId;
            assert(isSkillClaim(claims));
        });
    });

    describe('getAppIdFromClaims()', () => {
        it('should get appId from claims', () => {
            const appId = 'uuid.uuid4()';
            const v1Claims = [];
            const v2Claims = [{ type: AuthConstants.VersionClaim, value : '2.0' }];

            // Empty array of Claims should yield undefined
            assert.strictEqual(getAppIdFromClaims(v1Claims), undefined);
    
            // AppId exists, but there is no version (assumes v1)
            v1Claims[0] = { type: AuthConstants.AppIdClaim, value: appId };
            assert.strictEqual(getAppIdFromClaims(v1Claims), appId);
    
            // AppId exists with v1 version
            v1Claims[1] = { type: AuthConstants.VersionClaim, value: '1.0' };
            assert.strictEqual(getAppIdFromClaims(v1Claims), appId);
    
            // v2 version should yield undefined with no "azp" claim
            assert.strictEqual(getAppIdFromClaims(v2Claims), undefined);
    
            // v2 version with azp
            v2Claims[1] = { type: AuthConstants.AuthorizedParty, value: appId };
            assert.strictEqual(getAppIdFromClaims(v2Claims), appId);
        });

        it('should throw an error if claims is falsey', () => {
            try {
                getAppIdFromClaims();
            } catch (e) {
                assert.strictEqual(e.message, 'getAppIdFromClaims(): missing claims.');
            }
        });
    });

    describe('AuthConstants', () => {
        it('should have correct values', () => {
            // For reference see botframework-connector's AuthenticationConstants
            assert.strictEqual(AuthConstants.AppIdClaim, 'appid');
            assert.strictEqual(AuthConstants.AudienceClaim, 'aud');
            assert.strictEqual(AuthConstants.AuthorizedParty, 'azp');
            assert.strictEqual(AuthConstants.ToBotFromChannelTokenIssuer, 'https://api.botframework.com');
            assert.strictEqual(AuthConstants.VersionClaim, 'ver');
        });
    });
});

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
