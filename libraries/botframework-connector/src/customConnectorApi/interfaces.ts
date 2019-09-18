import localVarRequest = require('request');
import http = require('http');

/* tslint:disable:no-unused-locals */
import { Activity } from './model/activity';
import { AttachmentData } from './model/attachmentData';
import { AttachmentInfo } from './model/attachmentInfo';
import { ChannelAccount } from './model/channelAccount';
import { ConversationParameters } from './model/conversationParameters';
import { ConversationResourceResponse } from './model/conversationResourceResponse';
import { ConversationsResult } from './model/conversationsResult';
import { ErrorResponse } from './model/errorResponse';
import { PagedMembersResult } from './model/pagedMembersResult';
import { ResourceResponse } from './model/resourceResponse';
import { Transcript } from './model/transcript';

import * as Models from "./model";

import { ObjectSerializer, Authentication, VoidAuth } from './model/models';

export class SimpleCredential {
  appId: string;
  appPassword: string

  constructor(appId: string, appPassword: string) {
    this.appId = appId;
    this.appPassword = appPassword;
  }
}



export type SendToConversationResponse = ResourceResponse & {
    /*
    * The underlying HTTP response.
    */
   _response: http.IncomingMessage & {
     /**
      * The response body as text (string format)
      */
     bodyAsText: string;
 
     /**
      * The response body as parsed JSON or XML
      */
     parsedBody: PagedMembersResult;
   };
 };

  /**
 * Contains response data for the replyToActivity operation.
 */
export type ReplyToActivityResponse = ResourceResponse & {
    /**
     * The underlying HTTP response.
     */
    _response: http.IncomingMessage & {
      /**
       * The response body as text (string format)
       */
      bodyAsText: string;
  
      /**
       * The response body as parsed JSON or XML
       */
      parsedBody: ResourceResponse;
    };
  };
};


/**
 * Contains response data for the getConversations operation.
 */
export type GetConversationsResponse = ConversationsResult & {
    /**
     * The underlying HTTP response.
     */
    _response: http.IncomingMessage & {
      /**
       * The response body as text (string format)
       */
      bodyAsText: string;
  
      /**
       * The response body as parsed JSON or XML
       */
      parsedBody: ConversationsResult;
    };
  };

  /**
 * Contains response data for the getConversationMembers operation.
 */
export type GetConversationMembersResponse = Array<ChannelAccount> & {
    /**
     * The underlying HTTP response.
     */
    _response: http.IncomingMessage & {
      /**
       * The response body as text (string format)
       */
      bodyAsText: string;
  
      /**
       * The response body as parsed JSON or XML
       */
      body: Array<ChannelAccount>;
    };
  };

/**
 * An interface representing TokenResponse.
 */
export interface TokenResponse {
  /**
   * @member {string} [channelId]
   */
  channelId?: string;
  /**
   * @member {string} [connectionName]
   */
  connectionName?: string;
  token?: string;
  expiration?: string;
}


/**
 * @interface
 * An interface representing ConversationsApiDeleteActivityOptionalParams.
 * Optional Parameters.
 */
export interface ApiDeleteActivityOptionalParams {
    /**
     * @member {string} [channelId]
     */
    channelId?: string;
    /**
     * @member { [key: string]: string } [headers]
     */
    headers?: { [key: string]: string };
}


/**
 * @interface
 * An interface representing ConversationParameters.
 * Parameters for creating a new conversation
 *
 */
export interface ConversationParameters {
  /**
   * @member {boolean} [isGroup] IsGroup
   */
  isGroup: boolean;
  /**
   * @member {ChannelAccount} [bot] The bot address for this conversation
   */
  bot: ChannelAccount;
  /**
   * @member {ChannelAccount[]} [members] Members to add to the conversation
   */
  members?: ChannelAccount[];
  /**
   * @member {string} [topicName] (Optional) Topic of the conversation (if
   * supported by the channel)
   */
  topicName?: string;
  /**
   * @member {Activity} [activity] (Optional) When creating a new conversation,
   * use this activity as the initial message to the conversation
   */
  activity: Activity;
  /**
   * @member {any} [channelData] Channel specific payload for creating the
   * conversation
   */
  channelData: any;
}

/**
 * @interface
 * An interface representing ConversationsApiCreateConversationOptionalParams.
 * Optional Parameters.
 */
export interface ApiCreateConversationOptionalParams {
    /**
     * @member {string} [channelId]
     */
    channelId?: string;
    /**
     * @member { [key: string]: string } [headers]
     */
    headers?: { [key: string]: string };
}

/**
 * Contains response data for the CreateConversation operation.
 */
export type ApiCreateConversationResponse = {
    /**
     * The response body as text (string format)
     */
    bodyAsText: string;

    /**
     * The response body as parsed JSON or XML
     */
    parsedBody: { [propertyName: string]: TokenResponse };
  };
};

/**
 * Contains response data for the DeleteActivity operation.
 */
export type ApiDeleteActivityResponse = {
    /**
     * The response body as text (string format)
     */
    bodyAsText: string;

    /**
     * The response body as parsed JSON or XML
     */
    parsedBody: { [propertyName: string]: TokenResponse };
  };
};

/**
 * Contains response data for the DeleteConversationMember operation.
 */
export type ApiDeleteConversationMemberResponse = {
    /**
     * The response body as text (string format)
     */
    bodyAsText: string;

    /**
     * The response body as parsed JSON or XML
     */
    parsedBody: { [propertyName: string]: TokenResponse };
  };
};


/**
 * Contains response data for the GetActivityMembers operation.
 */
export type ApiGetActivityMembersResponse = {
    /**
     * The response body as text (string format)
     */
    bodyAsText: string;

    /**
     * The response body as parsed JSON or XML
     */
    parsedBody: { [propertyName: string]: TokenResponse };
  };
};

/**
 * An interface representing TokenResponse.
 */
export interface TokenResponse {
  /**
   * @member {string} [channelId]
   */
  channelId?: string;
  /**
   * @member {string} [connectionName]
   */
  connectionName?: string;
  token?: string;
  expiration?: string;
}


/**
 * @interface
 * An interface representing Activity.
 * An Activity is the basic communication type for the Bot Framework 3.0
 * protocol.
 *
 */
export interface Activity {
  /**
   * @member {ActivityTypes} [type] Contains the activity type. Possible values
   * include: 'message', 'contactRelationUpdate', 'conversationUpdate',
   * 'typing', 'endOfConversation', 'event', 'invoke', 'deleteUserData',
   * 'messageUpdate', 'messageDelete', 'installationUpdate', 'messageReaction',
   * 'suggestion', 'trace', 'handoff'
   */
  type: ActivityTypes | string;
  /**
   * @member {string} [id] Contains an ID that uniquely identifies the activity
   * on the channel.
   */
  id?: string;
  /**
   * @member {Date} [timestamp] Contains the date and time that the message was
   * sent, in UTC, expressed in ISO-8601 format.
   */
  timestamp?: Date;
  /**
   * @member {Date} [localTimestamp] Contains the date and time that the
   * message was sent, in local time, expressed in ISO-8601 format.
   * For example, 2016-09-23T13:07:49.4714686-07:00.
   */
  localTimestamp?: Date;
  /**
   * @member {string} [localTimezone] Contains the name of the timezone in
   * which the message, in local time, expressed in IANA Time Zone database
   * format.
   * For example, America/Los_Angeles.
   */
  localTimezone: string;
  /**
   * @member {string} [serviceUrl] Contains the URL that specifies the
   * channel's service endpoint. Set by the channel.
   */
  serviceUrl: string;
  /**
   * @member {string} [channelId] Contains an ID that uniquely identifies the
   * channel. Set by the channel.
   */
  channelId: string;
  /**
   * @member {ChannelAccount} [from] Identifies the sender of the message.
   */
  from: ChannelAccount;
  /**
   * @member {ConversationAccount} [conversation] Identifies the conversation
   * to which the activity belongs.
   */
  conversation: ConversationAccount;
  /**
   * @member {ChannelAccount} [recipient] Identifies the recipient of the
   * message.
   */
  recipient: ChannelAccount;
  /**
   * @member {TextFormatTypes} [textFormat] Format of text fields
   * Default:markdown. Possible values include: 'markdown', 'plain', 'xml'
   */
  textFormat?: TextFormatTypes | string;
  /**
   * @member {AttachmentLayoutTypes} [attachmentLayout] The layout hint for
   * multiple attachments. Default: list. Possible values include: 'list',
   * 'carousel'
   */
  attachmentLayout?: AttachmentLayoutTypes | string;
  /**
   * @member {ChannelAccount[]} [membersAdded] The collection of members added
   * to the conversation.
   */
  membersAdded?: ChannelAccount[];
  /**
   * @member {ChannelAccount[]} [membersRemoved] The collection of members
   * removed from the conversation.
   */
  membersRemoved?: ChannelAccount[];
  /**
   * @member {MessageReaction[]} [reactionsAdded] The collection of reactions
   * added to the conversation.
   */
  reactionsAdded?: MessageReaction[];
  /**
   * @member {MessageReaction[]} [reactionsRemoved] The collection of reactions
   * removed from the conversation.
   */
  reactionsRemoved?: MessageReaction[];
  /**
   * @member {string} [topicName] The updated topic name of the conversation.
   */
  topicName?: string;
  /**
   * @member {boolean} [historyDisclosed] Indicates whether the prior history
   * of the channel is disclosed.
   */
  historyDisclosed?: boolean;
  /**
   * @member {string} [locale] A locale name for the contents of the text
   * field.
   * The locale name is a combination of an ISO 639 two- or three-letter
   * culture code associated with a language
   * and an ISO 3166 two-letter subculture code associated with a country or
   * region.
   * The locale name can also correspond to a valid BCP-47 language tag.
   */
  locale?: string;
  /**
   * @member {string} [text] The text content of the message.
   */
  text: string;
  /**
   * @member {string} [speak] The text to speak.
   */
  speak?: string;
  /**
   * @member {InputHints} [inputHint] Indicates whether your bot is accepting,
   * expecting, or ignoring user input after the message is delivered to the
   * client. Possible values include: 'acceptingInput', 'ignoringInput',
   * 'expectingInput'
   */
  inputHint?: InputHints | string;
  /**
   * @member {string} [summary] The text to display if the channel cannot
   * render cards.
   */
  summary?: string;
  /**
   * @member {SuggestedActions} [suggestedActions] The suggested actions for
   * the activity.
   */
  suggestedActions?: SuggestedActions;
  /**
   * @member {Attachment[]} [attachments] Attachments
   */
  attachments?: Attachment[];
  /**
   * @member {Entity[]} [entities] Represents the entities that were mentioned
   * in the message.
   */
  entities?: Entity[];
  /**
   * @member {any} [channelData] Contains channel-specific content.
   */
  channelData?: any;
  /**
   * @member {string} [action] Indicates whether the recipient of a
   * contactRelationUpdate was added or removed from the sender's contact list.
   */
  action?: string;
  /**
   * @member {string} [replyToId] Contains the ID of the message to which this
   * message is a reply.
   */
  replyToId?: string;
  /**
   * @member {string} [label] A descriptive label for the activity.
   */
  label: string;
  /**
   * @member {string} [valueType] The type of the activity's value object.
   */
  valueType: string;
  /**
   * @member {any} [value] A value that is associated with the activity.
   */
  value?: any;
  /**
   * @member {string} [name] The name of the operation associated with an
   * invoke or event activity.
   */
  name?: string;
  /**
   * @member {ConversationReference} [relatesTo] A reference to another
   * conversation or activity.
   */
  relatesTo?: ConversationReference;
  /**
   * @member {EndOfConversationCodes} [code] The a code for endOfConversation
   * activities that indicates why the conversation ended. Possible values
   * include: 'unknown', 'completedSuccessfully', 'userCancelled',
   * 'botTimedOut', 'botIssuedInvalidMessage', 'channelFailed'
   */
  code?: EndOfConversationCodes | string;
  /**
   * @member {Date} [expiration] The time at which the activity should be
   * considered to be "expired" and should not be presented to the recipient.
   */
  expiration?: Date;
  /**
   * @member {ActivityImportance} [importance] The importance of the activity.
   * Possible values include: 'low', 'normal', 'high'
   */
  importance?: ActivityImportance | string;
  /**
   * @member {DeliveryModes} [deliveryMode] A delivery hint to signal to the
   * recipient alternate delivery paths for the activity.
   * The default delivery mode is "default". Possible values include: 'normal',
   * 'notification'
   */
  deliveryMode?: DeliveryModes | string;
  /**
   * @member {string[]} [listenFor] List of phrases and references that speech
   * and language priming systems should listen for
   */
  listenFor: string[];
  /**
   * @member {TextHighlight[]} [textHighlights] The collection of text
   * fragments to highlight when the activity contains a ReplyToId value.
   */
  textHighlights?: TextHighlight[];
  /**
   * @member {SemanticAction} [semanticAction] An optional programmatic action
   * accompanying this request
   */
  semanticAction: SemanticAction;
}


/**
 * Defines values for ActivityTypes.
 * Possible values include: 'message', 'contactRelationUpdate',
 * 'conversationUpdate', 'typing', 'endOfConversation', 'event', 'invoke',
 * 'deleteUserData', 'messageUpdate', 'messageDelete', 'installationUpdate',
 * 'messageReaction', 'suggestion', 'trace', 'handoff'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: ActivityTypes =
 * <ActivityTypes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */

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


/**
 * @interface
 * An interface representing ConversationAccount.
 * Channel account information for a conversation
 *
 */
export interface ConversationAccount {
  /**
   * @member {boolean} [isGroup] Indicates whether the conversation contains
   * more than two participants at the time the activity was generated
   */
  isGroup: boolean;
  /**
   * @member {string} [conversationType] Indicates the type of the conversation
   * in channels that distinguish between conversation types
   */
  conversationType: string;
  /**
   * @member {string} [id] Channel id for the user or bot on this channel
   * (Example: joe@smith.com, or @joesmith or 123456)
   */
  id: string;
  /**
   * @member {string} [name] Display friendly name
   */
  name: string;
  /**
   * @member {string} [aadObjectId] This account's object ID within Azure
   * Active Directory (AAD)
   */
  aadObjectId: string;
  /**
   * @member {RoleTypes} [role] Role of the entity behind the account (Example:
   * User, Bot, etc.). Possible values include: 'user', 'bot'
   */
  role: RoleTypes;
}

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


/**
 * @interface
 * An interface representing MessageReaction.
 * Message reaction object
 */
export interface MessageReaction {
  /**
   * @member {MessageReactionTypes} [type] Message reaction type. Possible
   * values include: 'like', 'plusOne'
   */
  type: MessageReactionTypes | string;
}

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

/**
 * @interface
 * An interface representing SuggestedActions.
 * SuggestedActions that can be performed
 *
 */
export interface SuggestedActions {
  /**
   * @member {string[]} [to] Ids of the recipients that the actions should be
   * shown to.  These Ids are relative to the channelId and a subset of all
   * recipients of the activity
   */
  to: string[];
  /**
   * @member {CardAction[]} [actions] Actions that can be shown to the user
   */
  actions: CardAction[];
}

/**
 * @interface
 * An interface representing Attachment.
 * An attachment within an activity
 *
 */
export interface Attachment {
  /**
   * @member {string} [contentType] mimetype/Contenttype for the file
   */
  contentType: string;
  /**
   * @member {string} [contentUrl] Content Url
   */
  contentUrl?: string;
  /**
   * @member {any} [content] Embedded content
   */
  content?: any;
  /**
   * @member {string} [name] (OPTIONAL) The name of the attachment
   */
  name?: string;
  /**
   * @member {string} [thumbnailUrl] (OPTIONAL) Thumbnail associated with
   * attachment
   */
  thumbnailUrl?: string;
}

/**
 * @interface
 * An interface representing Entity.
 * Metadata object pertaining to an activity
 *
 */
export interface Entity {
  /**
   * @member {string} [type] Type of this entity (RFC 3987 IRI)
   */
  type: string;
}

/**
 * @interface
 * An interface representing ConversationReference.
 * An object relating to a particular point in a conversation
 *
 */
export interface ConversationReference {
  /**
   * @member {string} [activityId] (Optional) ID of the activity to refer to
   */
  activityId?: string;
  /**
   * @member {ChannelAccount} [user] (Optional) User participating in this
   * conversation
   */
  user?: ChannelAccount;
  /**
   * @member {ChannelAccount} [bot] Bot participating in this conversation
   */
  bot: ChannelAccount;
  /**
   * @member {ConversationAccount} [conversation] Conversation reference
   */
  conversation: ConversationAccount;
  /**
   * @member {string} [channelId] Channel ID
   */
  channelId: string;
  /**
   * @member {string} [serviceUrl] Service endpoint where operations concerning
   * the referenced conversation may be performed
   */
  serviceUrl: string;
}

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


/**
 * Defines values for DeliveryModes.
 * Possible values include: 'normal', 'notification'
 * There could be more values for this enum apart from the ones defined here.If
 * you want to set a value that is not from the known values then you can do
 * the following:
 * let param: DeliveryModes =
 * <DeliveryModes>"someUnknownValueThatWillStillBeValid";
 * @readonly
 * @enum {string}
 */
export declare enum DeliveryModes {
  Normal = "normal",
  Notification = "notification"
}

/**
 * @interface
 * An interface representing TextHighlight.
 * Refers to a substring of content within another field
 *
 */
export interface TextHighlight {
  /**
   * @member {string} [text] Defines the snippet of text to highlight
   */
  text: string;
  /**
   * @member {number} [occurrence] Occurrence of the text field within the
   * referenced text, if multiple exist.
   */
  occurrence: number;
}

/**
 * @interface
 * An interface representing SemanticAction.
 * Represents a reference to a programmatic action
 *
 */
export interface SemanticAction {
  /**
   * @member {string} [id] ID of this action
   */
  id: string;
  /**
   * @member {{ [propertyName: string]: Entity }} [entities] Entities
   * associated with this action
   */
  entities: {
    [propertyName: string]: Entity;
  };
}

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
export declare enum MessageReactionTypes {
  Like = "like",
  PlusOne = "plusOne"
}

/**
 * @interface
 * An interface representing CardAction.
 * A clickable action
 *
 */
export interface CardAction {
  /**
   * @member {ActionTypes} [type] The type of action implemented by this
   * button. Possible values include: 'openUrl', 'imBack', 'postBack',
   * 'playAudio', 'playVideo', 'showImage', 'downloadFile', 'signin', 'call',
   * 'payment', 'messageBack'
   */
  type: ActionTypes | string;
  /**
   * @member {string} [title] Text description which appears on the button
   */
  title: string;
  /**
   * @member {string} [image] Image URL which will appear on the button, next
   * to text label
   */
  image?: string;
  /**
   * @member {string} [text] Text for this action
   */
  text?: string;
  /**
   * @member {string} [displayText] (Optional) text to display in the chat feed
   * if the button is clicked
   */
  displayText?: string;
  /**
   * @member {any} [value] Supplementary parameter for action. Content of this
   * property depends on the ActionType
   */
  value: any;
  /**
   * @member {any} [channelData] Channel-specific data associated with this
   * action
   */
  channelData: any;
}

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
export declare enum ActionTypes {
  OpenUrl = "openUrl",
  ImBack = "imBack",
  PostBack = "postBack",
  PlayAudio = "playAudio",
  PlayVideo = "playVideo",
  ShowImage = "showImage",
  DownloadFile = "downloadFile",
  Signin = "signin",
  Call = "call",
  Payment = "payment",
  MessageBack = "messageBack"
}
