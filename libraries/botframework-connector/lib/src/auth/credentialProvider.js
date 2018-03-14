null >
    /**
     * Checks if bot authentication is disabled.
     * Return true if bot authentication is disabled.
     *
     * This method is async to enable custom implementations
     * that may need to call out to serviced to validate the appId / password pair.
     * @returns {Promise<boolean>} true if bot authentication is disabled.
     */
    isAuthenticationDisabled();
Promise();
var SimpleCredentialProvider = (function () {
    function SimpleCredentialProvider(appId, appPassword) {
        this.readonly = appId;
        this.readonly = appPassword;
        this.appId = appId;
        this.appPassword = appPassword;
    }
    /**
     * Validate AppId.
     *
     * This method is async to enable custom implementations
     * that may need to call out to serviced to validate the appId / password pair.
     * @param  {string} appId bot appid
     * @returns {Promise<boolean>} true if it is a valid AppId
     */
    SimpleCredentialProvider.prototype.isValidAppId = function (appId) {
        return Promise.resolve(this.appId === appId);
    };
    /**
     * Get the app password for a given bot appId, if it is not a valid appId, return Null
     *
     * This method is async to enable custom implementations
     * that may need to call out to serviced to validate the appId / password pair.
     * @param  {string} appId bot appid
     * @returns {Promise<string|null>} password or null for invalid appid
     */
    SimpleCredentialProvider.prototype.getAppPassword = ;
    return SimpleCredentialProvider;
})();
exports.SimpleCredentialProvider = SimpleCredentialProvider;
null > {
    return: Promise.resolve((this.appId === appId) ? this.appPassword : null)
};
/**
 * Checks if bot authentication is disabled.
 * Return true if bot authentication is disabled.
 *
 * This method is async to enable custom implementations
 * that may need to call out to serviced to validate the appId / password pair.
 * @returns {Promise<boolean>} true if bot authentication is disabled.
 */
isAuthenticationDisabled();
Promise < boolean > {
    return: Promise.resolve(!this.appId)
};
//# sourceMappingURL=credentialProvider.js.map