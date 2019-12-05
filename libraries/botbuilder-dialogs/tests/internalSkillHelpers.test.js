const assert = require('assert');
const { AuthConstants, isSkillClaim, getAppIdFromClaims } = require('../lib/prompts/skillsHelpers');

describe('Internal Skills-related methods', function() {
    this.timeout(5000);
    describe('isSkillClaim()', () => {
        it('should return false for invalid claims and true for valid claims', () => {
            const claims = {};
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
            claims[AuthConstants.VersionClaim] = '1.0';
            assert(!isSkillClaim(claims));
    
            // Emulator Audience claim
            claims[AuthConstants.AudienceClaim] = AuthConstants.ToBotFromChannelTokenIssuer;
            assert(!isSkillClaim(claims));
    
            // No AppId claim
            claims[AuthConstants.AudienceClaim] = audience;
            assert(!isSkillClaim(claims));
    
            // AppId != Audience
            claims[AuthConstants.AppIdClaim] = audience;
            assert(!isSkillClaim(claims));
    
            // All checks pass, should be good now
            claims[AuthConstants.AudienceClaim] = appId;            
            assert(isSkillClaim(claims));
        });
    });

    describe('getAppIdFromClaims()', () => {
        it('should get appId from claims', () => {
            const appId = 'uuid.uuid4()';
            const v1Claims = {};
            const v2Claims = { [AuthConstants.VersionClaim]: '2.0' };

            // Empty array of Claims should yield undefined
            assert.strictEqual(getAppIdFromClaims(v1Claims), undefined);
    
            // AppId exists, but there is no version (assumes v1)
            v1Claims[AuthConstants.AppIdClaim] = appId;
            assert.strictEqual(getAppIdFromClaims(v1Claims), appId);
    
            // AppId exists with v1 version
            v1Claims[AuthConstants.VersionClaim] = '1.0';
            assert.strictEqual(getAppIdFromClaims(v1Claims), appId);
    
            // v2 version should yield undefined with no "azp" claim
            v2Claims[AuthConstants.VersionClaim] = '2.0';
            assert.strictEqual(getAppIdFromClaims(v2Claims), undefined);
    
            // v2 version with azp
            v2Claims[AuthConstants.AuthorizedParty] = appId;
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
