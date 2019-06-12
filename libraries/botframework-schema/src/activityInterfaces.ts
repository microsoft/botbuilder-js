import { ActivityImportance, ActivityTypes, Attachment, AttachmentLayoutTypes, ChannelAccount, ConversationAccount, ConversationReference, DeliveryModes, EndOfConversationCodes, Entity, InputHints, MessageReaction, SuggestedActions, TextFormatTypes, TextHighlight } from './index';

export interface IActivity {

    /**
     * Contains the activity type 'iActivity'
     */
    type: ActivityTypes | string;

    /**
     * Contains an ID that uniquely identifies the activity on the channel.
     */
    id?: string;

    /**
     * Contains the URL that specifies the channel's service endpoint. Set by the channel.
     */
    serviceUrl: string;

    /**
     * Contains the date and time that the message was sent, in UTC, expressed in ISO-8601 format.
     */
    timestamp?: Date;

    /**
     * Contains the local date and time of the message, expressed in ISO-8601 format.
     * 
     * For example, 2016-09-23T13:07:49.4714686-07:00.
     */
    localTimestamp?: Date;

    /**
     * Contains an ID that uniquely identifies the channel. Set by the channel.
     */
    channelId: string;

    /**
     * Identifies the sender of the message.
     */
    from: ChannelAccount;

    /**
     * Identifies the conversation to which the activity belongs.
     */
    conversation: ConversationAccount;

    /**
     * Identifies the recipient of the message.
     */
    recipient: ChannelAccount;

    /**
     * Contains the ID of the message to which this message is a reply.
     */
    replyToId?: string;

    /**
     * Represents the entities that were mentioned in the message.
     */
    entities?: Entity[];

    /**
     * Contains channel-specific content.
     */
    channelData?: any;
}

export interface IConversationUpdateActivity extends IActivity {

    /**
     * The collection of members added to the conversation.
     */
    membersAdded?: ChannelAccount[];

    /**
     * The collection of members removed from the conversation.
     */
    membersRemoved?: ChannelAccount[];

    /**
     * The updated topic name of the conversation.
     */
    topicName?: string;

    /**
     * Indicates whether the prior history of the channel is disclosed.
     */
    historyDisclosed?: boolean;
}

export interface IContactRelationUpdateActivity extends IActivity {

    /**
     * Indicates whether the recipient of a contactRelationUpdate was added or removed from the
     * sender's contact list.
     */
    action?: string;
}

export interface IInstallationUpdateActivity extends IActivity {

    /**
     * Indicates whether the recipient of a contactRelationUpdate was added or removed from the
     * sender's contact list.
     */
    action?: string;
}

export interface IMessageActivity extends IActivity {

    /**
     * A locale name for the contents of the text field.
     * The locale name is a combination of an ISO 639 two- or three-letter culture code associated
     * with a language
     * and an ISO 3166 two-letter subculture code associated with a country or region.
     * The locale name can also correspond to a valid BCP-47 language tag.
     */
    locale?: string;

    /**
     * The text content of the message.
     */
    text: string;

    /**
     * The text to speak.
     */
    speak?: string;

    /**
     * Indicates whether your bot is accepting,
     * expecting, or ignoring user input after the message is delivered to the client. Possible
     * values include: 'acceptingInput', 'ignoringInput', 'expectingInput'
     */
    inputHint?: InputHints | string;

    /**
     * The text to display if the channel cannot render cards.
     */
    summary?: string;

    /**
     * Format of text fields Default:markdown. Possible values include: 'markdown', 'plain', 'xml'
     */
    textFormat?: TextFormatTypes | string;

    /**
     * The layout hint for multiple attachments. Default: list. Possible values include: 'list',
     * 'carousel'
     */
    attachmentLayout?: AttachmentLayoutTypes | string;

    /**
     * Attachments
     */
    attachments?: Attachment[];

    /**
     * The suggested actions for the activity.
     */
    suggestedActions?: SuggestedActions;

    /**
     * The importance of the activity. Possible values include: 'low', 'normal', 'high'
     */
    importance?: ActivityImportance | string;

    /**
     * A delivery hint to signal to the recipient alternate delivery paths for the activity.
     * The default delivery mode is "default". Possible values include: 'normal', 'notification'
     */
    deliveryMode?: DeliveryModes | string;

    /**
     * The time at which the activity should be considered to be "expired" and should not be
     * presented to the recipient.
     */
    expiration?: Date;

    /**
     * A value that is associated with the activity.
     */
    value?: any;
}

export interface IMessageUpdateActivity extends IMessageActivity, IActivity {
}

export interface IMessageDeleteActivity extends IActivity {
}

export interface IMessageReactionActivity extends IActivity {

    /**
     * The collection of reactions added to the conversation.
     */
    reactionsAdded?: MessageReaction[];

    /**
     * The collection of reactions removed from the conversation.
     */
    reactionsRemoved?: MessageReaction[];
}

export interface ISuggestionActivity extends IMessageActivity, IActivity {

    /**
     * The collection of text fragments to highlight when the activity contains a ReplyToId value.
     */
    textHighlights?: TextHighlight[];
}

export interface ITypingActivity extends IActivity {
}

export interface IEndOfConversationActivity extends IActivity {

    /**
     * The a code for endOfConversation activities that indicates why the conversation ended.
     * Possible values include: 'unknown', 'completedSuccessfully', 'userCancelled', 'botTimedOut',
     * 'botIssuedInvalidMessage', 'channelFailed'
     */
    code?: EndOfConversationCodes | string;

    /**
     * The text content of the message.
     */
    text: string;
}

export interface IEventActivity extends IActivity {

    /**
     * The name of the operation associated with an invoke or event activity.
     */
    name?: string;

    /**
     * A value that is associated with the activity.
     */
    value?: any;

    /**
     * A reference to another conversation or activity.
     */
    relatesTo?: ConversationReference;
}

export interface IInvokeActivity extends IActivity {

    /**
     * The name of the operation associated with an invoke or event activity.
     */
    name?: string;

    /**
     * A value that is associated with the activity.
     */
    value?: any;

    /**
     * A reference to another conversation or activity.
     */
    relatesTo?: ConversationReference;
}

export interface ITraceActivity extends IActivity {

    /**
     * The name of the operation associated with an invoke or event activity.
     */
    name?: string;

    /**
     * A descriptive label for the activity.
     */
    label: string;

    /**
     * The type of the activity's value object.
     */
    valueType: string;

    /**
     * A value that is associated with the activity.
     */
    value?: any;

    /**
     * A reference to another conversation or activity.
     */
    relatesTo?: ConversationReference;
}

export interface IHandoffActivity extends IActivity {
}

