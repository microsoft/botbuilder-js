export declare class EndorsementsValidator {
    /**
     * Verify that the set of ChannelIds, which come from the incoming activities,
     * all match the endorsements found on the JWT Token.
     * For example, if an Activity comes from webchat, that channelId says
     * says "webchat" and the jwt token endorsement MUST match that.
     * @param channelId The channel name, typically extracted from the activity.ChannelId field, that to which the Activity is affinitized.
     * @param endorsements Whoever signed the JWT token is permitted to send activities only for
     * some specific channels. That list is the endorsement list, and is validated here against the channelId.
     * @returns {boolean} True is the channelId is found in the Endorsement set. False if the channelId is not found.
     */
    static validate(channelId: string, endorsements: Array<string>): boolean;
}
