class UserSubscriptionCreateObject {

    /**
     * @property {string} subscriptionName
     */

    /**
     * @property {string} subscriptionKey
     */


    constructor({subscriptionName /* string */, subscriptionKey /* string */} = {}) {
        Object.assign(this, {subscriptionName /* string */, subscriptionKey /* string */});
    }
}

UserSubscriptionCreateObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(UserSubscriptionCreateObject.fromJSON);
    }

    const {subscriptionName /* string */, subscriptionKey /* string */} = source;
    return new UserSubscriptionCreateObject({subscriptionName /* string */, subscriptionKey /* string */});
};

module.exports = UserSubscriptionCreateObject;
