const assert = require('assert');
const { AuthenticationConstants, SkillValidation } = require('../lib');

describe('SkillValidation', function() {
    this.timeout(5000);

    describe('isSkillClaim()', () => {
        it('should return false for invalid claims and true for valid claims', () => {
            const claims = {};
            const audience = uuid();
            const appId = uuid();
    
            // Empty list of claims
            assert(!SkillValidation.isSkillClaim(claims));
    
            // No Audience claim
            claims[AuthenticationConstants.VersionClaim] = '1.0';
            assert(!SkillValidation.isSkillClaim(claims));
    
            // Emulator Audience claim
            claims[AuthenticationConstants.AudienceClaim] = AuthenticationConstants.ToBotFromChannelTokenIssuer;
            assert(!SkillValidation.isSkillClaim(claims));
    
            // No AppId claim
            claims[AuthenticationConstants.AudienceClaim] = audience;
            assert(!SkillValidation.isSkillClaim(claims));
    
            // AppId != Audience
            claims[AuthenticationConstants.AppIdClaim] = audience;
            assert(!SkillValidation.isSkillClaim(claims));
    
            // All checks pass, should be good now
            claims[AuthenticationConstants.AudienceClaim] = appId;            
            assert(SkillValidation.isSkillClaim(claims));
        });
    });
});

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
