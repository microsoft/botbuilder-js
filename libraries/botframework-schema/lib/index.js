"use strict";
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Defines values for RoleTypes.
 * Possible values include: 'user', 'bot'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: RoleTypes = <RoleTypes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var RoleTypes;
(function (RoleTypes) {
    RoleTypes["User"] = "user";
    RoleTypes["Bot"] = "bot";
})(RoleTypes = exports.RoleTypes || (exports.RoleTypes = {}));
/**
 * Defines values for ActivityTypes.
 * Possible values include: 'message', 'contactRelationUpdate',
 * 'conversationUpdate', 'typing', 'ping', 'endOfConversation', 'event',
 * 'invoke', 'deleteUserData', 'messageUpdate', 'messageDelete',
 * 'installationUpdate', 'messageReaction', 'suggestion', 'trace'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: ActivityTypes =
 * <ActivityTypes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var ActivityTypes;
(function (ActivityTypes) {
    ActivityTypes["Message"] = "message";
    ActivityTypes["ContactRelationUpdate"] = "contactRelationUpdate";
    ActivityTypes["ConversationUpdate"] = "conversationUpdate";
    ActivityTypes["Typing"] = "typing";
    ActivityTypes["Ping"] = "ping";
    ActivityTypes["EndOfConversation"] = "endOfConversation";
    ActivityTypes["Event"] = "event";
    ActivityTypes["Invoke"] = "invoke";
    ActivityTypes["DeleteUserData"] = "deleteUserData";
    ActivityTypes["MessageUpdate"] = "messageUpdate";
    ActivityTypes["MessageDelete"] = "messageDelete";
    ActivityTypes["InstallationUpdate"] = "installationUpdate";
    ActivityTypes["MessageReaction"] = "messageReaction";
    ActivityTypes["Suggestion"] = "suggestion";
    ActivityTypes["Trace"] = "trace";
})(ActivityTypes = exports.ActivityTypes || (exports.ActivityTypes = {}));
/**
 * Defines values for TextFormatTypes.
 * Possible values include: 'markdown', 'plain', 'xml'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: TextFormatTypes =
 * <TextFormatTypes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var TextFormatTypes;
(function (TextFormatTypes) {
    TextFormatTypes["Markdown"] = "markdown";
    TextFormatTypes["Plain"] = "plain";
    TextFormatTypes["Xml"] = "xml";
})(TextFormatTypes = exports.TextFormatTypes || (exports.TextFormatTypes = {}));
/**
 * Defines values for AttachmentLayoutTypes.
 * Possible values include: 'list', 'carousel'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: AttachmentLayoutTypes =
 * <AttachmentLayoutTypes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var AttachmentLayoutTypes;
(function (AttachmentLayoutTypes) {
    AttachmentLayoutTypes["List"] = "list";
    AttachmentLayoutTypes["Carousel"] = "carousel";
})(AttachmentLayoutTypes = exports.AttachmentLayoutTypes || (exports.AttachmentLayoutTypes = {}));
/**
 * Defines values for MessageReactionTypes.
 * Possible values include: 'like', 'plusOne'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: MessageReactionTypes =
 * <MessageReactionTypes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var MessageReactionTypes;
(function (MessageReactionTypes) {
    MessageReactionTypes["Like"] = "like";
    MessageReactionTypes["PlusOne"] = "plusOne";
})(MessageReactionTypes = exports.MessageReactionTypes || (exports.MessageReactionTypes = {}));
/**
 * Defines values for InputHints.
 * Possible values include: 'acceptingInput', 'ignoringInput', 'expectingInput'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: InputHints = <InputHints>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var InputHints;
(function (InputHints) {
    InputHints["AcceptingInput"] = "acceptingInput";
    InputHints["IgnoringInput"] = "ignoringInput";
    InputHints["ExpectingInput"] = "expectingInput";
})(InputHints = exports.InputHints || (exports.InputHints = {}));
/**
 * Defines values for ActionTypes.
 * Possible values include: 'openUrl', 'imBack', 'postBack', 'playAudio',
 * 'playVideo', 'showImage', 'downloadFile', 'signin', 'call', 'payment',
 * 'messageBack'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: ActionTypes =
 * <ActionTypes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var ActionTypes;
(function (ActionTypes) {
    ActionTypes["OpenUrl"] = "openUrl";
    ActionTypes["ImBack"] = "imBack";
    ActionTypes["PostBack"] = "postBack";
    ActionTypes["PlayAudio"] = "playAudio";
    ActionTypes["PlayVideo"] = "playVideo";
    ActionTypes["ShowImage"] = "showImage";
    ActionTypes["DownloadFile"] = "downloadFile";
    ActionTypes["Signin"] = "signin";
    ActionTypes["Call"] = "call";
    ActionTypes["Payment"] = "payment";
    ActionTypes["MessageBack"] = "messageBack";
})(ActionTypes = exports.ActionTypes || (exports.ActionTypes = {}));
/**
 * Defines values for EndOfConversationCodes.
 * Possible values include: 'unknown', 'completedSuccessfully',
 * 'userCancelled', 'botTimedOut', 'botIssuedInvalidMessage', 'channelFailed'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: EndOfConversationCodes =
 * <EndOfConversationCodes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var EndOfConversationCodes;
(function (EndOfConversationCodes) {
    EndOfConversationCodes["Unknown"] = "unknown";
    EndOfConversationCodes["CompletedSuccessfully"] = "completedSuccessfully";
    EndOfConversationCodes["UserCancelled"] = "userCancelled";
    EndOfConversationCodes["BotTimedOut"] = "botTimedOut";
    EndOfConversationCodes["BotIssuedInvalidMessage"] = "botIssuedInvalidMessage";
    EndOfConversationCodes["ChannelFailed"] = "channelFailed";
})(EndOfConversationCodes = exports.EndOfConversationCodes || (exports.EndOfConversationCodes = {}));
/**
 * Defines values for ContactRelationUpdateActionTypes.
 * Possible values include: 'add', 'remove'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: ContactRelationUpdateActionTypes =
 * <ContactRelationUpdateActionTypes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var ContactRelationUpdateActionTypes;
(function (ContactRelationUpdateActionTypes) {
    ContactRelationUpdateActionTypes["Add"] = "add";
    ContactRelationUpdateActionTypes["Remove"] = "remove";
})(ContactRelationUpdateActionTypes = exports.ContactRelationUpdateActionTypes || (exports.ContactRelationUpdateActionTypes = {}));
/**
 * Defines values for InstallationUpdateActionTypes.
 * Possible values include: 'add', 'remove'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: InstallationUpdateActionTypes =
 * <InstallationUpdateActionTypes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var InstallationUpdateActionTypes;
(function (InstallationUpdateActionTypes) {
    InstallationUpdateActionTypes["Add"] = "add";
    InstallationUpdateActionTypes["Remove"] = "remove";
})(InstallationUpdateActionTypes = exports.InstallationUpdateActionTypes || (exports.InstallationUpdateActionTypes = {}));
/**
 * Defines values for ActivityImportance.
 * Possible values include: 'low', 'normal', 'high'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: ActivityImportance =
 * <ActivityImportance>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
var ActivityImportance;
(function (ActivityImportance) {
    ActivityImportance["Low"] = "low";
    ActivityImportance["Normal"] = "normal";
    ActivityImportance["High"] = "high";
})(ActivityImportance = exports.ActivityImportance || (exports.ActivityImportance = {}));
//# sourceMappingURL=index.js.map