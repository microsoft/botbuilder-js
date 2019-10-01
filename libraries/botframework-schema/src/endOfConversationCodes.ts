/**
 * Defines values for EndOfConversationCodes.
 * Possible values include: 'unknown', 'completedSuccessfully', 'userCancelled', 'botTimedOut',
 * 'botIssuedInvalidMessage', 'channelFailed'
 * @readonly
 * @enum {string}
 */
export enum EndOfConversationCodes {
    Unknown = 'unknown',
    CompletedSuccessfully = 'completedSuccessfully',
    UserCancelled = 'userCancelled',
    BotTimedOut = 'botTimedOut',
    BotIssuedInvalidMessage = 'botIssuedInvalidMessage',
    ChannelFailed = 'channelFailed',
}