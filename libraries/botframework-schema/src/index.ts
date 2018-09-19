/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

/**
 * copy of RequestOptionsBase so we don't have dependency on ms-rest-js in our schema package
 */
 
/**
 * Describes the base structure of the options object that will be used in every operation.
 */
export interface RequestOptionsBase {
  /**
   * @property {object} [customHeaders] - User defined custom request headers that
   * will be applied before the request is sent.
   */
  customHeaders?: {
      [key: string]: string;
  };
  [key: string]: any;
}


/**
 * @interface
 * An interface representing AttachmentView.
 * Attachment View name and size
 *
 */
export interface AttachmentView {
  /**
   * @member {string} [viewId] Content type of the attachment
   */
  viewId: string;
  /**
   * @member {number} [size] Name of the attachment
   */
  size: number;
}

/**
 * @interface
 * An interface representing AttachmentInfo.
 * Metdata for an attachment
 *
 */
export interface AttachmentInfo {
  /**
   * @member {string} [name] Name of the attachment
   */
  name: string;
  /**
   * @member {string} [type] ContentType of the attachment
   */
  type: string;
  /**
   * @member {AttachmentView[]} [views] attachment views
   */
  views: AttachmentView[];
}

/**
 * @interface
 * An interface representing ErrorModel.
 * Object representing error information
 *
 */
export interface ErrorModel {
  /**
   * @member {string} [code] Error code
   */
  code: string;
  /**
   * @member {string} [message] Error message
   */
  message: string;
}

/**
 * @interface
 * An interface representing ErrorResponse.
 * An HTTP API response
 *
 */
export interface ErrorResponse {
  /**
   * @member {ErrorModel} [error] Error message
   */
  error: ErrorModel;
}

/**
 * @interface
 * An interface representing ChannelAccount.
 * Channel account information needed to route a message
 *
 */
export interface ChannelAccount {
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
   * @member {RoleTypes} [role] Role of the entity behind the account (Example:
   * User, Bot, etc.). Possible values include: 'user', 'bot'
   */
  role: RoleTypes | string;
}

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
   * @member {RoleTypes} [role] Role of the entity behind the account (Example:
   * User, Bot, etc.). Possible values include: 'user', 'bot'
   */
  role: RoleTypes;
}

/**
 * @interface
 * An interface representing MessageReaction.
 * Message reaction object
 *
 */
export interface MessageReaction {
  /**
   * @member {MessageReactionTypes} [type] Message reaction type. Possible
   * values include: 'like', 'plusOne'
   */
  type: MessageReactionTypes | string;
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
}

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
 * Object of schema.org types
 *
 */
export interface Entity {
  /**
   * @member {string} [type] Entity Type (typically from schema.org types)
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
 * @interface
 * An interface representing TextHighlight.
 */
export interface TextHighlight {
  /**
   * @member {string} [text] plain text fragment to highlight
   */
  text: string;
  /**
   * @member {number} [occurence] index of occurence of the Text (Starting at
   * 1)
   */
  occurence: number;
}

/**
 * @interface
 * An interface representing Activity.
 * An Activity is the basic communication type for the Bot Framework 3.0
 * protocol
 *
 */
export interface Activity {
  /**
   * @member {ActivityTypes} [type] The type of the activity. Possible values
   * include: 'message', 'contactRelationUpdate', 'conversationUpdate',
   * 'typing', 'ping', 'endOfConversation', 'event', 'invoke',
   * 'deleteUserData', 'messageUpdate', 'messageDelete', 'installationUpdate',
   * 'messageReaction', 'suggestion', 'trace'
   */
  type: ActivityTypes | string;
  /**
   * @member {string} [id] ID of this activity
   */
  id?: string;
  /**
   * @member {Date} [timestamp] UTC Time when message was sent (set by service)
   */
  timestamp?: Date;
  /**
   * @member {Date} [localTimestamp] Local time when message was sent (set by
   * client, Ex: 2016-09-23T13:07:49.4714686-07:00)
   */
  localTimestamp?: Date;
  /**
   * @member {string} [serviceUrl] Service endpoint where operations concerning
   * the activity may be performed
   */
  serviceUrl: string;
  /**
   * @member {string} [channelId] ID of the channel where the activity was sent
   */
  channelId: string;
  /**
   * @member {ChannelAccount} [from] Sender address
   */
  from: ChannelAccount;
  /**
   * @member {ConversationAccount} [conversation] Conversation
   */
  conversation: ConversationAccount;
  /**
   * @member {ChannelAccount} [recipient] (Outbound to bot only) Bot's address
   * that received the message
   */
  recipient: ChannelAccount;
  /**
   * @member {TextFormatTypes} [textFormat] Format of text fields
   * Default:markdown. Possible values include: 'markdown', 'plain', 'xml'
   */
  textFormat?: TextFormatTypes | string;
  /**
   * @member {AttachmentLayoutTypes} [attachmentLayout] Hint for how to deal
   * with multiple attachments. Default:list. Possible values include: 'list',
   * 'carousel'
   */
  attachmentLayout?: AttachmentLayoutTypes | string;
  /**
   * @member {ChannelAccount[]} [membersAdded] Members added to the
   * conversation
   */
  membersAdded?: ChannelAccount[];
  /**
   * @member {ChannelAccount[]} [membersRemoved] Members removed from the
   * conversation
   */
  membersRemoved?: ChannelAccount[];
  /**
   * @member {MessageReaction[]} [reactionsAdded] Reactions added to the
   * activity
   */
  reactionsAdded?: MessageReaction[];
  /**
   * @member {MessageReaction[]} [reactionsRemoved] Reactions removed from the
   * activity
   */
  reactionsRemoved?: MessageReaction[];
  /**
   * @member {string} [topicName] The conversation's updated topic name
   */
  topicName?: string;
  /**
   * @member {boolean} [historyDisclosed] True if prior history of the channel
   * is disclosed
   */
  historyDisclosed?: boolean;
  /**
   * @member {string} [locale] The language code of the Text field
   */
  locale?: string;
  /**
   * @member {string} [text] Content for the message
   */
  text: string;
  /**
   * @member {string} [speak] SSML Speak for TTS audio response
   */
  speak?: string;
  /**
   * @member {InputHints} [inputHint] Input hint to the channel on what the bot
   * is expecting. Possible values include: 'acceptingInput', 'ignoringInput',
   * 'expectingInput'
   */
  inputHint?: InputHints | string;
  /**
   * @member {string} [summary] Text to display if the channel cannot render
   * cards
   */
  summary?: string;
  /**
   * @member {SuggestedActions} [suggestedActions] SuggestedActions are used to
   * provide keyboard/quickreply like behavior in many clients
   */
  suggestedActions?: SuggestedActions;
  /**
   * @member {Attachment[]} [attachments] Attachments
   */
  attachments?: Attachment[];
  /**
   * @member {Entity[]} [entities] Collection of Entity objects, each of which
   * contains metadata about this activity. Each Entity object is typed.
   */
  entities?: Entity[];
  /**
   * @member {any} [channelData] Channel-specific payload
   */
  channelData?: any;
  /**
   * @member {string} [action] ContactAdded/Removed action
   */
  action?: string;
  /**
   * @member {string} [replyToId] The original ID this message is a response to
   */
  replyToId?: string;
  /**
   * @member {string} [label] Descriptive label
   */
  label: string;
  /**
   * @member {string} [valueType] Unique string which identifies the shape of
   * the value object
   */
  valueType: string;
  /**
   * @member {any} [value] Open-ended value
   */
  value?: any;
  /**
   * @member {string} [name] Name of the operation to invoke or the name of the
   * event
   */
  name?: string;
  /**
   * @member {ConversationReference} [relatesTo] Reference to another
   * conversation or activity
   */
  relatesTo?: ConversationReference;
  /**
   * @member {EndOfConversationCodes} [code] Code indicating why the
   * conversation has ended. Possible values include: 'unknown',
   * 'completedSuccessfully', 'userCancelled', 'botTimedOut',
   * 'botIssuedInvalidMessage', 'channelFailed'
   */
  code?: EndOfConversationCodes | string;
  /**
   * @member {Date} [expiration] DateTime to expire the activity as ISO 8601
   * encoded datetime
   */
  expiration?: Date;
  /**
   * @member {string} [importance] Importance of this activity
   * {Low|Normal|High}, null value indicates Normal importance see
   * ActivityImportance)
   */
  importance?: string;
  /**
   * @member {string} [deliveryMode] Hint to describe how this activity should
   * be delivered.
   * Currently: null or "Default" = default delivery
   * "Notification" = notification semantics
   */
  deliveryMode?: string;
  /**
   * @member {TextHighlight[]} [textHighlights] TextHighlight in the activity
   * represented in the ReplyToId property
   */
  textHighlights?: TextHighlight[];
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
   * use this activity as the intial message to the conversation
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
 * An interface representing ConversationResourceResponse.
 * A response containing a resource
 *
 */
export interface ConversationResourceResponse {
  /**
   * @member {string} [activityId] ID of the Activity (if sent)
   */
  activityId: string;
  /**
   * @member {string} [serviceUrl] Service endpoint where operations concerning
   * the conversation may be performed
   */
  serviceUrl: string;
  /**
   * @member {string} [id] Id of the resource
   */
  id: string;
}

/**
 * @interface
 * An interface representing ConversationMembers.
 * Conversation and its members
 *
 */
export interface ConversationMembers {
  /**
   * @member {string} [id] Conversation ID
   */
  id: string;
  /**
   * @member {ChannelAccount[]} [members] List of members in this conversation
   */
  members: ChannelAccount[];
}

/**
 * @interface
 * An interface representing ConversationsResult.
 * Conversations result
 *
 */
export interface ConversationsResult {
  /**
   * @member {string} [continuationToken] Paging token
   */
  continuationToken: string;
  /**
   * @member {ConversationMembers[]} [conversations] List of conversations
   */
  conversations: ConversationMembers[];
}

/**
 * @interface
 * An interface representing ResourceResponse.
 * A response containing a resource ID
 *
 */
export interface ResourceResponse {
  /**
   * @member {string} [id] Id of the resource
   */
  id: string;
}

/**
 * @interface
 * An interface representing AttachmentData.
 * Attachment data
 *
 */
export interface AttachmentData {
  /**
   * @member {string} [type] Content-Type of the attachment
   */
  type: string;
  /**
   * @member {string} [name] Name of the attachment
   */
  name: string;
  /**
   * @member {any} [originalBase64] Attachment content
   */
  originalBase64: any;
  /**
   * @member {any} [thumbnailBase64] Attachment thumbnail
   */
  thumbnailBase64: any;
}

/**
 * @interface
 * An interface representing CardImage.
 * An image on a card
 *
 */
export interface CardImage {
  /**
   * @member {string} [url] URL thumbnail image for major content property
   */
  url: string;
  /**
   * @member {string} [alt] Image description intended for screen readers
   */
  alt?: string;
  /**
   * @member {CardAction} [tap] Action assigned to specific Attachment
   */
  tap?: CardAction;
}

/**
 * @interface
 * An interface representing HeroCard.
 * A Hero card (card with a single, large image)
 *
 */
export interface HeroCard {
  /**
   * @member {string} [title] Title of the card
   */
  title: string;
  /**
   * @member {string} [subtitle] Subtitle of the card
   */
  subtitle: string;
  /**
   * @member {string} [text] Text for the card
   */
  text: string;
  /**
   * @member {CardImage[]} [images] Array of images for the card
   */
  images: CardImage[];
  /**
   * @member {CardAction[]} [buttons] Set of actions applicable to the current
   * card
   */
  buttons: CardAction[];
  /**
   * @member {CardAction} [tap] This action will be activated when user taps on
   * the card itself
   */
  tap: CardAction;
}

/**
 * @interface
 * An interface representing ThumbnailUrl.
 * Thumbnail URL
 *
 */
export interface ThumbnailUrl {
  /**
   * @member {string} [url] URL pointing to the thumbnail to use for media
   * content
   */
  url: string;
  /**
   * @member {string} [alt] HTML alt text to include on this thumbnail image
   */
  alt: string;
}

/**
 * @interface
 * An interface representing MediaUrl.
 * Media URL
 *
 */
export interface MediaUrl {
  /**
   * @member {string} [url] Url for the media
   */
  url: string;
  /**
   * @member {string} [profile] Optional profile hint to the client to
   * differentiate multiple MediaUrl objects from each other
   */
  profile?: string;
}

/**
 * @interface
 * An interface representing AnimationCard.
 * An animation card (Ex: gif or short video clip)
 *
 */
export interface AnimationCard {
  /**
   * @member {string} [title] Title of this card
   */
  title: string;
  /**
   * @member {string} [subtitle] Subtitle of this card
   */
  subtitle: string;
  /**
   * @member {string} [text] Text of this card
   */
  text: string;
  /**
   * @member {ThumbnailUrl} [image] Thumbnail placeholder
   */
  image: ThumbnailUrl;
  /**
   * @member {MediaUrl[]} [media] Media URLs for this card
   */
  media: MediaUrl[];
  /**
   * @member {CardAction[]} [buttons] Actions on this card
   */
  buttons: CardAction[];
  /**
   * @member {boolean} [shareable] This content may be shared with others
   * (default:true)
   */
  shareable: boolean;
  /**
   * @member {boolean} [autoloop] Should the client loop playback at end of
   * content (default:true)
   */
  autoloop: boolean;
  /**
   * @member {boolean} [autostart] Should the client automatically start
   * playback of media in this card (default:true)
   */
  autostart: boolean;
  /**
   * @member {string} [aspect] Aspect ratio of thumbnail/media placeholder,
   * allowed values are "16:9" and "4:3"
   */
  aspect: string;
  /**
   * @member {any} [value] Supplementary parameter for this card
   */
  value: any;
}

/**
 * @interface
 * An interface representing AudioCard.
 * Audio card
 *
 */
export interface AudioCard {
  /**
   * @member {string} [title] Title of this card
   */
  title: string;
  /**
   * @member {string} [subtitle] Subtitle of this card
   */
  subtitle: string;
  /**
   * @member {string} [text] Text of this card
   */
  text: string;
  /**
   * @member {ThumbnailUrl} [image] Thumbnail placeholder
   */
  image: ThumbnailUrl;
  /**
   * @member {MediaUrl[]} [media] Media URLs for this card
   */
  media: MediaUrl[];
  /**
   * @member {CardAction[]} [buttons] Actions on this card
   */
  buttons: CardAction[];
  /**
   * @member {boolean} [shareable] This content may be shared with others
   * (default:true)
   */
  shareable: boolean;
  /**
   * @member {boolean} [autoloop] Should the client loop playback at end of
   * content (default:true)
   */
  autoloop: boolean;
  /**
   * @member {boolean} [autostart] Should the client automatically start
   * playback of media in this card (default:true)
   */
  autostart: boolean;
  /**
   * @member {string} [aspect] Aspect ratio of thumbnail/media placeholder,
   * allowed values are "16:9" and "4:3"
   */
  aspect: string;
  /**
   * @member {any} [value] Supplementary parameter for this card
   */
  value: any;
}

/**
 * @interface
 * An interface representing BasicCard.
 * A basic card
 *
 */
export interface BasicCard {
  /**
   * @member {string} [title] Title of the card
   */
  title: string;
  /**
   * @member {string} [subtitle] Subtitle of the card
   */
  subtitle: string;
  /**
   * @member {string} [text] Text for the card
   */
  text: string;
  /**
   * @member {CardImage[]} [images] Array of images for the card
   */
  images: CardImage[];
  /**
   * @member {CardAction[]} [buttons] Set of actions applicable to the current
   * card
   */
  buttons: CardAction[];
  /**
   * @member {CardAction} [tap] This action will be activated when user taps on
   * the card itself
   */
  tap: CardAction;
}

/**
 * @interface
 * An interface representing MediaCard.
 * Media card
 *
 */
export interface MediaCard {
  /**
   * @member {string} [title] Title of this card
   */
  title: string;
  /**
   * @member {string} [subtitle] Subtitle of this card
   */
  subtitle: string;
  /**
   * @member {string} [text] Text of this card
   */
  text: string;
  /**
   * @member {ThumbnailUrl} [image] Thumbnail placeholder
   */
  image: ThumbnailUrl;
  /**
   * @member {MediaUrl[]} [media] Media URLs for this card
   */
  media: MediaUrl[];
  /**
   * @member {CardAction[]} [buttons] Actions on this card
   */
  buttons: CardAction[];
  /**
   * @member {boolean} [shareable] This content may be shared with others
   * (default:true)
   */
  shareable: boolean;
  /**
   * @member {boolean} [autoloop] Should the client loop playback at end of
   * content (default:true)
   */
  autoloop: boolean;
  /**
   * @member {boolean} [autostart] Should the client automatically start
   * playback of media in this card (default:true)
   */
  autostart: boolean;
  /**
   * @member {string} [aspect] Aspect ratio of thumbnail/media placeholder,
   * allowed values are "16:9" and "4:3"
   */
  aspect: string;
  /**
   * @member {any} [value] Supplementary parameter for this card
   */
  value: any;
}

/**
 * @interface
 * An interface representing Fact.
 * Set of key-value pairs. Advantage of this section is that key and value
 * properties will be
 * rendered with default style information with some delimiter between them. So
 * there is no need for developer to specify style information.
 *
 */
export interface Fact {
  /**
   * @member {string} [key] The key for this Fact
   */
  key: string;
  /**
   * @member {string} [value] The value for this Fact
   */
  value: string;
}

/**
 * @interface
 * An interface representing ReceiptItem.
 * An item on a receipt card
 *
 */
export interface ReceiptItem {
  /**
   * @member {string} [title] Title of the Card
   */
  title: string;
  /**
   * @member {string} [subtitle] Subtitle appears just below Title field,
   * differs from Title in font styling only
   */
  subtitle: string;
  /**
   * @member {string} [text] Text field appears just below subtitle, differs
   * from Subtitle in font styling only
   */
  text: string;
  /**
   * @member {CardImage} [image] Image
   */
  image: CardImage;
  /**
   * @member {string} [price] Amount with currency
   */
  price: string;
  /**
   * @member {string} [quantity] Number of items of given kind
   */
  quantity: string;
  /**
   * @member {CardAction} [tap] This action will be activated when user taps on
   * the Item bubble.
   */
  tap: CardAction;
}

/**
 * @interface
 * An interface representing ReceiptCard.
 * A receipt card
 *
 */
export interface ReceiptCard {
  /**
   * @member {string} [title] Title of the card
   */
  title: string;
  /**
   * @member {Fact[]} [facts] Array of Fact objects
   */
  facts: Fact[];
  /**
   * @member {ReceiptItem[]} [items] Array of Receipt Items
   */
  items: ReceiptItem[];
  /**
   * @member {CardAction} [tap] This action will be activated when user taps on
   * the card
   */
  tap: CardAction;
  /**
   * @member {string} [total] Total amount of money paid (or to be paid)
   */
  total: string;
  /**
   * @member {string} [tax] Total amount of tax paid (or to be paid)
   */
  tax: string;
  /**
   * @member {string} [vat] Total amount of VAT paid (or to be paid)
   */
  vat: string;
  /**
   * @member {CardAction[]} [buttons] Set of actions applicable to the current
   * card
   */
  buttons: CardAction[];
}

/**
 * @interface
 * An interface representing SigninCard.
 * A card representing a request to sign in
 *
 */
export interface SigninCard {
  /**
   * @member {string} [text] Text for signin request
   */
  text?: string;
  /**
   * @member {CardAction[]} [buttons] Action to use to perform signin
   */
  buttons: CardAction[];
}

/**
 * @interface
 * An interface representing OAuthCard.
 * A card representing a request to peform a sign in via OAuth
 *
 */
export interface OAuthCard {
  /**
   * @member {string} [text] Text for signin request
   */
  text: string;
  /**
   * @member {string} [connectionName] The name of the registered connection
   */
  connectionName: string;
  /**
   * @member {CardAction[]} [buttons] Action to use to perform signin
   */
  buttons: CardAction[];
}

/**
 * @interface
 * An interface representing ThumbnailCard.
 * A thumbnail card (card with a single, small thumbnail image)
 *
 */
export interface ThumbnailCard {
  /**
   * @member {string} [title] Title of the card
   */
  title: string;
  /**
   * @member {string} [subtitle] Subtitle of the card
   */
  subtitle: string;
  /**
   * @member {string} [text] Text for the card
   */
  text: string;
  /**
   * @member {CardImage[]} [images] Array of images for the card
   */
  images: CardImage[];
  /**
   * @member {CardAction[]} [buttons] Set of actions applicable to the current
   * card
   */
  buttons: CardAction[];
  /**
   * @member {CardAction} [tap] This action will be activated when user taps on
   * the card itself
   */
  tap: CardAction;
}

/**
 * @interface
 * An interface representing VideoCard.
 * Video card
 *
 */
export interface VideoCard {
  /**
   * @member {string} [title] Title of this card
   */
  title: string;
  /**
   * @member {string} [subtitle] Subtitle of this card
   */
  subtitle: string;
  /**
   * @member {string} [text] Text of this card
   */
  text: string;
  /**
   * @member {ThumbnailUrl} [image] Thumbnail placeholder
   */
  image: ThumbnailUrl;
  /**
   * @member {MediaUrl[]} [media] Media URLs for this card
   */
  media: MediaUrl[];
  /**
   * @member {CardAction[]} [buttons] Actions on this card
   */
  buttons: CardAction[];
  /**
   * @member {boolean} [shareable] This content may be shared with others
   * (default:true)
   */
  shareable: boolean;
  /**
   * @member {boolean} [autoloop] Should the client loop playback at end of
   * content (default:true)
   */
  autoloop: boolean;
  /**
   * @member {boolean} [autostart] Should the client automatically start
   * playback of media in this card (default:true)
   */
  autostart: boolean;
  /**
   * @member {string} [aspect] Aspect ratio of thumbnail/media placeholder,
   * allowed values are "16:9" and "4:3"
   */
  aspect: string;
  /**
   * @member {any} [value] Supplementary parameter for this card
   */
  value: any;
}

/**
 * @interface
 * An interface representing GeoCoordinates.
 * GeoCoordinates (entity type: "https://schema.org/GeoCoordinates")
 *
 */
export interface GeoCoordinates {
  /**
   * @member {number} [elevation] Elevation of the location [WGS
   * 84](https://en.wikipedia.org/wiki/World_Geodetic_System)
   */
  elevation: number;
  /**
   * @member {number} [latitude] Latitude of the location [WGS
   * 84](https://en.wikipedia.org/wiki/World_Geodetic_System)
   */
  latitude: number;
  /**
   * @member {number} [longitude] Longitude of the location [WGS
   * 84](https://en.wikipedia.org/wiki/World_Geodetic_System)
   */
  longitude: number;
  /**
   * @member {string} [type] The type of the thing
   */
  type: string;
  /**
   * @member {string} [name] The name of the thing
   */
  name: string;
}

/**
 * @interface
 * An interface representing Mention.
 * Mention information (entity type: "mention")
 *
 */
export interface Mention {
  /**
   * @member {ChannelAccount} [mentioned] The mentioned user
   */
  mentioned: ChannelAccount;
  /**
   * @member {string} [text] Sub Text which represents the mention (can be null
   * or empty)
   */
  text: string;
  /**
   * @member {string} [type] Entity Type (typically from schema.org types)
   */
  type: string;
}

/**
 * @interface
 * An interface representing Place.
 * Place (entity type: "https://schema.org/Place")
 *
 */
export interface Place {
  /**
   * @member {any} [address] Address of the place (may be `string` or complex
   * object of type `PostalAddress`)
   */
  address: any;
  /**
   * @member {any} [geo] Geo coordinates of the place (may be complex object of
   * type `GeoCoordinates` or `GeoShape`)
   */
  geo: any;
  /**
   * @member {any} [hasMap] Map to the place (may be `string` (URL) or complex
   * object of type `Map`)
   */
  hasMap: any;
  /**
   * @member {string} [type] The type of the thing
   */
  type: string;
  /**
   * @member {string} [name] The name of the thing
   */
  name: string;
}

/**
 * @interface
 * An interface representing Thing.
 * Thing (entity type: "https://schema.org/Thing")
 *
 */
export interface Thing {
  /**
   * @member {string} [type] The type of the thing
   */
  type: string;
  /**
   * @member {string} [name] The name of the thing
   */
  name: string;
}

/**
 * @interface
 * An interface representing MediaEventValue.
 * Supplementary parameter for media events
 *
 */
export interface MediaEventValue {
  /**
   * @member {any} [cardValue] Callback parameter specified in the Value field
   * of the MediaCard that originated this event
   */
  cardValue: any;
}

/**
 * @interface
 * An interface representing TokenRequest.
 * A request to receive a user token
 *
 */
export interface TokenRequest {
  /**
   * @member {string} [provider] The provider to request a user token from
   */
  provider: string;
  /**
   * @member {{ [propertyName: string]: any }} [settings] A collection of
   * settings for the specific provider for this request
   */
  settings: { [propertyName: string]: any };
}

/**
 * @interface
 * An interface representing TokenResponse.
 * A response that includes a user token
 *
 */
export interface TokenResponse {
  /**
   * @member {string} [connectionName] The connection name
   */
  connectionName: string;
  /**
   * @member {string} [token] The user token
   */
  token: string;
  /**
   * @member {string} [expiration] Expiration for the token, in ISO 8601 format
   * (e.g. "2007-04-05T14:30Z")
   */
  expiration: string;
}

/**
 * @interface
 * An interface representing MicrosoftPayMethodData.
 * W3C Payment Method Data for Microsoft Pay
 *
 */
export interface MicrosoftPayMethodData {
  /**
   * @member {string} [mechantId] Microsoft Pay Merchant ID
   */
  mechantId: string;
  /**
   * @member {string[]} [supportedNetworks] Supported payment networks (e.g.,
   * "visa" and "mastercard")
   */
  supportedNetworks: string[];
  /**
   * @member {string[]} [supportedTypes] Supported payment types (e.g.,
   * "credit")
   */
  supportedTypes: string[];
}

/**
 * @interface
 * An interface representing PaymentAddress.
 * Address within a Payment Request
 *
 */
export interface PaymentAddress {
  /**
   * @member {string} [country] This is the CLDR (Common Locale Data
   * Repository) region code. For example, US, GB, CN, or JP
   */
  country: string;
  /**
   * @member {string[]} [addressLine] This is the most specific part of the
   * address. It can include, for example, a street name, a house number,
   * apartment number, a rural delivery route, descriptive instructions, or a
   * post office box number.
   */
  addressLine: string[];
  /**
   * @member {string} [region] This is the top level administrative subdivision
   * of the country. For example, this can be a state, a province, an oblast,
   * or a prefecture.
   */
  region: string;
  /**
   * @member {string} [city] This is the city/town portion of the address.
   */
  city: string;
  /**
   * @member {string} [dependentLocality] This is the dependent locality or
   * sublocality within a city. For example, used for neighborhoods, boroughs,
   * districts, or UK dependent localities.
   */
  dependentLocality: string;
  /**
   * @member {string} [postalCode] This is the postal code or ZIP code, also
   * known as PIN code in India.
   */
  postalCode: string;
  /**
   * @member {string} [sortingCode] This is the sorting code as used in, for
   * example, France.
   */
  sortingCode: string;
  /**
   * @member {string} [languageCode] This is the BCP-47 language code for the
   * address. It's used to determine the field separators and the order of
   * fields when formatting the address for display.
   */
  languageCode: string;
  /**
   * @member {string} [organization] This is the organization, firm, company,
   * or institution at this address.
   */
  organization: string;
  /**
   * @member {string} [recipient] This is the name of the recipient or contact
   * person.
   */
  recipient: string;
  /**
   * @member {string} [phone] This is the phone number of the recipient or
   * contact person.
   */
  phone: string;
}

/**
 * @interface
 * An interface representing PaymentCurrencyAmount.
 * Supplies monetary amounts
 *
 */
export interface PaymentCurrencyAmount {
  /**
   * @member {string} [currency] A currency identifier
   */
  currency: string;
  /**
   * @member {string} [value] Decimal monetary value
   */
  value: string;
  /**
   * @member {string} [currencySystem] Currency system
   */
  currencySystem: string;
}

/**
 * @interface
 * An interface representing PaymentItem.
 * Indicates what the payment request is for and the value asked for
 *
 */
export interface PaymentItem {
  /**
   * @member {string} [label] Human-readable description of the item
   */
  label: string;
  /**
   * @member {PaymentCurrencyAmount} [amount] Monetary amount for the item
   */
  amount: PaymentCurrencyAmount;
  /**
   * @member {boolean} [pending] When set to true this flag means that the
   * amount field is not final.
   */
  pending: boolean;
}

/**
 * @interface
 * An interface representing PaymentShippingOption.
 * Describes a shipping option
 *
 */
export interface PaymentShippingOption {
  /**
   * @member {string} [id] String identifier used to reference this
   * PaymentShippingOption
   */
  id: string;
  /**
   * @member {string} [label] Human-readable description of the item
   */
  label: string;
  /**
   * @member {PaymentCurrencyAmount} [amount] Contains the monetary amount for
   * the item
   */
  amount: PaymentCurrencyAmount;
  /**
   * @member {boolean} [selected] Indicates whether this is the default
   * selected PaymentShippingOption
   */
  selected: boolean;
}

/**
 * @interface
 * An interface representing PaymentDetailsModifier.
 * Provides details that modify the PaymentDetails based on payment method
 * identifier
 *
 */
export interface PaymentDetailsModifier {
  /**
   * @member {string[]} [supportedMethods] Contains a sequence of payment
   * method identifiers
   */
  supportedMethods: string[];
  /**
   * @member {PaymentItem} [total] This value overrides the total field in the
   * PaymentDetails dictionary for the payment method identifiers in the
   * supportedMethods field
   */
  total: PaymentItem;
  /**
   * @member {PaymentItem[]} [additionalDisplayItems] Provides additional
   * display items that are appended to the displayItems field in the
   * PaymentDetails dictionary for the payment method identifiers in the
   * supportedMethods field
   */
  additionalDisplayItems: PaymentItem[];
  /**
   * @member {any} [data] A JSON-serializable object that provides optional
   * information that might be needed by the supported payment methods
   */
  data: any;
}

/**
 * @interface
 * An interface representing PaymentDetails.
 * Provides information about the requested transaction
 *
 */
export interface PaymentDetails {
  /**
   * @member {PaymentItem} [total] Contains the total amount of the payment
   * request
   */
  total: PaymentItem;
  /**
   * @member {PaymentItem[]} [displayItems] Contains line items for the payment
   * request that the user agent may display
   */
  displayItems: PaymentItem[];
  /**
   * @member {PaymentShippingOption[]} [shippingOptions] A sequence containing
   * the different shipping options for the user to choose from
   */
  shippingOptions: PaymentShippingOption[];
  /**
   * @member {PaymentDetailsModifier[]} [modifiers] Contains modifiers for
   * particular payment method identifiers
   */
  modifiers: PaymentDetailsModifier[];
  /**
   * @member {string} [error] Error description
   */
  error: string;
}

/**
 * @interface
 * An interface representing PaymentMethodData.
 * Indicates a set of supported payment methods and any associated payment
 * method specific data for those methods
 *
 */
export interface PaymentMethodData {
  /**
   * @member {string[]} [supportedMethods] Required sequence of strings
   * containing payment method identifiers for payment methods that the
   * merchant web site accepts
   */
  supportedMethods: string[];
  /**
   * @member {any} [data] A JSON-serializable object that provides optional
   * information that might be needed by the supported payment methods
   */
  data: any;
}

/**
 * @interface
 * An interface representing PaymentOptions.
 * Provides information about the options desired for the payment request
 *
 */
export interface PaymentOptions {
  /**
   * @member {boolean} [requestPayerName] Indicates whether the user agent
   * should collect and return the payer's name as part of the payment request
   */
  requestPayerName: boolean;
  /**
   * @member {boolean} [requestPayerEmail] Indicates whether the user agent
   * should collect and return the payer's email address as part of the payment
   * request
   */
  requestPayerEmail: boolean;
  /**
   * @member {boolean} [requestPayerPhone] Indicates whether the user agent
   * should collect and return the payer's phone number as part of the payment
   * request
   */
  requestPayerPhone: boolean;
  /**
   * @member {boolean} [requestShipping] Indicates whether the user agent
   * should collect and return a shipping address as part of the payment
   * request
   */
  requestShipping: boolean;
  /**
   * @member {string} [shippingType] If requestShipping is set to true, then
   * the shippingType field may be used to influence the way the user agent
   * presents the user interface for gathering the shipping address
   */
  shippingType: string;
}

/**
 * @interface
 * An interface representing PaymentRequest.
 * A request to make a payment
 *
 */
export interface PaymentRequest {
  /**
   * @member {string} [id] ID of this payment request
   */
  id: string;
  /**
   * @member {PaymentMethodData[]} [methodData] Allowed payment methods for
   * this request
   */
  methodData: PaymentMethodData[];
  /**
   * @member {PaymentDetails} [details] Details for this request
   */
  details: PaymentDetails;
  /**
   * @member {PaymentOptions} [options] Provides information about the options
   * desired for the payment request
   */
  options: PaymentOptions;
  /**
   * @member {string} [expires] Expiration for this request, in ISO 8601
   * duration format (e.g., 'P1D')
   */
  expires: string;
}

/**
 * @interface
 * An interface representing PaymentResponse.
 * A PaymentResponse is returned when a user has selected a payment method and
 * approved a payment request
 *
 */
export interface PaymentResponse {
  /**
   * @member {string} [methodName] The payment method identifier for the
   * payment method that the user selected to fulfil the transaction
   */
  methodName: string;
  /**
   * @member {any} [details] A JSON-serializable object that provides a payment
   * method specific message used by the merchant to process the transaction
   * and determine successful fund transfer
   */
  details: any;
  /**
   * @member {PaymentAddress} [shippingAddress] If the requestShipping flag was
   * set to true in the PaymentOptions passed to the PaymentRequest
   * constructor, then shippingAddress will be the full and final shipping
   * address chosen by the user
   */
  shippingAddress: PaymentAddress;
  /**
   * @member {string} [shippingOption] If the requestShipping flag was set to
   * true in the PaymentOptions passed to the PaymentRequest constructor, then
   * shippingOption will be the id attribute of the selected shipping option
   */
  shippingOption: string;
  /**
   * @member {string} [payerEmail] If the requestPayerEmail flag was set to
   * true in the PaymentOptions passed to the PaymentRequest constructor, then
   * payerEmail will be the email address chosen by the user
   */
  payerEmail: string;
  /**
   * @member {string} [payerPhone] If the requestPayerPhone flag was set to
   * true in the PaymentOptions passed to the PaymentRequest constructor, then
   * payerPhone will be the phone number chosen by the user
   */
  payerPhone: string;
}

/**
 * @interface
 * An interface representing PaymentRequestComplete.
 * Payload delivered when completing a payment request
 *
 */
export interface PaymentRequestComplete {
  /**
   * @member {string} [id] Payment request ID
   */
  id: string;
  /**
   * @member {PaymentRequest} [paymentRequest] Initial payment request
   */
  paymentRequest: PaymentRequest;
  /**
   * @member {PaymentResponse} [paymentResponse] Corresponding payment response
   */
  paymentResponse: PaymentResponse;
}

/**
 * @interface
 * An interface representing PaymentRequestCompleteResult.
 * Result from a completed payment request
 *
 */
export interface PaymentRequestCompleteResult {
  /**
   * @member {string} [result] Result of the payment request completion
   */
  result: string;
}

/**
 * @interface
 * An interface representing PaymentRequestUpdate.
 * An update to a payment request
 *
 */
export interface PaymentRequestUpdate {
  /**
   * @member {string} [id] ID for the payment request to update
   */
  id: string;
  /**
   * @member {PaymentDetails} [details] Update payment details
   */
  details: PaymentDetails;
  /**
   * @member {PaymentAddress} [shippingAddress] Updated shipping address
   */
  shippingAddress: PaymentAddress;
  /**
   * @member {string} [shippingOption] Updated shipping options
   */
  shippingOption: string;
}

/**
 * @interface
 * An interface representing PaymentRequestUpdateResult.
 * A result object from a Payment Request Update invoke operation
 *
 */
export interface PaymentRequestUpdateResult {
  /**
   * @member {PaymentDetails} [details] Update payment details
   */
  details: PaymentDetails;
}

/**
 * @interface
 * An interface representing ConversationsGetConversationsOptionalParams.
 * Optional Parameters.
 *
 * @extends RequestOptionsBase
 */
export interface ConversationsGetConversationsOptionalParams extends RequestOptionsBase {
  /**
   * @member {string} [continuationToken] skip or continuation token
   */
  continuationToken: string;
}

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
export enum RoleTypes {
  User = 'user',
  Bot = 'bot',
}

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
export enum ActivityTypes {
  Message = 'message',
  ContactRelationUpdate = 'contactRelationUpdate',
  ConversationUpdate = 'conversationUpdate',
  Typing = 'typing',
  Ping = 'ping',
  EndOfConversation = 'endOfConversation',
  Event = 'event',
  Invoke = 'invoke',
  DeleteUserData = 'deleteUserData',
  MessageUpdate = 'messageUpdate',
  MessageDelete = 'messageDelete',
  InstallationUpdate = 'installationUpdate',
  MessageReaction = 'messageReaction',
  Suggestion = 'suggestion',
  Trace = 'trace',
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
export enum TextFormatTypes {
  Markdown = 'markdown',
  Plain = 'plain',
  Xml = 'xml',
}

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
export enum AttachmentLayoutTypes {
  List = 'list',
  Carousel = 'carousel',
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
export enum MessageReactionTypes {
  Like = 'like',
  PlusOne = 'plusOne',
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
export enum InputHints {
  AcceptingInput = 'acceptingInput',
  IgnoringInput = 'ignoringInput',
  ExpectingInput = 'expectingInput',
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
export enum ActionTypes {
  OpenUrl = 'openUrl',
  ImBack = 'imBack',
  PostBack = 'postBack',
  PlayAudio = 'playAudio',
  PlayVideo = 'playVideo',
  ShowImage = 'showImage',
  DownloadFile = 'downloadFile',
  Signin = 'signin',
  Call = 'call',
  Payment = 'payment',
  MessageBack = 'messageBack',
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
export enum EndOfConversationCodes {
  Unknown = 'unknown',
  CompletedSuccessfully = 'completedSuccessfully',
  UserCancelled = 'userCancelled',
  BotTimedOut = 'botTimedOut',
  BotIssuedInvalidMessage = 'botIssuedInvalidMessage',
  ChannelFailed = 'channelFailed',
}

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
export enum ContactRelationUpdateActionTypes {
  Add = 'add',
  Remove = 'remove',
}

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
export enum InstallationUpdateActionTypes {
  Add = 'add',
  Remove = 'remove',
}

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
export enum ActivityImportance {
  Low = 'low',
  Normal = 'normal',
  High = 'high',
}

/**
 * @interface
 * An interface representing a collection of
 * Azure Active Directory resource URLs
 */
export interface AadResourceUrls {
  /**
   * @member {string[]} [resourceUrls] A collection of resource URLs
   */
  resourceUrls: string[];
}

/**
 * @interface
 * An interface representing a mapping of names to TokenResponses.
 */
export interface TokenResponseMap {
  [resourceUrl: string]: TokenResponse;
}