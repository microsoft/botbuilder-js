/**
 * @module botbuilder
 */

/**
 * Attachment View name and size
 */
export interface AttachmentView {
  /** Content type of the attachment. */
  viewId?: string;

  /** Name of the attachment. */
  size?: number;
}

/**
 * Metadata for an attachment.
 */
export interface AttachmentInfo {
  /** Name of the attachment. */
  name?: string;

  /** ContentType of the attachment. */
  type?: string;

  /** Attachment views. */
  views?: AttachmentView[];
}

/**
 * Channel account information needed to route an activity.
 */
export interface ChannelAccount {
  /** Channel id for the user or bot on this channel (Example: joe@smith.com, or @joesmith or 123456). */
  id?: string;

  /** Display friendly name. */
  name?: string;
}

/**
 * Channel account information for a conversation.
 */
export interface ConversationAccount extends ChannelAccount {
  /** Is this a reference to a group. */
  isGroup?: boolean;
}

/**
 * An action on a card.
 *
 * @member {string} [type] 
 *
 * @member {string} [title] 
 *
 * @member {string} [image] 
 *
 * @member {object} [value] 
 *
 */
export interface CardAction {
  /** Defines the type of action implemented by this button. */
  type?: string;

  /** Text description which appear on the button. */
  title?: string;

  /** URL Picture which will appear on the button, next to text label. */
  image?: string;

  /** Supplementary parameter for action. Content of this property depends on the [type](#type). */
  value?: any;
}

/**
 * SuggestedActions that can be performed.
 */
export interface SuggestedActions {
  /** 
   * Ids of the recipients that the actions should be shown to.  These Ids are relative to the 
   * channelId and a subset of all recipients of the activity. 
   */
  to?: string[];

  /** Actions that can be shown to the user. */
  actions?: CardAction[];
}

/**
 * An attachment within an activity.
 *
 * @member {string} [contentType] 
 *
 * @member {string} [contentUrl] 
 *
 * @member {object} [content] 
 *
 * @member {string} [name] 
 *
 * @member {string} [thumbnailUrl] 
 *
 */
export interface Attachment {
  /** Mimetype/Contenttype for the file. */
  contentType?: string;

  /** Content Url. */
  contentUrl?: string;

  /** Embedded content. */
  content?: any;

  /** (OPTIONAL) The name of the attachment. */
  name?: string;

  /** (OPTIONAL) Thumbnail associated with attachment. */
  thumbnailUrl?: string;
}

/**
 * Object of schema.org types.
 */
export interface Entity {
  /** Entity Type (typically from schema.org types). */
  type?: string;
}

/**
 * An object relating to a particular point in a conversation.
 */
export interface ConversationReference {
  /** (Optional) ID of the activity to refer to. */
  activityId?: string;

  /** (Optional) User participating in this conversation. */
  user?: ChannelAccount;

  /** Bot participating in this conversation. */
  bot?: ChannelAccount;

  /** Conversation reference. */
  conversation?: ConversationAccount;

  /** Channel ID. */
  channelId?: string;

  /** Service endpoint where operations concerning the referenced conversation may be performed. */
  serviceUrl?: string;
}

/**
 * An Activity is the basic communication type for the Bot Framework 3.0
 * protocol.
 */
export interface Activity {
  /** The type of the activity. */
  type?: string;

  /** ID of this activity. */
  id?: string;

  /** UTC Time when message was sent (set by service). */
  timestamp?: string;

  /** Local time when message was sent (set by client, Ex: 2016-09-23T13:07:49.4714686-07:00). */
  localTimestamp?: string;

  /** Service endpoint where operations concerning the activity may be performed. */
  serviceUrl?: string;

  /** ID of the channel where the activity was sent. */
  channelId?: string;

  /** Sender address. */
  from?: ChannelAccount;

  /** Conversation. */
  conversation?: ConversationAccount;

  /** (Outbound to bot only) Bot's address that received the message. */
  recipient?: ChannelAccount;

  /** Format of text fields. The default value is `TextFormats.markdown`. */
  textFormat?: string;

  /** Hint for how to deal with multiple attachments. The default value is `AttachmentLayouts.list` */
  attachmentLayout?: string;

  /** Array of address added. */
  membersAdded?: ChannelAccount[];

  /** Array of addresses removed. */
  membersRemoved?: ChannelAccount[];

  /** Conversations new topic name. */
  topicName?: string;

  /** True if the previous history of the channel is disclosed. */
  historyDisclosed?: boolean;

  /** The language code of the Text field. */
  locale?: string;

  /** Content for the message. */
  text?: string;

  /** SSML Speak for TTS audio response. */
  speak?: string;

  /** Indicates whether the bot is accepting, expecting, or ignoring input. */
  inputHint?: string;

  /** Text to display if the channel cannot render cards. */
  summary?: string;

  /** SuggestedActions are used to provide keyboard/quickreply like behavior in many clients. */
  suggestedActions?: SuggestedActions;

  /** Attachments. */
  attachments?: Attachment[];

  /** 
   * Collection of Entity objects, each of which contains metadata about this activity. 
   * Each Entity object is typed. */
  entities?: Entity[];

  /** Channel-specific payload. */
  channelData?: any;

  /** ContactAdded/Removed action. */
  action?: string;

  /** The original ID this message is a response to. */
  replyToId?: string;

  /** Open-ended value. */
  value?: any;

  /** Name of the operation to invoke or the name of the event. */
  name?: string;

  /** Reference to another conversation or activity. */
  relatesTo?: ConversationReference;

  /** Code indicating why the conversation has ended. */
  code?: string;
    
  /** Array of reactions added to an activity. */
  reactionsAdded?: MessageReaction[];
  
  /** Array of reactions removed from an activity. */
  reactionsRemoved?: MessageReaction[];
}

/** Message reaction object. */
export interface MessageReaction {
  /** Message reaction type. */
  type: string;
}

/**
 * Parameters for creating a new conversation.
 */
export interface ConversationParameters {
  /** If true this is a group conversation. */
  isGroup?: boolean;

  /** The bot address for this conversation. */
  bot?: ChannelAccount;

  /** Members to add to the conversation. */
  members?: ChannelAccount[];

  /** (Optional) Topic of the conversation (if supported by the channel). */
  topicName?: string;

  /** 
   * (Optional) When creating a new conversation, use this activity as the initial message 
   * to the conversation. 
   */
  activity?: Activity;

  /** Channel specific payload for creating the conversation. */
  channelData?: any;
}

/**
 * A response containing a resource.
 */
export interface ConversationResourceResponse {
  /** ID of the Activity (if sent). */
  activityId?: string;

  /** Service endpoint where operations concerning the conversation may be performed. */
  serviceUrl?: string;

  /** Id of the resource. */
  id?: string;
}

/**
 * A response containing a resource ID.
 */
export interface ResourceResponse {
  /** Id of the resource. */
  id?: string;
}

/**
 * Attachment data.
 */
export interface AttachmentData {
  /** Content type of the attachment. */
  type?: string;

  /** Name of the attachment. */
  name?: string;

  /** Original content. */
  originalBase64?: Buffer;

  /** Thumbnail. */
  thumbnailBase64?: Buffer;
}

/**
 * An image on a card
 */
export interface CardImage {
  /** URL Thumbnail image for major content property. */
  url?: string;

  /** Image description intended for screen readers. */
  alt?: string;

  /** Action assigned to specific Attachment.E.g.navigate to specific URL or play/open media content. */
  tap?: CardAction;
}

/**
 * A Hero card (card with a single, large image).
 */
export interface HeroCard {
  /** Title of the card. */
  title?: string;

  /**  Subtitle of the card. */
  subtitle?: string;

  /** Text for the card. */
  text?: string;

  /** Array of images for the card. */
  images?: CardImage[];

  /** Set of actions applicable to the current card. */
  buttons?: CardAction[];

  /** This action will be activated when user taps on the card itself. */
  tap?: CardAction;
}

/**
 * A thumbnail card (card with a single, small thumbnail image).
 */
export interface ThumbnailCard {
  /** Title of the card. */
  title?: string;
  
    /**  Subtitle of the card. */
    subtitle?: string;
  
    /** Text for the card. */
    text?: string;
  
    /** Array of images for the card. */
    images?: CardImage[];
  
    /** Set of actions applicable to the current card. */
    buttons?: CardAction[];
  
    /** This action will be activated when user taps on the card itself. */
    tap?: CardAction;
  }

/**
 * An item on a receipt card.
 */
export interface ReceiptItem {
  /** Title of the Card. */
  title?: string;

  /** Subtitle appears just below [Title](#title) field, differs from Title in font styling only. */
  subtitle?: string;

  /** Text field appears just below [Subtitle](#subtitle), differs from Subtitle in font styling only. */
  text?: string;

  /** Items image. */
  image?: CardImage;

  /** Amount with currency. */
  price?: string;

  /** Number of items of given kind. */
  quantity?: string;

  /** This action will be activated when user taps on the item bubble. */
  tap?: CardAction;
}

/**
 * Set of key-value pairs. Advantage of this section is that key and value  properties will be
 * rendered with default style information with some delimiter between them. So there is no 
 * need for developer to specify style information.
 */
export interface Fact {
  /** The key for this Fact. */
  key?: string;

  /** The value for this Fact. */
  value?: string;
}

/**
 * A receipt card
 */
export interface ReceiptCard {
  /** Title of the card. */
  title?: string;

  /** Array of Receipt Items. */
  items?: ReceiptItem[];

  /** Array of Fact Objects (Array of key-value pairs.) */
  facts?: Fact[];

  /** This action will be activated when user taps on the card. */
  tap?: CardAction;

  /** Total amount of money paid (or should be paid). */
  total?: string;

  /** Total amount of TAX paid(or should be paid). */
  tax?: string;

  /** Total amount of VAT paid(or should be paid). */
  vat?: string;

  /** Set of actions applicable to the current card. */
  buttons?: CardAction[];
}

/**
 * A card representing a request to sign in.
 */
export interface SigninCard {
  /**  Text for signin request. */
  text?: string;

  /**  Text for signin request. */
  buttons?: CardAction[];
}

/**
 * Object describing a media thumbnail.
 */
export interface ThumbnailUrl {
  /** url pointing to an thumbnail to use for media content. */
  url?: string;

  /** Alt text to display for screen readers on the thumbnail image. */
  alt?: string;
}

/**
 * MediaUrl data.
 */
export interface MediaUrl {
  /** Url for the media. */
  url?: string;

  /** Optional profile hint to the client to differentiate multiple MediaUrl objects from each other. */
  profile?: string;
}

/**
 * A audio card.
 */
export interface AudioCard {
  /** Aspect ratio of thumbnail/media placeholder, allowed values are "16x9" and "9x16". */
  aspect?: string;

  /** Title of the card. */
  title?: string;

  /** Subtitle of the card. */
  subtitle?: string;
  
  /** Text of the card. */
  text?: string;

  /** Thumbnail placeholder. */
  image?: ThumbnailUrl;

  /** Array of media Url objects. */
  media?: MediaUrl[];

  /** Set of actions applicable to the current card. */
  buttons?: CardAction[];

  /** Is it OK for this content to be shareable with others. The default value is true. */
  shareable?: boolean;

  /** Should the client loop playback at end of content. The default value is true. */
  autoloop?: boolean;

  /** Should the client automatically start playback of video in this card. The default value is true. */
  autostart?: boolean;
}

/**
 * An animation card (Ex: gif or short video clip).
 */
export interface AnimationCard {
  /** Title of the card. */
  title?: string;
  
  /** Subtitle of the card. */
  subtitle?: string;
  
  /** Text of the card. */
  text?: string;

  /** Thumbnail placeholder. */
  image?: ThumbnailUrl;

  /** Array of media Url objects. */
  media?: MediaUrl[];

  /** Set of actions applicable to the current card. */
  buttons?: CardAction[];

  /** Is it OK for this content to be shareable with others. The default value is true. */
  shareable?: boolean;

  /** Should the client loop playback at end of content. The default value is true. */
  autoloop?: boolean;

  /** Should the client automatically start playback of video in this card. The default value is true. */
  autostart?: boolean;
}

/**
 * A video card.
 */
export interface VideoCard {
  /** Aspect ratio of thumbnail/media placeholder, allowed values are "16x9" and "9x16". */
  aspect?: string;
  
  /** Title of the card. */
  title?: string;

  /** Subtitle of the card. */
  subtitle?: string;
  
  /** Text of the card. */
  text?: string;

  /** Thumbnail placeholder. */
  image?: ThumbnailUrl;

  /** Array of media Url objects. */
  media?: MediaUrl[];

  /** Set of actions applicable to the current card. */
  buttons?: CardAction[];

  /** Is it OK for this content to be shareable with others. The default value is true. */
  shareable?: boolean;

  /** Should the client loop playback at end of content. The default value is true. */
  autoloop?: boolean;

  /** Should the client automatically start playback of video in this card. The default value is true. */
  autostart?: boolean;
}

/**
 * GeoCoordinates (entity type: "https://schema.org/GeoCoordinates").
 */
export interface GeoCoordinates {
  /** Elevation of the location [WGS 84](https://en.wikipedia.org/wiki/World_Geodetic_System). */
  elevation?: number;

  /** Latitude of the location [WGS 84](https://en.wikipedia.org/wiki/World_Geodetic_System). */
  latitude?: number;

  /** Longitude of the location [WGS 84](https://en.wikipedia.org/wiki/World_Geodetic_System). */
  longitude?: number;

  /** The type of the thing. */
  type?: string;

  /** The name of the thing. */
  name?: string;
}

/**
 * Place (entity type: "https://schema.org/Place")
 */
export interface Place {
  /** Address of the place (may be `string` or complex object of type `PostalAddress`). */
  address?: any;

  /** Geo coordinates of the place (may be complex object of type `GeoCoordinates` or `GeoShape`). */
  geo?: any;

  /** Map to the place (may be `string` (URL) or complex object of type `Map`). */
  hasMap?: any;

  /** The type of the thing. */
  type?: string;

  /** The name of the thing. */
  name?: string;
}
/* istanbul ignore file */
