//=============================================================================
//
// TYPES
//
//=============================================================================

/**
 * Text based prompts that can be sent to a user.
 * * _{string}_ - A simple message to send the user.
 * * _{string[]}_ - Array of possible messages to send the user. One will be chosen at random.
 */
export type TextType = string|string[];

/**
 * Message based prompts that can be sent to a user.
 * * _{IMessage}_ - Message to send the user expressed using JSON. The message can contain attachments and suggested actions. Not all channels natively support all message properties but most channels will down render unsupported fields.
 * * _{IIsMessage}_ - An instance of the [Message](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.message.html) builder class. This class helps to localize your messages and provides helpers to aid with formatting the text portions of your message.
 */
export type MessageType = IMessage|IIsMessage;

/**
 * Flexible range of possible prompts that can be sent to a user.
 * * _{string}_ - A simple message to send the user.
 * * _{string[]}_ - Array of possible messages to send the user. One will be chosen at random.
 * * _{IMessage}_ - Message to send the user expressed using JSON. The message can contain attachments and suggested actions. Not all channels natively support all message properties but most channels will down render unsupported fields.
 * * _{IIsMessage}_ - An instance of the [Message](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.message.html) builder class. This class helps to localize your messages and provides helpers to aid with formatting the text portions of your message.
 */
export type TextOrMessageType = string|string[]|IMessage|IIsMessage;

/**
 * Some methods can take either an `IAttachment` in JSON form or one the various card builder classes
 * that implement `IIsAttachment`.
 */
export type AttachmentType = IAttachment|IIsAttachment;

/**
 * Supported rules for matching a users utterance.
 * * _{RegExp}_ - A regular expression will be used to match the users utterance.
 * * _{string}_ - A named intent returned from a recognizer will be used to match the users utterance.
 * * _{(RegExp|string)[]}_ - An array of either regular expressions or named intents can be passed to match the users utterance in a number of possible ways. The rule generating the highest score (best match) will be used for scoring purposes.
 */
export type MatchType = RegExp|string|(RegExp|string)[];

/**
 * List of text values. The values can be expressed as a pipe delimited string like "value1|value2|value3"
 * or simple array of values.
 */
export type ValueListType = string|string[];

//=============================================================================
//
// INTERFACES
//
//=============================================================================

/**
 * An event received from or being sent to a source.
 * @example
 * <pre><code>
 * session.send({ type: 'typing' });
 * </code></pre>
 */
export interface IEvent {
    /** Defines type of event. Should be 'message' for an IMessage. */
    type: string;

    /** SDK thats processing the event. Will always be 'botbuilder'. */
    agent: string;

    /** The original source of the event (i.e. 'facebook', 'skype', 'slack', etc.) */
    source: string;

    /** The original event in the sources native schema. For outgoing messages can be used to pass source specific event data like custom attachments. */
    sourceEvent: any;

    /** Address routing information for the event. Save this field to external storage somewhere to later compose a proactive message to the user. */
    address: IAddress;

    /**
     * For incoming messages this is the user that sent the message. By default this is a copy of [address.user](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iaddress.html#user) but you can configure your bot with a
     * [lookupUser](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iuniversalbotsettings.html#lookupuser) function that lets map the incoming user to an internal user id.
     */
    user: IIdentity;

    /** The ID of the event this update is related to. */
    replyToId?: string;
}

/**
 * The Properties of a conversation have changed.
 * @example
 * <pre><code>
 * bot.on('conversationUpdate', function (update) {
 *     // ... process update ...
 * });
 * </code></pre>
 */
export interface IConversationUpdate extends IEvent {
    /** Array of members added to the conversation. */
    membersAdded?: IIdentity[];

    /** Array of members removed from the conversation. */
    membersRemoved?: IIdentity[];

    /** Array of reactions added to an activity. */
    reactionsAdded?: IMessageReaction[];

    /** Array of reactions removed from an activity. */
    reactionsRemoved?: IMessageReaction[];

    /** The conversations new topic name. */
    topicName?: string;

    /** If true then history was disclosed. */
    historyDisclosed?: boolean;
}

/**
 * The Properties of a message have changed.
 * @example
 * <pre><code>
 * bot.on('messageReaction', function (update) {
 *     // ... process update ...
 * });
 * </code></pre>
 */
export interface IMessageUpdate extends IEvent {
    /** Array of reactions added to an activity. */
    reactionsAdded?: IMessageReaction[];

    /** Array of reactions removed from an activity. */
    reactionsRemoved?: IMessageReaction[];
}

/** Message reaction object. */
export interface IMessageReaction {
    /** Message reaction type. */
    type: string;
}

/**
 * A user has updated their contact list.
/**
 * A user has updated their contact list.
 * @example
 * <pre><code>
 * bot.on('contactRelationUpdate', function (update) {
 *     // ... process update ...
 * });
 * </code></pre>
 */
export interface IContactRelationUpdate extends IEvent {
    /** The action taken. Valid values are "add" or "remove". */
    action: string;
}

/**
 * A chat message sent between a User and a Bot. Messages from the bot to the user come in two flavors:
 *
 * * __reactive messages__ are messages sent from the Bot to the User as a reply to an incoming message from the user.
 * * __proactive messages__ are messages sent from the Bot to the User in response to some external event like an alarm triggering.
 *
 * In the reactive case the you should copy the [address](#address) field from the incoming message to the outgoing message (if you use the [Message]( /en-us/node/builder/chat-reference/classes/_botbuilder_d_.message.html) builder class and initialize it with the
 * [session](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.session.html) this will happen automatically) and then set the [text](#text) or [attachments](#attachments).  For proactive messages you’ll need save the [address](#address) from the incoming message to
 * an external storage somewhere. You can then later pass this in to [UniversalBot.beginDialog()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.universalbot.html#begindialog) or copy it to an outgoing message passed to
 * [UniversalBot.send()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.universalbot.html#send).
 *
 * Composing a message to the user using the incoming address object will by default send a reply to the user in the context of the current conversation. Some channels allow for the starting of new conversations with the user. To start a new proactive conversation with the user simply delete
 * the [conversation](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iaddress.html#conversation) field from the address object before composing the outgoing message.
 * @example
 * <pre><code>
 * session.send({
 *      type: 'message',
 *      text: "Hello World!"
 * });
 * </code></pre>
 */
export interface IMessage extends IEvent {
    /** UTC Time when message was sent (set by service.) */
    timestamp?: string;

    /** Local time when message was sent (set by client or bot, Ex: 2016-09-23T13:07:49.4714686-07:00.) */
    localTimestamp?: string;

    /** Text to be displayed by as fall-back and as short description of the message content in e.g. list of recent conversations. */
    summary?: string;

    /** Spoken message as [Speech Synthesis Markup Language](https://msdn.microsoft.com/en-us/library/hh378377(v=office.14).aspx). */
    speak?: string;

    /** Message text. */
    text?: string;

    /** Identified language of the message text if known. */
    textLocale?: string;

    /** For incoming messages contains attachments like images sent from the user. For outgoing messages contains objects like cards or images to send to the user.   */
    attachments?: IAttachment[];

    /** Structured objects passed to the bot or user. */
    entities?: any[];

    /** Format of text fields. The default value is 'markdown'. */
    textFormat?: string;

    /** Hint for how clients should layout multiple attachments. The default value is 'list'. */
    attachmentLayout?: string;

    /** Hint for clients letting them know if the bot is expecting further input or not. The built-in prompts will automatically populate this value for outgoing messages. */
    inputHint?: string;

    /** Open-ended value. */
    value?: any;

    /** Name of the operation to invoke or the name of the event. */
    name?: string;

    /** Reference to another conversation or message. */
    relatesTo?: IAddress;

    /** Code indicating why the conversation has ended. */
    code?: string;
}

/**
 * Implemented by classes that can be converted into an IMessage, like the [Message](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.message) builder class.
 * @example
 * <pre><code>
 * var msg = new builder.Message(session)
 *      .text("Hello World!");
 * session.send(msg);
 * </code></pre>
 */
export interface IIsMessage {
    /** Returns the JSON object for the message. */
    toMessage(): IMessage;
}

/**
 * Optional message properties that can be sent to things like prompts or [session.say()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.session#say).
 * @example
 * <pre><code>
 * session.say("Please wait...", "<speak>Please wait</speak>", {
 *     inputHint: builder.InputHint.ignoringInput
 * });
 * </code></pre>
 */
export interface IMessageOptions {
    /** For incoming messages contains attachments like images sent from the user. For outgoing messages contains objects like cards or images to send to the user.   */
    attachments?: IAttachment[];

    /** Structured objects passed to the bot or user. */
    entities?: any[];

    /** Format of text fields. The default value is 'markdown'. */
    textFormat?: string;

    /** Hint for how clients should layout multiple attachments. The default value is 'list'. */
    attachmentLayout?: string;

    /** Hint for clients letting them know if the bot is expecting further input or not. The built-in prompts will automatically populate this value for outgoing messages. */
    inputHint?: string;
}

/** Represents a user, bot, or conversation. */
export interface IIdentity {
    /** Channel specific ID for this identity. */
    id: string;

    /** Friendly name for this identity. */
    name?: string;

    /** If true the identity is a group. Typically only found on conversation identities. */
    isGroup?: boolean;
}

/**
 * Address routing information for an [event](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.ievent.html#address).
 * Addresses are bidirectional meaning they can be used to address both incoming and outgoing events.
 * They're also connector specific meaning that [connectors](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iconnector.html)
 * are free to add their own fields to the address.
 *
 * To send a __proactive message__ to a user bots should save the address from a received [message](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.imessage).
 * Depending on the channel addresses can change, so bots should periodically update the address stored for a given
 * user.
 */
export interface IAddress {
    /** Unique identifier for channel. */
    channelId: string;

    /** User that sent or should receive the message. */
    user: IIdentity;

    /** Bot that either received or is sending the message. */
    bot: IIdentity;

    /**
     * Represents the current conversation and tracks where replies should be routed to.
     * Can be deleted to start a new conversation with a [user](#user) on channels that support new conversations.
     */
    conversation?: IIdentity;
}

/** [ChatConnector](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.chatconnector) specific address. */
export interface IChatConnectorAddress extends IAddress {
    /** Incoming Message ID. */
    id?: string;

    /** Specifies the URL to post messages back. */
    serviceUrl?: string;
}

/** Additional properties that can be passed in with the address to [UniversalBot.beginDialog()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.universalbot#begindialog). */
export interface IStartConversationAddress extends IChatConnectorAddress {
    /** (Optional) when creating a new conversation, use this activity as the initial message to the conversation. */
    activity?: any;

    /** (Optional) channel specific payload for creating the conversation. */
    channelData?: any;

    /** (Optional) if true the conversation should be a group conversation. */
    isGroup?: boolean;

    /** (Optional) members to add to the conversation. If missing, the conversation will be started with the [user](#user). */
    members?: IIdentity[];

    /** (Optional) topic of the conversation (if supported by the channel) */
    topicName?: string;
}

/**
 * Many messaging channels provide the ability to attach richer objects. Bot Builder lets you express these attachments in a cross channel way and [connectors](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iconnector.html) will do their best to render the
 * attachments using the channels native constructs. If you desire more control over the channels rendering of a message you can use [IEvent.sourceEvent](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.ievent.html#sourceevent) to provide attachments using
 * the channels native schema. The types of attachments that can be sent varies by channel but these are the basic types:
 *
 * * __Media and Files:__  Basic files can be sent by setting [contentType](#contenttype) to the MIME type of the file and then passing a link to the file in [contentUrl](#contenturl).
 * * __Cards:__  A rich set of visual cards can by setting [contentType](#contenttype) to the cards type and then passing the JSON for the card in [content](#content). If you use one of the rich card builder classes like
 * [HeroCard](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.herocard.html) the attachment will automatically filled in for you.
 */
export interface IAttachment {
    /** MIME type string which describes type of attachment. */
    contentType: string;

    /** (Optional) object structure of attachment. */
    content?: any;

    /** (Optional) reference to location of attachment content. */
    contentUrl?: string;

    /** (Optional) name of the attachment. */
    name?: string;

    /** (Optional) link to the attachments thumbnail. */
    thumbnailUrl?: string;
}

/** Implemented by classes that can be converted into an attachment. */
export interface IIsAttachment {
    /** Returns the JSON object for the attachment. */
    toAttachment(): IAttachment;
}

/** Displays a signin card and button to the user. Some channels may choose to render this as a text prompt and link to click. */
export interface ISigninCard {
    /** Title of the Card. */
    title: string;

    /** Sign in action. */
    buttons: ICardAction[];
}

/**
 * Displays a card to the user using either a smaller thumbnail layout or larger hero layout (the attachments [contentType](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iattachment.html#contenttype) determines which).
 * All of the cards fields are optional so this card can be used to specify things like a keyboard on certain channels. Some channels may choose to render a lower fidelity version of the card or use an alternate representation.
 */
export interface IThumbnailCard {
    /** Title of the Card. */
    title?: string;

    /** Subtitle appears just below Title field, differs from Title in font styling only. */
    subtitle?: string;

    /** Text field appears just below subtitle, differs from Subtitle in font styling only. */
    text?: string;

    /** Messaging supports all media formats: audio, video, images and thumbnails as well to optimize content download. */
    images?: ICardImage[];

    /** This action will be activated when user taps on the card. Not all channels support tap actions and some channels may choose to render the tap action as the titles link. */
    tap?: ICardAction;

    /** Set of actions applicable to the current card. Not all channels support buttons or cards with buttons. Some channels may choose to render the buttons using a custom keyboard. */
    buttons?: ICardAction[];
}

/** Displays a rich receipt to a user for something they've either bought or are planning to buy. */
export interface IReceiptCard {
    /** Title of the Card. */
    title: string;

    /** Array of receipt items. */
    items: IReceiptItem[];

    /** Array of additional facts to display to user (shipping charges and such.) Not all facts will be displayed on all channels. */
    facts: IFact[];

    /** This action will be activated when user taps on the card. Not all channels support tap actions. */
    tap: ICardAction;

    /** Total amount of money paid (or should be paid.) */
    total: string;

    /** Total amount of TAX paid (or should be paid.) */
    tax: string;

    /** Total amount of VAT paid (or should be paid.) */
    vat: string;

    /** Set of actions applicable to the current card. Not all channels support buttons and the number of allowed buttons varies by channel. */
    buttons: ICardAction[];
}

/** An individual item within a [receipt](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.ireceiptcard.html). */
export interface IReceiptItem {
    /** Title of the item. */
    title: string;

    /** Subtitle appears just below Title field, differs from Title in font styling only. On some channels may be combined with the [title](#title) or [text](#text). */
    subtitle: string;

    /** Text field appears just below subtitle, differs from Subtitle in font styling only. */
    text: string;

    /** Image to display on the card. Some channels may either send the image as a separate message or simply include a link to the image. */
    image: ICardImage;

    /** Amount with currency. */
    price: string;

    /** Number of items of given kind. */
    quantity: string;

    /** This action will be activated when user taps on the Item bubble. Not all channels support tap actions. */
    tap: ICardAction;
}

/** Implemented by classes that can be converted into a receipt item. */
export interface IIsReceiptItem {
    /** Returns the JSON object for the receipt item. */
    toItem(): IReceiptItem;
}

/** The action that should be performed when a card, button, or image is tapped.  */
export interface ICardAction {
    /** Defines the type of action implemented by this button. Not all action types are supported by all channels. */
    type: string;

    /** Text description for button actions. */
    title?: string;

    /** Parameter for Action. Content of this property depends on Action type. */
    value: string;

    /** (Optional) Picture to display for button actions. Not all channels support button images. */
    image?: string;

    /** (Optional) Text for this action. */
    text?: string;

    /** (Optional) text to display in the chat feed if the button is clicked. */
    diplayText?: string;
}

/** Implemented by classes that can be converted into a card action. */
export interface IIsCardAction {
    /** Returns the JSON object for the card attachment. */
    toAction(): ICardAction;
}

/** Suggested actions to send to the user and displayed as quick replies. Suggested actions will be displayed only on the channels that support suggested actions. */
export interface ISuggestedActions {

    /** Optional recipients of the suggested actions. Not supported in all channels. */
    to?: string[];

    /** Quick reply actions that can be suggested as part of the message. */
    actions: ICardAction[];
}

/** Implemented by classes that can be converted into suggested actions */
export interface IIsSuggestedActions {
    /** Returns the JSON object for the suggested actions */
    toSuggestedActions(): ISuggestedActions;
}

/** An image on a card. */
export interface ICardImage {
    /** Thumbnail image for major content property. */
    url: string;

    /** Image description intended for screen readers. Not all channels will support alt text. */
    alt: string;

    /** Action assigned to specific Attachment. E.g. navigate to specific URL or play/open media content. Not all channels will support tap actions. */
    tap: ICardAction;
}

/** Implemented by classes that can be converted into a card image. */
export interface IIsCardImage {
    /** Returns the JSON object for the card image. */
    toImage(): ICardImage;
}

/** A fact displayed on a card like a [receipt](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.ireceiptcard.html). */
export interface IFact {
    /** Display name of the fact. */
    key: string;

    /** Display value of the fact. */
    value: string;
}

/** Implemented by classes that can be converted into a fact. */
export interface IIsFact {
    /** Returns the JSON object for the fact. */
    toFact(): IFact;
}

/** Settings used to initialize an ILocalizer implementation. */
interface IDefaultLocalizerSettings {
    /** The path to the parent of the bots locale directory  */
    botLocalePath?: string;

    /** The default locale of the bot  */
    defaultLocale?: string;
}

/** Plugin for localizing messages sent to the user by a bot. */
export interface ILocalizer {
    /**
     * Loads the localized table for the supplied locale, and call's the supplied callback once the load is complete.
     * @param locale The locale to load.
     * @param callback callback that is called once the supplied locale has been loaded, or an error if the load fails.
     */
    load(locale: string, callback: (err: Error) => void): void;

    /**
     * Loads a localized string for the specified language.
     * @param locale Desired locale of the string to return.
     * @param msgid String to use as a key in the localized string table. Typically this will just be the english version of the string.
     * @param namespace (Optional) namespace for the msgid keys.
     */
    trygettext(locale: string, msgid: string, namespace?: string): string;

    /**
     * Loads a localized string for the specified language.
     * @param locale Desired locale of the string to return.
     * @param msgid String to use as a key in the localized string table. Typically this will just be the english version of the string.
     * @param namespace (Optional) namespace for the msgid keys.
     */
    gettext(locale: string, msgid: string, namespace?: string): string;

    /**
     * Loads the plural form of a localized string for the specified language.
     * @param locale Desired locale of the string to return.
     * @param msgid Singular form of the string to use as a key in the localized string table.
     * @param msgid_plural Plural form of the string to use as a key in the localized string table.
     * @param count Count to use when determining whether the singular or plural form of the string should be used.
     * @param namespace (Optional) namespace for the msgid and msgid_plural keys.
     */
    ngettext(locale: string, msgid: string, msgid_plural: string, count: number, namespace?: string): string;
}

/** Persisted session state used to track a conversations dialog stack. */
export interface ISessionState {
    /** Dialog stack for the current session. */
    callstack: IDialogState[];

    /** Timestamp of when the session was last accessed. */
    lastAccess: number;

    /** Version number of the current callstack. */
    version: number;
}

/** An entry on the sessions dialog stack. */
export interface IDialogState {
    /** ID of the dialog. */
    id: string;

    /** Persisted state for the dialog. */
    state: any;
}

/**
  * Results returned by a child dialog to its parent via a call to session.endDialog().
  */
export interface IDialogResult<T> {
    /** The reason why the current dialog is being resumed. Defaults to [ResumeReason.completed](/en-us/node/builder/chat-reference/enums/_botbuilder_d_.resumereason#completed). */
    resumed?: ResumeReason;

    /** ID of the child dialog thats ending. */
    childId?: string;

    /** If an error occurred the child dialog can return the error to the parent. */
    error?: Error;

    /** The users response. */
    response?: T;
}

/** Context of the received message passed to various recognition methods. */
export interface IRecognizeContext {
    /** The message received from the user. For bot originated messages this may only contain the "to" & "from" fields. */
    message: IMessage;

    /** Data for the user that's persisted across all conversations with the bot. */
    userData: any;

    /** Shared conversation data that's visible to all members of the conversation. */
    conversationData: any;

    /** Private conversation data that's only visible to the user. */
    privateConversationData: any;

    /** Data for the active dialog. */
    dialogData: any;

    /** The localizer for the session. */
    localizer: ILocalizer;

    /** The current session logger. */
    logger: SessionLogger;

    /** Returns the users preferred locale. */
    preferredLocale(): string;

    /**
     * Loads a localized string for the messages language. If arguments are passed the localized string
     * will be treated as a template and formatted using [sprintf-js](https://github.com/alexei/sprintf.js) (see their docs for details.)
     * @param msgid String to use as a key in the localized string table. Typically this will just be the english version of the string.
     * @param args (Optional) arguments used to format the final output string.
     */
    gettext(msgid: string, ...args: any[]): string;

    /**
     * Loads the plural form of a localized string for the messages language. The output string will be formatted to
     * include the count by replacing %d in the string with the count.
     * @param msgid Singular form of the string to use as a key in the localized string table. Use %d to specify where the count should go.
     * @param msgid_plural Plural form of the string to use as a key in the localized string table. Use %d to specify where the count should go.
     * @param count Count to use when determining whether the singular or plural form of the string should be used.
     */
    ngettext(msgid: string, msgid_plural: string, count: number): string;

    /** Returns a copy of the current dialog stack for the session. */
    dialogStack(): IDialogState[];

    /** (Optional) The top intent identified for the message. */
    intent?: IIntentRecognizerResult;

    /** (Optional) The name of the library passing the context is from. */
    libraryName?: string;

    /** __DEPRECATED__ use [preferredLocale()](#preferredlocale) instead. */
    locale: string;
}

/** Context passed to `Dialog.recognize()`. */
export interface IRecognizeDialogContext extends IRecognizeContext {
    /** If true the Dialog is the active dialog on the dialog stack. */
    activeDialog: boolean;

    /** Data persisted for the current dialog . */
    dialogData: any;
}

/** Context passed to `ActionSet.findActionRoutes()`. */
export interface IFindActionRouteContext extends IRecognizeContext {
    /** The type of route being searched for. */
    routeType: string;
}

/** Options passed when defining a dialog action. */
export interface IDialogActionOptions {
    /**
     * (Optional) intent(s) used to trigger the action. Either a regular expression or a named
     * intent can be provided and multiple intents can be specified.  When a named intent is
     * provided the action will be matched using the recognizers assigned to the library/bot using
     * [Library.recognizer()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.library#recognizer).
     *
     * If a matches option isn't provided then the action can only be matched if an [onFindAction](#onfindaction)
     * handler is provided.
     */
    matches?: MatchType;

    /** (Optional) minimum score needed to trigger the action using the value of [matches](#matches). The default value is 0.1. */
    intentThreshold?: number;

    /**
     * (Optional) custom handler that's invoked whenever the action is being checked to see if it
     * should be triggered. The handler is passed a context object containing the received message
     * and any intents detected. The handler should return a confidence score for 0.0 to 1.0 and
     * routeData that should be passed in during the `selectActionRoute` call.
     */
    onFindAction?: (context: IFindActionRouteContext, callback: (err: Error, score: number, routeData?: IActionRouteData) => void) => void;

    /**
     * (Optional) custom handler that's invoked whenever the action is triggered.  This lets you
     * customize the behavior of an action. For instance you could clear the dialog stack before
     * the new dialog is started, changing the default behavior which is to just push the new
     * dialog onto the end of the stack.
     *
     * It's important to note that this is not a waterfall and you should call `next()` if you
     * would like the actions default behavior to run.
     */
    onSelectAction?: (session: Session, args?: IActionRouteData, next?: Function) => void;
}


/** Options passed when defining a `beginDialogAction()`. */
export interface IBeginDialogActionOptions extends IDialogActionOptions {
    /** (Optional) arguments to pass to the dialog spawned when the action is triggered. */
    dialogArgs?: any;
}

/** Options passed when defining a `triggerAction()`. */
export interface ITriggerActionOptions extends IBeginDialogActionOptions {
    /**
     * If specified the user will be asked to confirm that they are ok canceling the current
     * uncompleted task.
     */
    confirmPrompt?: TextOrMessageType;

    /**
     * (Optional) custom handler called when a root dialog is being interrupted by another root
     * dialog. This gives the dialog an opportunity to perform custom cleanup logic or to prompt
     * the user to confirm the interruption was intended.
     *
     * It's important to note that this is not a waterfall and you should call `next()` if you
     * would like the actions default behavior to run.
     */
    onInterrupted?: (session: Session, dialogId: string, dialogArgs?: any, next?: Function) => void;
}

/** Options passed when defining a `cancelAction()`. */
export interface ICancelActionOptions extends IDialogActionOptions {
    /**
     * If specified the user will be asked to confirm that they truly would like to cancel an
     * action when triggered.
     */
    confirmPrompt?: TextOrMessageType;
}

/** Arguments passed to a triggered action. */
export interface IActionRouteData {
    /** Named dialog action that was matched. */
    action?: string;

    /** Intent that triggered the action. */
    intent?: IIntentRecognizerResult;

    /** Optional data passed as part of the action binding. */
    data?: string;

    /** ID of the dialog the action is bound to. */
    dialogId?: string;

    /** Index on the dialog stack of the dialog the action is bound to. */
    dialogIndex?: number;
}

/**
 * A choice that can be passed to [Prompts.choice()](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.__global.iprompts#choice)
 * or [PromptRecognizers.recognizeChoices()][/en-us/node/builder/chat-reference/classes/_botbuilder_d_.promptrecognizers#recognizechoices].
 */
export interface IChoice {
    /** Value to return when selected.  */
    value: string;

    /** (Optional) action to use when rendering the choice as a suggested action. */
    action?: ICardAction;

    /** (Optional) list of synonyms to recognize in addition to the value. */
    synonyms?: ValueListType;
}

/** Options passed to [PromptRecognizers.recognizeNumbers()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.promptrecognizers#recognizenumbers). */
export interface IPromptRecognizeNumbersOptions {
    /** (Optional) minimum value allowed. */
    minValue?: number;

    /** (Optional) maximum value allowed. */
    maxValue?: number;

    /** (Optional) if true, then only integers will be recognized. */
    integerOnly?: boolean;
}

/** Options passed to [PromptRecognizers.recognizeTimes()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.promptrecognizers#recognizetimes). */
export interface IPromptRecognizeTimesOptions {
    /** (Optional) Reference date for relative times. */
    refDate?: number;
}

/** Options passed to [PromptRecognizers.recognizeValues()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.promptrecognizers#recognizevalues). */
export interface IPromptRecognizeValuesOptions {
    /**
     * (Optional) if true, then only some of the tokens in a value need to exist to be considered
     * a match. The default value is "false".
     */
    allowPartialMatches?: boolean;

    /**
     * (Optional) maximum tokens allowed between two matched tokens in the utterance. So with
     * a max distance of 2 the value "second last" would match the utterance "second from the last"
     * but it wouldn't match "Wait a second. That's not the last one is it?".
     * The default value is "2".
     */
    maxTokenDistance?: number;
}

/** Options passed to [PromptRecognizers.recognizeChoices()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.promptrecognizers#recognizechoices). */
export interface IPromptRecognizeChoicesOptions extends IPromptRecognizeValuesOptions {
    /** (Optional) If true, the choices value will NOT be recognized over. */
    excludeValue?: boolean;

    /** (Optional) If true, the choices action will NOT be recognized over. */
    excludeAction?: boolean;
}

/** Options passed to the [built-in prompts](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.__global.iprompts). */
export interface IPromptOptions extends IMessageOptions {
    /**
     * (Optional) Initial prompt to send the user. This is typically populated by the `Prompts.xxx()` function.
     */
    prompt?: TextOrMessageType;

    /** (Optional) SSML to send with the initial `prompt`. If the prompt is of type `IMessage` or `IIsMessage`, this value will be ignored. If this value is an array a response will be chosen at random. */
    speak?: TextType;

    /**
     * (Optional) retry prompt to send if the users response isn't understood. Default is to just
     * re-prompt with a customizable system prompt.
     */
    retryPrompt?: TextOrMessageType;

    /** (Optional) SSML to send with the `retryPrompt`. If the retryPrompt is of type `IMessage` or `IIsMessage`, this value will be ignored. If this value is an array a response will be chosen at random. */
    retrySpeak?: TextType;

    /** (Optional) maximum number of times to re-prompt the user. By default the user will be re-prompted indefinitely. */
    maxRetries?: number;

    /** (Optional) flag used to control the re-prompting of a user after a dialog started by an action ends. The default value is true. */
    promptAfterAction?: boolean;

    /** (Optional) type of list to render for PromptType.choice. Default value is ListStyle.auto. */
    listStyle?: ListStyle;

    /** (Optional) reference date when recognizing times. Date expressed in ticks using Date.getTime(). */
    refDate?: number;

    /** (Optional) namespace to use for localization and other purposes. This defaults to the callers namespace. */
    libraryNamespace?: string;

    /** __DEPRECATED__ use [libraryNamespace](#librarynamespace) instead. */
    localizationNamespace?: string;
}

/**
 * Contextual information tracked for a [Prompt](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.prompt). This information can be accessed
 * within a prompt through [session.dialogData](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.session#dialogdata).
 */
export interface IPromptContext {
    /** Options that the prompt was called with. */
    options: IPromptOptions;

    /**
     * Number of times the user has interacted with the prompt. The first message sent to the user
     * is turn-0, the users first reply is turn-1, and so forth.
     */
    turns: number;

    /** Timestamp of the last turn. */
    lastTurn: number;

    /**
     * If true, we're returning from an unexpected interruption and should send the initial turn-0
     * prompt again.
     */
    isReprompt: boolean;

    /**
     * Used to track which [Prompt.matches()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.prompt#matches) handler is active. This is
     * used internally to move the handlers waterfall to the next step.
     */
    activeIntent: string;
}

/** Optional features that should be enabled/disabled when creating a custom [Prompt](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.prompt) */
export interface IPromptFeatures {
    /** If true, then the prompt should not execute it's own recognition logic. The default is "false". */
    disableRecognizer?: boolean;

    /** The default retryPrompt to send should the caller not provide one. */
    defaultRetryPrompt?: TextOrMessageType;

    /** The library namespace to use for the [defaultRetryPrompt](#defaultretryprompt). If not specified then the bots default namespace of "*" will be used. */
    defaultRetryNamespace?: string;
}

/** Optional features for [PromptChoice](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.promptchoice) class. */
export interface IPromptChoiceFeatures extends IPromptFeatures {
    /** (Optional) if true, the prompt will attempt to recognize numbers in the users utterance as the index of the choice to return. The default value is "true". */
    recognizeNumbers?: boolean;

    /** (Optional) if true, the prompt will attempt to recognize ordinals like "the first one" or "the second one" as the index of the choice to return. The default value is "true". */
    recognizeOrdinals?: boolean;

    /** (Optional) if true, the prompt will attempt to recognize the selected value using the choices themselves. The default value is "true". */
    recognizeChoices?: boolean;

    /** (Optional) style to use as the default when the caller specifies ListStyle.auto and it's determined that keyboards aren't supported. The default value is "ListStyle.list". */
    defaultListStyle?: ListStyle;

    /** (Optional) number of items to show in an inline list when a [defaultListStyle](#defaultliststyle) of ListStyle.list is being applied. The default value is "3". Set this value to "0" to disable inline mode. */
    inlineListCount?: number;

    /** (Optional) minimum score from 0.0 - 1.0 needed for a recognized choice to be considered a match. The default value is "0.4". */
    minScore?: number;
}

/**
 * Options passed to [Prompts.choice()](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.__global.iprompts#choice)
 * or in a `session.beginDialog()` call to a custom prompt based on the [PromptChoice](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.promptchoice)
 * class.
 */
export interface IPromptChoiceOptions extends IPromptOptions {
    /**
     * (Optional) List of choices to present to the user. If omitted a [PromptChoice.onChoices()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.promptchoice#onchoices)
     * handler should be provided.
     */
    choices?: IChoice[];
}

/**
 * Options passed to [Prompts.number()](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.__global.iprompts#number)
 * or in a `session.beginDialog()` call to a custom prompt based on the [PromptNumber](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.promptnumber)
 * class.
 */
export interface IPromptNumberOptions extends IPromptOptions {
    /** (Optional) minimum value that can be recognized. */
    minValue?: number;

    /** (Optional) maximum value that can be recognized. */
    maxValue?: number;

    /** (Optional) if true, then only integers will be recognized. The default value is false. */
    integerOnly?: boolean;
}

/**
 * Options passed to [Prompts.text()](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.__global.iprompts#text)
 * or in a `session.beginDialog()` call to a custom prompt based on the [PromptText](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.prompttext)
 * class.
 */
export interface IPromptTextOptions extends IPromptOptions {
    /** (Optional) minimum length that can be recognized. */
    minLength?: number;

    /** (Optional) maximum length that can be recognized. */
    maxLength?: number;
}

/** Optional features for [PromptText](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.prompttext) class. */
export interface IPromptTextFeatures extends IPromptFeatures {
    /**
     * (Optional) The score that should be returned when the prompts [onRecognize()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.prompt#onrecognize)
     * handler is called. The default value is "0.5".
     */
    recognizeScore?: number;
}

/**
 * Options passed to [Prompts.attachment()](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.__global.iprompts#attachment)
 * or in a `session.beginDialog()` call to a custom prompt based on the [PromptAttachment](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.promptattachment)
 * class.
 */
export interface IPromptAttachmentOptions extends IPromptOptions {
    /**
     * (Optional) list of content types the prompt is waiting for. Types ending with '*' will be
     * prefixed matched again the received attachment(s).
     */
    contentTypes?: string|string[];
}

/** Optional features for [PromptAttachment](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.promptattachment) class. */
export interface IPromptAttachmentFeatures extends IPromptFeatures {
    /** (Optional) The score that should be returned when attachments are detected. The default value is "1.0". */
    recognizeScore?: number;
}

/**
 * Route choices to pass to [Prompts.disambiguate()](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.__global.iprompts#disambiguate).
 * The key for the map should be the localized label to display to the user and the value should be
 * the route to select when chosen by the user.  You can pass `null` for the route to give the user the option to cancel.
 * @example
 * <pre><code>
 * builder.Prompts.disambiguate(session, "What would you like to cancel?", {
 *      "Cancel Item": cancelItemRoute,
 *      "Cancel Order": cancelOrderRoute,
 *      "Neither": null
 * });
 * </code></pre>
 */
export interface IDisambiguateChoices {
    [label: string]: IRouteResult;
}

/** Dialog result returned by a system prompt. */
export interface IPromptResult<T> extends IDialogResult<T> {
    /** Type of prompt completing. */
    promptType?: PromptType;
}

/** Result returned from an IPromptRecognizer. */
export interface IPromptRecognizerResult<T> extends IPromptResult<T> {
    /** Returned from a prompt recognizer to indicate that a parent dialog handled (or captured) the utterance. */
    handled?: boolean;
}

/** Strongly typed Text Prompt Result. */
export interface IPromptTextResult extends IPromptResult<string> { }

/** Strongly typed Number Prompt Result. */
export interface IPromptNumberResult extends IPromptResult<number> { }

/** Strongly typed Confirm Prompt Result. */
export interface IPromptConfirmResult extends IPromptResult<boolean> { }

/** Strongly typed Choice Prompt Result. */
export interface IPromptChoiceResult extends IPromptResult<IFindMatchResult> { }

/** Strongly typed Time Prompt Result. */
export interface IPromptTimeResult extends IPromptResult<IEntity> { }

/** Strongly typed Attachment Prompt Result. */
export interface IPromptAttachmentResult extends IPromptResult<IAttachment[]> { }

/** A recognized intent. */
export interface IIntent {
    /** Intent that was recognized. */
    intent: string;

    /** Confidence on a scale from 0.0 - 1.0 that the proper intent was recognized. */
    score: number;
}

/** A recognized entity. */
export interface IEntity {
    /** Type of entity that was recognized. */
    type: string;

    /** Value of the recognized entity. */
    entity: any;

    /** Start position of entity within text utterance. */
    startIndex?: number;

    /** End position of entity within text utterance. */
    endIndex?: number;

    /** Confidence on a scale from 0.0 - 1.0 that the proper entity was recognized. */
    score?: number;
}

/** Options used to configure an [IntentRecognizerSet](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.intentrecognizerset.html). */
export interface IIntentRecognizerSetOptions {
    /** (optional) Minimum score needed to trigger the recognition of an intent. The default value is 0.1. */
    intentThreshold?: number;

    /** (Optional) The order in which the configured [recognizers](#recognizers) should be evaluated. The default order is parallel. */
    recognizeOrder?: RecognizeOrder;

    /** (Optional) list of intent recognizers to run the users utterance through. */
    recognizers?: IIntentRecognizer[];

    /** (Optional) Maximum number of recognizers to evaluate at one time when [recognizerOrder](#recognizerorder) is parallel. */
    processLimit?: number;

    /** (Optional) If true the recognition will stop when a score of 1.0 is encountered. The default value is true.  */
    stopIfExactMatch?: boolean;
}

/** Options used to configure an [IntentDialog](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.intentdialog.html). */
export interface IIntentDialogOptions extends IIntentRecognizerSetOptions {
    /** (Optional) Controls the dialogs processing of incoming user utterances. The default is RecognizeMode.onBeginIfRoot.  The default prior to v3.2 was RecognizeMode.onBegin. */
    recognizeMode?: RecognizeMode;
}

/** Interface implemented by intent recognizer plugins like the [LuisRecognizer](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.luisrecognizer.html) class. */
export interface IIntentRecognizer {
    /**
     * Attempts to match a users text utterance to an intent.
     * @param context Contextual information for a received message that's being recognized.
     * @param callback Function to invoke with the results of the recognition operation.
     * @param callback.error Any error that occurred or `null`.
     * @param callback.result The result of the recognition.
     */
    recognize(context: IRecognizeContext, callback: (err: Error, result: IIntentRecognizerResult) => void): void;
}

/** Results from a call to a recognize() function. The implementation is free to add any additional properties to the result. */
export interface IRecognizeResult {
    /** Confidence that the users utterance was understood on a scale from 0.0 - 1.0.  */
    score: number;
}

/** Results returned by an intent recognizer. */
export interface IIntentRecognizerResult extends IRecognizeResult {
    /** Top intent that was matched. */
    intent: string;

    /** A regular expression that was matched. */
    expression?: RegExp;

    /** The results of the [expression](#expression) that was matched. matched[0] will be the text that was matched and matched[1...n] is the result of capture groups.  */
    matched?: string[];

    /** Full list of intents that were matched. */
    intents?: IIntent[];

    /** List of entities recognized. */
    entities?: IEntity[];
}

/** Options passed to the constructor of a session. */
export interface ISessionOptions {
    /** Function to invoke when the sessions state is saved. */
    onSave: (done: (err: Error) => void) => void;

    /** Function to invoke when a batch of messages are sent. */
    onSend: (messages: IMessage[], done: (err: Error, addresses?: IAddress[]) => void) => void;

    /** The connector being used for this session. */
    connector: IConnector;

    /** The bots root library of dialogs. */
    library: Library;

    /** The localizer to use for the session. */
    localizer: ILocalizer;

    /** Array of session middleware to execute prior to each request. */
    middleware: ISessionMiddleware[];

    /** Unique ID of the dialog to use when starting a new conversation with a user. */
    dialogId: string;

    /** (Optional) arguments to pass to the conversations initial dialog. */
    dialogArgs?: any;

    /** (Optional) time to allow between each message sent as a batch. The default value is 250ms.  */
    autoBatchDelay?: number;

    /** Default error message to send users when a dialog error occurs. */
    dialogErrorMessage?: TextOrMessageType;

    /** Global actions registered for the bot. */
    actions?: ActionSet;
}

/** Result returned from a call to EntityRecognizer.findBestMatch() or EntityRecognizer.findAllMatches(). */
export interface IFindMatchResult {
    /** Index of the matched value. */
    index: number;

    /** Value that was matched.  */
    entity: string;

    /** Confidence score on a scale from 0.0 - 1.0 that a value matched the users utterance. */
    score: number;
}

/** Context object passed to IBotStorage calls. */
export interface IBotStorageContext {
    /** (Optional) ID of the user being persisted. If missing __userData__ won't be persisted.  */
    userId?: string;

    /** (Optional) ID of the conversation being persisted. If missing __conversationData__ and __privateConversationData__ won't be persisted. */
    conversationId?: string;

    /** (Optional) Address of the message received by the bot. */
    address?: IAddress;

    /** If true IBotStorage should persist __userData__. */
    persistUserData: boolean;

    /** If true IBotStorage should persist __conversationData__.  */
    persistConversationData: boolean;
}

/** Data values persisted to IBotStorage. */
export interface IBotStorageData {
    /** The bots data about a user. This data is global across all of the users conversations. */
    userData?: any;

    /** The bots shared data for a conversation. This data is visible to every user within the conversation.  */
    conversationData?: any;

    /**
     * The bots private data for a conversation.  This data is only visible to the given user within the conversation.
     * The session stores its session state using privateConversationData so it should always be persisted.
     */
    privateConversationData?: any;
}

/** Replaceable storage system used by UniversalBot. */
export interface IBotStorage {
    /** Reads in data from storage. */
    getData(context: IBotStorageContext, callback: (err: Error, data: IBotStorageData) => void): void;

    /** Writes out data to storage. */
    saveData(context: IBotStorageContext, data: IBotStorageData, callback?: (err: Error) => void): void;
}

/** Options used to initialize a ChatConnector instance. */
export interface IChatConnectorSettings {
    /** The bots App ID assigned in the Bot Framework portal. */
    appId?: string;

    /** The bots App Password assigned in the Bot Framework Portal. */
    appPassword?: string;

    /** If true the bots userData, privateConversationData, and conversationData will be gzipped prior to writing to storage. */
    gzipData?: boolean;

    /** Collection of various necessary endpoints. Not normally provided by developers. */
    endpoint?: IChatConnectorEndpoint;

    /** If not provided, stateEndpoint will default to https://state.botframework.com. */
    stateEndpoint?: string;

    /** If not provided, openIdMetadata will default to https://login.botframework.com/v1/.well-known/openidconfiguration. */
    openIdMetadata?: string;
}

/** Options used to set various endpoints in a ChatConnector instance. This should not be changed and is normally not provided by developers in IChatConnectorSettings. Instead the two properties in IChatConnectorSettings, "stateEndpoint," and "openIdMetadata" should be changed there.  */
export interface IChatConnectorEndpoint {

    /** Default value is https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token. */
    refreshEndpoint: string;

    /** Default value is https://api.botframework.com/.default. */
    refreshScope: string;

    /** Default value is https://login.botframework.com/v1/.well-known/openidconfiguration. Configurable via IChatConnectorSettings.openIdMetadata. */
    botConnectorOpenIdMetadata: string;

    /** Default value is https://api.botframework.com. */
    botConnectorIssuer: string;

    /** This value is provided via IChatConnectorSettings.appId. */
    botConnectorAudience: string;

    /** Default value is https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration. */
    msaOpenIdMetadata: string;

    /** Default value is https://sts.windows.net/72f988bf-86f1-41af-91ab-2d7cd011db47/. */
    msaIssuer: string;

    /** Default value is https://graph.microsoft.com. */
    msaAudience: string;

    /** Default value is https://login.microsoftonline.com/botframework.com/v2.0/.well-known/openid-configuration. */
    emulatorOpenIdMetadata: string;

    /** Default value is https://sts.windows.net/d6d49420-f39b-4df7-a1dc-d59a935871db/. */
    emulatorIssuerV1: string;

    /** Default value is https://login.microsoftonline.com/d6d49420-f39b-4df7-a1dc-d59a935871db/v2.0. */
    emulatorIssuerV2: string;

    /** This value is provided via IChatConnectorSettings.appId. */
    emulatorAudience: string;

    /** Default value is https://state.botframework.com. Configurable via IChatConnectorSettings.stateEndpoint. */
    stateEndpoint: string;
}

/** Options used to initialize a UniversalBot instance. */
export interface IUniversalBotSettings {
    /** (Optional) dialog to launch when a user initiates a new conversation with a bot. Default value is '/'. */
    defaultDialogId?: string;

    /** (Optional) arguments to pass to the initial dialog for a conversation. */
    defaultDialogArgs?: any;

    /** (Optional) settings used to configure the frameworks built in default localizer. */
    localizerSettings?: IDefaultLocalizerSettings;

    /** (Optional) function used to map the user ID for an incoming message to another user ID.  This can be used to implement user account linking. */
    lookupUser?: (address: IAddress, done: (err: Error, user: IIdentity) => void) => void;

    /** (Optional) maximum number of async options to conduct in parallel. */
    processLimit?: number;

    /** (Optional) time to allow between each message sent as a batch. The default value is 150ms.  */
    autoBatchDelay?: number;

    /** (Optional) storage system to use for storing user & conversation data. */
    storage?: IBotStorage;

    /** (optional) if true userData will be persisted. The default value is true. */
    persistUserData?: boolean;

    /** (Optional) if true shared conversationData will be persisted. The default value is false. */
    persistConversationData?: boolean;

    /** (Optional) message to send the user should an unexpected error occur during a conversation. A default message is provided. */
    dialogErrorMessage?: TextOrMessageType;
}

/** Implemented by connector plugins for the UniversalBot. */
export interface IConnector {
    /**
     * (Optional) Called by the UniversalBot at registration time to register a handler for
     * receiving incoming invoke events. Invoke events are special events which are expected to
     * return a body inline as part of the response to the received request.
     * @param handler The function that should be called anytime an "invoke" event is received.
     */
    onInvoke?(handler: (event: IEvent, callback?: (err: Error, body: any, status?: number) => void) => void): void;

    /**
     * Called by the UniversalBot at registration time to register a handler for receiving incoming
     * events from a channel.
     * @param handler The function that should be called anytime an event is received that is not of type "invoke".
     */
    onEvent(handler: (events: IEvent[], callback?: (err: Error) => void) => void): void;

    /**
     * Sends outgoing message(s) to a user. This method will ultimately get called anytime you call
     * [UniversalBot.send()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.universalbot#send) or [Session.send()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.session#send).
     *
     * You can manually call this method using `session.connector.send()` as a convenient way of
     * getting the address of the message that was sent. You can then store this address and use
     * it at a later point in time to either update or delete the message. The one thing to keep
     * in mind is that if you manually call `session.connector.send()` you will bypass any
     * middleware that the outgoing message would normally run through. Calling
     * `session.send(msg).sendBatch(function (err, addresses) { })` does the same thing but ensures
     * that the outgoing message is sent through middleware.
     * @param messages Array of message(s) to send the user.
     * @param callback Function to invoke once the operation is completed.
     * @param callback.err Any error that occurred during the send.
     * @param callback.addresses An array of address objects returned for each individual message within the batch. These address objects contain the ID of the posted messages so can be used to update or delete a message in the future.
     */
    send(messages: IMessage[], callback: (err: Error, addresses?: IAddress[]) => void): void;

    /**
     * Called when a UniversalBot wants to start a new proactive conversation with a user. The
     * connector should return an address with a properly formated [IAddress.conversation](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iaddress#conversation)
     * field. This will typically be called when you call [UniversalBot.beginDialog()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.universalbot#begindialog)
     * but will also be called anytime `IAddress.conversation` is null for a message being sent.
     * @param address The address of the user to start the conversation for. The `IAddress.conversation` field should be null.
     * @param callback Function to invoke once the operation is completed.
     * @param callback.err Any error that occurred while attempting to start the conversation.
     * @param callback.address The address of the conversation that was started. This can be used to send future messages to the conversation.
     */
    startConversation(address: IAddress, callback: (err: Error, address?: IAddress) => void): void;

    /**
     * (Optional) method that can be called to replace a message that was previously sent using [send()](#send).
     * @param message The message to overwrite an existing message with. The `message.address` field should contain an address returned from a previous call to [send()](#send).
     * @param callback Function to invoke once the operation is completed.
     * @param callback.err Any error that occurred while replacing the message.
     * @param callback.address The address of the new message. For some channels this may different from the original messages address.
     */
    update?(message: IMessage, callback: (err: Error, address?: IAddress) => void): void;

    /**
     * (Optional) method that can be called to delete a message that was previously sent using [send()](#send).
     * @param address The address of the message to delete.
     * @param callback Function to invoke once the operation is completed.
     * @param callback.err Any error that occurred while replacing the message.
     */
    delete?(address: IAddress, callback: (err: Error) => void): void;
}

/** Function signature for a piece of middleware that hooks the 'receive' or 'send' events. */
export interface IEventMiddleware {
    (event: IEvent, next: Function): void;
}

/** Function signature for a piece of middleware that hooks the 'botbuilder' event. */
export interface ISessionMiddleware {
    (session: Session, next: Function): void;
}

/**
 * Map of middleware hooks that can be registered in a call to __UniversalBot.use()__.
 */
export interface IMiddlewareMap {
    /** Called in series when an incoming event is received. */
    receive?: IEventMiddleware|IEventMiddleware[];

    /** Called in series before an outgoing event is sent. */
    send?: IEventMiddleware|IEventMiddleware[];

    /** Called in series once an incoming message has been bound to a session. Executed after [receive](#receive) middleware.  */
    botbuilder?: ISessionMiddleware|ISessionMiddleware[];
}

/**
 * Signature for functions passed as steps to [DialogAction.waterfall()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.dialogaction.html#waterfall).
 *
 * Waterfalls let you prompt a user for information using a sequence of questions. Each step of the
 * waterfall can either execute one of the built-in [Prompts](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.__global.iprompts.html),
 * start a new dialog by calling [session.beginDialog()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.session.html#begindialog),
 * advance to the next step of the waterfall manually using `skip()`, or terminate the waterfall.
 *
 * When either a dialog or built-in prompt is called from a waterfall step, the results from that
 * dialog or prompt will be passed via the `results` parameter to the next step of the waterfall.
 * Users can say things like "never mind" to cancel the built-in prompts so you should guard against
 * that by at least checking for [results.response](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogresult.html#response)
 * before proceeding. A more detailed explanation of why the waterfall is being continued can be
 * determined by looking at the [code](/en-us/node/builder/chat-reference/enums/_botbuilder_d_.resumereason.html)
 * returned for [results.resumed](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogresult.html#resumed).
 *
 * You can manually advance to the next step of the waterfall using the `skip()` function passed
 * in. Calling `skip({ response: "some text" })` with an [IDialogResult](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogresult.html)
 * lets you more accurately mimic the results from a built-in prompt and can simplify your overall
 * waterfall logic.
 *
 * You can terminate a waterfall early by either falling through every step of the waterfall using
 * calls to `skip()` or simply not starting another prompt or dialog.
 *
 * __note:__ Waterfalls have a hidden last step which will automatically end the current dialog if
 * if you call a prompt or dialog from the last step. This is useful where you have a deep stack of
 * dialogs and want a call to [session.endDialog()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.session.html#enddialog)
 * from the last child on the stack to end the entire stack. The close of the last child will trigger
 * all of its parents to move to this hidden step which will cascade the close all the way up the stack.
 * This is typically a desired behavior but if you want to avoid it or stop it somewhere in the
 * middle you'll need to add a step to the end of your waterfall that either does nothing or calls
 * something like [session.send()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.session.html#send)
 * which isn't going to advance the waterfall forward.
 * @example
 * <pre><code>
 * var bot = new builder.BotConnectorBot();
 * bot.add('/', [
 *     function (session) {
 *         builder.Prompts.text(session, "Hi! What's your name?");
 *     },
 *     function (session, results) {
 *         if (results && results.response) {
 *             // User answered question.
 *             session.send("Hello %s.", results.response);
 *         } else {
 *             // User said never mind.
 *             session.send("OK. Goodbye.");
 *         }
 *     }
 * ]);
 * </code></pre>
 */
export interface IDialogWaterfallStep {
    /**
     * @param session Session object for the current conversation.
     * @param result
     * * __result:__ _{any}_ - For the first step of the waterfall this will be `null` or the value of any arguments passed to the handler.
     * * __result:__ _{IDialogResult}_ - For subsequent waterfall steps this will be the result of the prompt or dialog called in the previous step.
     * @param skip Function used to manually skip to the next step of the waterfall.
     * @param skip.results (Optional) results to pass to the next waterfall step. This lets you more accurately mimic the results returned from a prompt or dialog.
     */
    (session: Session, result?: any | IDialogResult<any>, skip?: (results?: IDialogResult<any>) => void): any;
}

/** A per/local mapping of regular expressions to use for a RegExpRecognizer.  */
export interface IRegExpMap {
    [local: string]: RegExp;
}

/** A per/local mapping of LUIS service url's to use for a LuisRecognizer.  */
export interface ILuisModelMap {
    [local: string]: string;
}

/** A per/source mapping of custom event data to send. */
export interface ISourceEventMap {
    [source: string]: any;
}

/** Options passed to Middleware.dialogVersion(). */
export interface IDialogVersionOptions {
    /** Current major.minor version for the bots dialogs. Major version increments result in existing conversations between the bot and user being restarted. */
    version: number;

    /** Optional message to send the user when their conversation is ended due to a version number change. A default message is provided. */
    message?: TextOrMessageType;

    /** Optional regular expression to listen for to manually detect a request to reset the users session state. */
    resetCommand?: RegExp;
}

/** Options passed to Middleware.firstRun(). */
export interface IFirstRunOptions {
    /** Current major.minor version for the bots first run experience. Major version increments result in redirecting users to [dialogId](#dialogid) and minor increments redirect users to [upgradeDialogId](#upgradedialogid). */
    version: number;

    /** Dialog to redirect users to when the major [version](#version) changes. */
    dialogId: string;

    /** (Optional) args to pass to [dialogId](#dialogid). */
    dialogArgs?: any;

    /** (Optional) dialog to redirect users to when the minor [version](#version) changes. Useful for minor Terms of Use changes. */
    upgradeDialogId?: string;

    /** (Optional) args to pass to [upgradeDialogId](#upgradedialogid). */
    upgradeDialogArgs?: string;
}

/** Candidate route returned by [Library.findRoutes()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.library#findroutes). */
export interface IRouteResult {
    /** Confidence score on a scale from 0.0 - 1.0 that the route is best suited for handling the current message. */
    score: number;

    /** Name of the library the route came from. */
    libraryName: string;

    /** (Optional) type of route returned. */
    routeType?: string;

    /** (Optional) data used to assist with triggering a selected route. */
    routeData?: any;
}

/** Function for retrieving the value of a watched variable. Passed to [Session.watchable()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.session#watchable). */
export interface IWatchableHandler {
    (context: IRecognizeContext, callback: (err: Error, value: any) => void): void;
}

/** Custom route searching logic passed to [Library.onFindRoutes()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.library#onfindroutes). */
export interface IFindRoutesHandler {
    (context: IRecognizeContext, callback: (err: Error, routes: IRouteResult[]) => void): void;
}

/** Custom route searching logic passed to [Library.onSelectRoute()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.library#onselectroute). */
export interface ISelectRouteHandler {
    (session: Session, route: IRouteResult): void;
}

/** Custom route disambiguation logic passed to [UniversalBot.onDisambiguateRoute()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.universalbot#ondisambiguateroute). */
export interface IDisambiguateRouteHandler {
    (session: Session, routes: IRouteResult[]): void;
}

/** Interface definition for a video card */
export interface IVideoCard extends IMediaCard {
    /** Hint of the aspect ratio of the video or animation. (16:9)(4:3) */
    aspect: string;
}

/** Interface definition for an audio card */
export interface IAudioCard extends IMediaCard {
}

/** Interface definition for an animation card */
export interface IAnimationCard extends IMediaCard {
}

/** Interface definition of a generic MediaCard, which in its concrete form can be an Audio, Animation or Video card */
export interface IMediaCard {
    /** Title of the Card */
    title: string;

    /** Subtitle appears just below Title field, differs from Title in font styling only */
    subtitle: string;

    /** Text field appears just below subtitle, differs from Subtitle in font styling only */
    text: string;

    /** Messaging supports all media formats: audio, video, images and thumbnails as well to optimize content download.*/
    image: ICardImage;

    /** Media source for video, audio or animations */
    media: ICardMediaUrl[];

    /** Set of actions applicable to the current card */
    buttons?: ICardAction[];

    /** Should the media source reproduction run in a loop */
    autoloop: boolean;

    /** Should the media start automatically */
    autostart: boolean;

    /** Should media be shareable */
    shareable: boolean;

    /** Supplementary parameter for this card. */
    value: any;
}

/** Url information describing media for a card */
export interface ICardMediaUrl {

    /** Url to audio, video or animation media */
    url: string;

    /** Optional profile hint to the client to differentiate multiple MediaUrl objects from each other */
    profile: string ;
}

/** Supplementary parameter for media events. */
export interface IMediaEventValue {
    /** Callback parameter specified in the Value field of the MediaCard that originated this event. */
    cardValue: any;
}

//=============================================================================
//
// ENUMS
//
//=============================================================================

/** Reason codes for why a dialog was resumed. */
export enum ResumeReason {
    /** The user completed the child dialog and a result was returned. */
    completed,

    /** The user did not complete the child dialog for some reason. They may have exceeded maxRetries or canceled. */
    notCompleted,

    /** The dialog was canceled in response to some user initiated action. */
    canceled,

    /** The user requested to return to the previous step in a dialog flow. */
    back,

    /** The user requested to skip the current step of a dialog flow. */
    forward,

    /** The dialog is being resumed because of an interruption and should re-prompt. */
    reprompt
}

/** Order in which an [IntentDialogs](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.intentdialog.html) recognizers should be evaluated. */
export enum RecognizeOrder {
    /** All recognizers will be evaluated in parallel. */
    parallel,

    /** Recognizers will be evaluated in series. Any recognizer that returns a score of 1.0 will prevent the evaluation of the remaining recognizers. */
    series
}

/** Controls an [IntentDialogs](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.intentdialog.html) processing of the users text utterances. */
export enum RecognizeMode {
    /** Process text utterances whenever the dialog is first loaded through a call to session.beginDialog() and anytime a reply from the user is received. This was the default behaviour prior to version 3.2. */
    onBegin,

    /** Processes text utterances anytime a reply is received but only when the dialog is first loaded if it's the root dialog. This is the default behaviour as of 3.2. */
    onBeginIfRoot,

    /** Only process text utterances when a reply is received. */
    onReply
}

/**
  * Type of prompt invoked.
  */
export enum PromptType {
    /** The user is prompted for a string of text. */
    text,

    /** The user is prompted to enter a number. */
    number,

    /** The user is prompted to confirm an action with a yes/no response. */
    confirm,

    /** The user is prompted to select from a list of choices. */
    choice,

    /** The user is prompted to enter a time. */
    time,

    /** The user is prompted to upload an attachment. */
    attachment
}

/** Type of list to render for PromptType.choice prompt. */
export enum ListStyle {
    /** No list is rendered. This is used when the list is included as part of the prompt. */
    none,

    /** Choices are rendered as an inline list of the form "1. red, 2. green, or 3. blue". */
    inline,

    /** Choices are rendered as a numbered list. */
    list,

    /** Choices are rendered as buttons for channels that support buttons. For other channels they will be rendered as text. */
    button,

    /** The style is selected automatically based on the channel and number of options. */
    auto
}

/** Identifies the type of text being sent in a message.  */
export var TextFormat: {
    /** Text fields should be treated as plain text. */
    plain: string;

    /** Text fields may contain markdown formatting information. */
    markdown: string;

    /** Text fields may contain xml formatting information. */
    xml: string;
};

/** Identities how the client should render attachments for a message. */
export var AttachmentLayout: {
    /** Attachments should be rendred as a list. */
    list: string;

    /** Attachments should be rendered as a carousel. */
    carousel: string;
};

/** Indicates whether the bot is accepting, expecting, or ignoring input. */
export var InputHint: {
    /** The sender is passively ready for input but is not waiting on a response. */
    acceptingInput: string;

    /**
     * The sender is ignoring input. Bots may send this hint if they are actively
     * processing a request and will ignore input from users until the request is
     * complete.
     */
    ignoringInput: string;

    /** The sender is actively expecting a response from the user. */
    expectingInput: string;
};


//=============================================================================
//
// CLASSES
//
//=============================================================================

/**
 * Manages the bots conversation with a user.
 */
export class Session {
    /**
     * Registers an event listener.
     * @param event Name of the event. Event types:
     * - __error:__ An error occured. Passes a JavaScript `Error` object.
     * @param listener Function to invoke.
     * @param listener.data The data for the event. Consult the list above for specific types of data you can expect to receive.
     */
    on(event: string, listener: (data: any) => void): void;

    /**
     * Creates an instance of the session.
     * @param options Sessions configuration options.
     */
    constructor(options: ISessionOptions);

    /** Returns the session object as a read only context object. */
    toRecognizeContext(): IRecognizeContext;

    /**
     * Finalizes the initialization of the session object and then routes the session through all
     * installed middleware. The passed in `next()` function will be called as the last step of the
     * middleware chain.
     * @param sessionState The current session state. If `null` a new conversation will be started beginning with the configured [dialogId](#dialogid).
     * @param message The message to route through middleware.
     * @param next The function to invoke as the last step of the middleware chain.
     */
    dispatch(sessionState: ISessionState, message: IMessage, next: Function): Session;

    /** The connector being used for this session. */
    connector: IConnector;

    /** The bots root library of dialogs. */
    library: Library;

    /** Sessions current state information. */
    sessionState: ISessionState;

    /** The message received from the user. For bot originated messages this may only contain the "to" & "from" fields. */
    message: IMessage;

    /** Data for the user that's persisted across all conversations with the bot. */
    userData: any;

    /** Shared conversation data that's visible to all members of the conversation. */
    conversationData: any;

    /** Private conversation data that's only visible to the user. */
    privateConversationData: any;

    /** Data that's only visible to the current dialog. */
    dialogData: any;

    /** The localizer for the current session. */
    localizer: ILocalizer ;

    /**
     * Signals that an error occured. The bot will signal the error via an on('error', err) event.
     * @param err Error that occured.
     * @example
     * <pre><code>
     * bot.dialog('taskDialog', function (session) {
     *      try {
     *           // ... do something that could raise an error ...
     *      } catch (err) {
     *           session.error(err);
     *      }
     * });
     * </code></pre>
     */
    error(err: Error): Session;

    /**
     * Returns the preferred locale when no parameters are supplied, otherwise sets the preferred locale.
     * @param locale (Optional) the locale to use for localizing messages.
     * @param callback (Optional) function called when the localization table has been loaded for the supplied locale.
     * @example
     * <pre><code>
     * bot.dialog('localePicker', [
     *      function (session) {
     *           var choices = [
     *                { value: 'en', title: "English" },
     *                { value: 'es', title: "Español" }
     *           ];
     *           builder.Prompts.choice(session, "Please select your preferred language.", choices);
     *      },
     *      function (session, results) {
     *           var locale = results.response.entity;
     *           session.preferredLocale(locale);
     *           session.send("Language updated.").endDialog();
     *      }
     * ]);
     * </code></pre>
     */
    preferredLocale(locale?: string, callback?: (err: Error) => void): string;

    /**
     * Loads a localized string for the messages language. If arguments are passed the localized string
     * will be treated as a template and formatted using [sprintf-js](https://github.com/alexei/sprintf.js) (see their docs for details.)
     * @param msgid String to use as a key in the localized string table. Typically this will just be the english version of the string.
     * @param args (Optional) arguments used to format the final output string.
     * @example
     * <pre><code>
     * var msg = session.gettext("")
     * </code></pre>
     */
    gettext(msgid: string, ...args: any[]): string;

    /**
     * Loads the plural form of a localized string for the messages language. The output string will be formatted to
     * include the count by replacing %d in the string with the count.
     * @param msgid Singular form of the string to use as a key in the localized string table. Use %d to specify where the count should go.
     * @param msgid_plural Plural form of the string to use as a key in the localized string table. Use %d to specify where the count should go.
     * @param count Count to use when determining whether the singular or plural form of the string should be used.
     */
    ngettext(msgid: string, msgid_plural: string, count: number): string;

    /** Triggers saving of changes made to [dialogData](#dialogdata), [userData](#userdata), [conversationdata](#conversationdata), or [privateConversationData'(#privateconversationdata). */
    save(): Session;

    /**
     * Sends a message to the user.
     * @param message Text/message to send to user. If an array is passed a response will be chosen at random.
     * @param args (Optional) arguments used to format the final output text when __message__ is a _{string|string[]}_.
     */
    send(message: TextOrMessageType, ...args: any[]): Session;

    /**
     * Sends a message to a user using a specific localization namespace.
     * @param libraryNamespace Namespace to use for localizing the message.
     * @param message Text/message to send to user.
     * @param args (Optional) arguments used to format the final output text when __message__ is a _{string|string[]}_.
     */
    sendLocalized(libraryNamespace: string, message: TextOrMessageType, ...args: any[]): Session;

    /**
     * Sends a text, and optional SSML, message to the user.
     * @param text Text to send to the user. This can be null to send only SSML or attachments.
     * @param speak (Optional) message that should be spoken to the user. The message should be formatted as [Speech Synthesis Markup Language (SSML)](https://msdn.microsoft.com/en-us/library/hh378377(v=office.14).aspx).
     * If an array is passed a response will be chosen at random.
     * @param options (Optional) properties that should be included on the outgoing message.
     */
    say(text: TextType, speak?: TextType, options?: IMessageOptions): Session;
    say(text: TextType, options?: IMessageOptions): Session;

    /**
     * Sends a text, and optional SSML, message to the user using a specific localization namespace.
     * @param libraryNamespace Namespace to use for localizing the message.
     * @param text Text to send to the user. This can be null to send only SSML or attachments.
     * @param speak (Optional) message that should be spoken to the user. The message should be formatted as [Speech Synthesis Markup Language (SSML)](https://msdn.microsoft.com/en-us/library/hh378377(v=office.14).aspx).
     * If an array is passed a response will be chosen at random.
     * @param options (Optional) properties that should be included on the outgoing message.
     */
    sayLocalized(libraryNamespace: string, text: TextType, speak?: TextType, options?: IMessageOptions): Session;

    /**
     * Sends the user an indication that the bot is typing. For long running operations this should be called every few seconds.
     */
    sendTyping(): Session;

    /**
     * Inserts a delay between outgoing messages.
     * @param delay Number of milliseconds to pause for.
     */
    delay(delay: number): Session;

    /**
     * Returns true if a message has been sent for this session.
     */
    messageSent(): boolean;

    /**
     * Passes control of the conversation to a new dialog. The current dialog will be suspended
     * until the child dialog completes. Once the child ends the current dialog will receive a
     * call to [dialogResumed()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.dialog.html#dialogresumed)
     * where it can inspect any results returned from the child.
     * @param id Unique ID of the dialog to start.
     * @param args (Optional) arguments to pass to the dialogs [begin()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.dialog.html#begin) method.
     */
    beginDialog<T>(id: string, args?: T): Session;

    /**
     * Ends the current dialog and starts a new one its place. The parent dialog will not be
     * resumed until the new dialog completes.
     * @param id Unique ID of the dialog to start.
     * @param args (Optional) arguments to pass to the dialogs [begin()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.dialog.html#begin) method.
     */
    replaceDialog<T>(id: string, args?: T): Session;

    /**
     * Ends the current conversation and optionally sends a message to the user.
     * @param message (Optional) text/message to send the user before ending the conversation.
     * @param args (Optional) arguments used to format the final output text when __message__ is a _{string|string[]}_.
     */
    endConversation(message?: TextOrMessageType, ...args: any[]): Session;

    /**
     * Ends the current dialog and optionally sends a message to the user. The parent will be resumed with an [IDialogResult.resumed](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogresult.html#resumed)
     * reason of [completed](/en-us/node/builder/chat-reference/enums/_botbuilder_d_.resumereason.html#completed).
     * @param message (Optional) text/message to send the user before ending the dialog.
     * @param args (Optional) arguments used to format the final output text when __message__ is a _{string|string[]}_.
     */
    endDialog(message?: TextOrMessageType, ...args: any[]): Session;

    /**
     * Ends the current dialog and optionally returns a result to the dialogs parent.
     * @param result (Optional) result to send the user. The value you'd like to return should be in the [response](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogresult#response) field.
     */
    endDialogWithResult(result?: IDialogResult<any>): Session;

    /**
     * Cancels an existing dialog and optionally starts a new one it its place.  Unlike [endDialog()](#enddialog)
     * and [replaceDialog()](#replacedialog) which affect the current dialog, this method lets you end a
     * parent dialog anywhere on the stack. The parent of the canceled dialog will be continued as if the
     * dialog had called endDialog(). A special [ResumeReason.canceled](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.resumereason#canceled)
     * will be returned to indicate that the dialog was canceled.
     * @param dialogId
     * * __dialogId:__ _{string}_ - ID of the dialog to end. If multiple occurences of the dialog exist on the dialog stack, the last occurance will be canceled.
     * * __dialogId:__ _{number}_ - Index of the dialog on the stack to cancel. This is the preferred way to cancel a dialog from an action handler as it ensures that the correct instance is canceled.
     * @param replaceWithId (Optional) specifies an ID to start in the canceled dialogs place. This prevents the dialogs parent from being resumed.
     * @param replaceWithArgs (Optional) arguments to pass to the new dialog.
     */
    cancelDialog(dialogId: string|number, replaceWithId?: string, replaceWithArgs?: any): Session;

    /**
     * Clears the sessions callstack and restarts the conversation with the configured dialogId.
     * @param dialogId (Optional) ID of the dialog to start.
     * @param dialogArgs (Optional) arguments to pass to the dialogs [begin()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.dialog.html#begin) method.
     */
    reset(dialogId?: string, dialogArgs?: any): Session;

    /** Returns true if the session has been reset. */
    isReset(): boolean;

    /**
     * Immediately ends the current batch and delivers any queued up messages.
     * @param done (Optional) function called when the batch was either successfully delievered or failed for some reason.
     * @param done.err Any error that occured during the send.
     * @param done.addresses An array of address objects returned for each individual message within the batch. These address objects contain the ID of the posted messages so can be used to update or delete a message in the future.
     */
    sendBatch(done?: (err: Error, addresses?: IAddress[]) => void): void;

    /**
     * Gets/sets the current dialog stack. A copy of the current dialog is returned so if any
     * changes are made to the returned stack they will need to be copied back to the session
     * via a second call to `session.dialogStack()`.
     * @param newStack (Optional) dialog stack to assign to session. The sessions [dialogData](#dialogdata) will be updated to reflect the state of the new active dialog.
     */
    dialogStack(newStack?: IDialogState[]): IDialogState[];

    /**
     * Clears the current dialog stack.
     */
    clearDialogStack(): Session;

    /**
     * Dispatches the session to either the active dialog or the default dialog for processing.
     * @param recognizeResult (Optional) results returned from calling [Library.findRoutes()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.library#findroutes), [Library.findActiveDialogRoutes()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.library#findactivedialogroutes), * or [Dialog.recognize()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.dialog#recognize).
     */
    routeToActiveDialog(recognizeResult?: IRecognizeResult): void;

    /**
     * Enumerates all a stacks dialog entries in either a forward or reverse direction.
     * @param stack The dialog stack to enumerate.
     * @param reverse If true the entries will be enumerated starting with the active dialog and working up to the root dialog.
     * @param fn Function to invoke with each entry on the stack.
     * @param fn.entry The dialog stack entry.
     * @param fn.index The index of the dialog within the stack.
     */
    static forEachDialogStackEntry(stack: IDialogState[], reverse: boolean, fn: (entry: IDialogState, index: number) => void): void;

    /**
     * Searches a dialog stack for a specific dialog, in either a forward or reverse direction,
     * returning its index.
     * @param stack The dialog stack to search.
     * @param dialogId The unique ID of the dialog, in `<namespace>:<dialog>` format, to search for.
     * @param reverse (Optional) if true the stack will be searched starting with the active dialog and working its way up to the root.
     */
    static findDialogStackEntry(stack: IDialogState[], dialogId: string, reverse?: boolean): number;

    /**
     * Returns a stacks active dialog or null.
     * @param stack The dialog stack to return the entry for.
     */
    static activeDialogStackEntry(stack: IDialogState[]): IDialogState;

    /**
     * Pushes a new dialog onto a stack and returns it as the active dialog.
     * @param stack The dialog stack to update.
     * @param entry Dialog entry to push onto the stack.
     */
    static pushDialogStackEntry(stack: IDialogState[], entry: IDialogState): IDialogState;

    /**
     * Pops the active dialog off a stack and returns the new one if the stack isn't empty.
     * @param stack The dialog stack to update.
     */
    static popDialogStackEntry(stack: IDialogState[]): IDialogState;

    /**
     * Deletes all dialog stack entries starting with the specified index and returns the new
     * active dialog.
     * @param stack The dialog stack to update.
     * @param start Index of the first element to remove.
     */
    static pruneDialogStack(stack: IDialogState[], start: number): IDialogState;

    /**
     * Ensures that all of the entries on a dialog stack reference valid dialogs within a library
     * hierarchy.
     * @param stack The dialog stack to validate.
     * @param root The root of the library hierarchy, typically the bot.
     */
    static validateDialogStack(stack: IDialogState[], root: Library): boolean;

    /**
     * Enables/disables a watch for the current session.
     * @param variable Name of the variable to watch/unwatch.
     * @param enable (Optional) If true the variable will be watched, otherwise it will be unwatched. The default value is true.
     */
    watch(variable: string, enable?: boolean): Session;

    /**
     * Returns the current list of watched variables for the session.
     */
    watchList(): string[];

    /**
     * Adds or retrieves a variable that can be watched.
     * @param variable Name of the variable that can be watched. Case is used for display only.
     * @param handler (Optional) Function used to retrieve the variables current value. If specified a new handler will be registered, otherwise the existing handler will be retrieved.
     */
    static watchable(variable: string, handler?: IWatchableHandler): IWatchableHandler;

    /**
     * Returns a list of watchable variables.
     */
    static watchableList(): string[];
}

/**
 * Default session logger used to log session activity to the console.
 */
export class SessionLogger {
    /** If true the logger is enabled and will log the sessions activity. */
    isEnabled: boolean;

    /**
     * Logs the state of a variable to the output.
     * @param name Name of the variable being logged.
     * @param value Variables current state.
     */
    dump(name: string, value: any): void;

    /**
     * Logs an informational level message to the output.
     * @param dialogStack (Optional) dialog stack for the session. This is used to provide context for where the event occured.
     * @param msg Message to log.
     * @param args (Optional) arguments to log with the message.
     */
    log(dialogStack: IDialogState[], msg: string, ...args: any[]): void;

    /**
     * Logs a warning to the output.
     * @param dialogStack (Optional) dialog stack for the session. This is used to provide context for where the event occured.
     * @param msg Message to log.
     * @param args (Optional) arguments to log with the message.
     */
    warn(dialogStack: IDialogState[], msg: string, ...args: any[]): void;

    /**
     * Logs an error to the output.
     * @param dialogStack (Optional) dialog stack for the session. This is used to provide context for where the event occured.
     * @param err Error object to log. The errors message plus stack trace will be logged.
     */
    error(dialogStack: IDialogState[], err: Error): void;

    /**
     * Flushes any buffered entries to the output.
     * @param callback Function to call when the operation is completed.
     */
    flush(callback: (err: Error) => void): void;
}

/**
 * Logs session activity to a remote endpoint using debug events. The remote debugger
 * is automatically used when the emulator connects to your bot. Non-emulator channels
 * can stream their activity to the emulator by saving the address of the emulator
 * session to `session.privateConversationData["BotBuilder.Data.DebugSession"]`.
 */
export class RemoteSessionLogger extends SessionLogger {
    /**
     * Creates an instance of the remote session logger.
     * @param connector Connector used to communicate with the remote endpoint.
     * @param address Address to deliver debug events to.
     * @param relatesTo Address of the conversation the debug events are for.
     */
    constructor(connector: IConnector, address: IAddress, relatesTo: IAddress);
}

/**
 * Message builder class that simplifies building complex messages with attachments.
 */
export class Message implements IIsMessage {
    /** Internal message object being built. */
    protected data: IMessage;

    /**
     * Creates a new Message builder.
     * @param session (Optional) will be used to populate the messages address and localize any text.
     */
    constructor(session?: Session);

    /** Hint for clients letting them know if the bot is expecting further input or not. The built-in prompts will automatically populate this value for outgoing messages. */
    inputHint(hint: string): Message;

    /** Sets the speak field of the message as [Speech Synthesis Markup Language (SSML)](https://msdn.microsoft.com/en-us/library/hh378377(v=office.14).aspx). This will be spoken to the user on supported devices. */
    speak(ssml: TextType, ...args: any[]): Message;

    /** Conditionally set the speak field of the message given a specified count. */
    nspeak(ssml: TextType, ssml_plural: TextType, count: number): Message;

    /** Language of the message. */
    textLocale(locale: string): Message;

    /** Format of text fields. */
    textFormat(style: string): Message;

    /** Sets the message text. */
    text(text: TextType, ...args: any[]): Message;

    /** Conditionally set the message text given a specified count. */
    ntext(msg: TextType, msg_plural: TextType, count: number): Message;

    /** Composes a complex and randomized reply to the user.  */
    compose(prompts: string[][], ...args: any[]): Message;

    /** Text to be displayed by as fall-back and as short description of the message content in e.g. list of recent conversations. */
    summary(text: TextType, ...args: any[]): Message;

    /** Hint for how clients should layout multiple attachments. The default value is 'list'. */
    attachmentLayout(style: string): Message;

    /** Cards or images to send to the user. */
    attachments(list: AttachmentType[]): Message;

    /**
     * Adds an attachment to the message. See [IAttachment](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iattachment.html) for examples.
     * @param attachment The attachment to add.
     */
    addAttachment(attachment: AttachmentType): Message;

    /** Optional suggested actions to send to the user. Suggested actions will be displayed only on the channels that support suggested actions. */
    suggestedActions(suggestedActions: ISuggestedActions|IIsSuggestedActions): Message;

    /** Structured objects passed to the bot or user. */
    entities(list: Object[]): Message;

    /** Adds an entity to the message. */
    addEntity(obj: Object): Message;

    /** Address routing information for the message. Save this field to external storage somewhere to later compose a proactive message to the user. */
    address(adr: IAddress): Message;

    /** Set by connectors service. Use [localTimestamp()](#localtimestamp) instead. */
    timestamp(time?: string): Message;

    /**
     * Local time when message was sent (set by client or bot, Ex: 2016-09-23T13:07:49.4714686-07:00.)
     * @param time (Optional) time expressed as an ISO string. Defaults to `new Date().toISOString()`.
     */
    localTimestamp(time?: string): Message;

    /** Message in original/native format of the channel for incoming messages. */
    originalEvent(event: any): Message;

    /** For outgoing messages can be used to pass source specific event data like custom attachments. */
    sourceEvent(map: ISourceEventMap): Message;

    /** Open-ended value. */
    value(param: any): Message;

    /** Name of the operation to invoke or the name of the event. */
    name(name: string): Message;

    /** Reference to another conversation or message. */
    relatesTo(adr: IAddress): Message;

    /** Code indicating why the conversation has ended. */
    code(value: string): Message;

    /** Returns the JSON for the message. */
    toMessage(): IMessage;

    /** __DEPRECATED__ use [local()](#local) instead. */
    setLanguage(language: string): Message;

    /** __DEPRECATED__ use [text()](#text) instead. */
    setText(session: Session, prompt: TextType, ...args: any[]): Message;

    /** __DEPRECATED__ use [ntext()](#ntext) instead. */
    setNText(session: Session, msg: string, msg_plural: string, count: number): Message;

    /** __DEPRECATED__ use [compose()](#compose) instead. */
    composePrompt(session: Session, prompts: string[][], ...args: any[]): Message;

    /** __DEPRECATED__ use [sourceEvent()](#sourceevent) instead. */
    setChannelData(data: any): Message;

    /**
     * Selects a prompt at random.
     * @param prompts Array of prompts to choose from. When prompts is type _string_ the prompt will simply be returned unmodified.
     */
    static randomPrompt(prompts: TextType): string;

    /**
     * Combines an array of prompts into a single localized prompt and then optionally fills the
     * prompts template slots with the passed in arguments.
     * @param session Session object used to localize the individual prompt parts.
     * @param prompts Array of prompt lists. Each entry in the array is another array of prompts
     *                which will be chosen at random.  The combined output text will be space delimited.
     * @param args (Optional) array of arguments used to format the output text when the prompt is a template.
     */
    static composePrompt(session: Session, prompts: string[][], args?: any[]): string;
}

/** Builder class to simplify adding actions to a card. */
export class CardAction implements IIsCardAction {

    /**
     * Creates a new CardAction.
     * @param session (Optional) will be used to localize any text.
     */
    constructor(session?: Session);

    /** Type of card action. */
    type(t: string): CardAction;

    /** Title of the action. For buttons this will be the label of the button.  For tap actions this may be used for accesibility purposes or shown on hover. */
    title(text: TextType, ...args: any[]): CardAction;

    /** The actions value. */
    value(v: string): CardAction;

    /** For buttons an image to include next to the buttons label. Not supported by all channels. */
    image(url: string): CardAction;

    /** (Optional) Text for this action. */
    text(text: TextType, ...args: any[]): CardAction;

    /** (Optional) text to display in the chat feed if the button is clicked. */
    displayText(text: TextType, ...args: any[]): CardAction;

    /** Returns the JSON for the action. */
    toAction(): ICardAction;

    /**
     * Places a call to a phone number. The should include country code in +44/+1 format for Skype calls.
     * @param session (Optional) Current session object for the conversation. If specified will be used to localize titles.
     */
    static call(session: Session, number: string, title?: TextType): CardAction;

    /**
     * Opens the specified URL.
     * @param session (Optional) Current session object for the conversation. If specified will be used to localize titles.
     */
    static openUrl(session: Session, url: string, title?: TextType): CardAction;

    /**
     * Sends a message to the bot for processing in a way that's visible to all members of the conversation. For some channels this may get mapped to a [postBack](#postback).
     * @param session (Optional) Current session object for the conversation. If specified will be used to localize titles.
     */
    static imBack(session: Session, msg: string, title?: TextType): CardAction;

    /**
     * Sends a message to the bot for processing in a way that's hidden from all members of the conversation. For some channels this may get mapped to a [imBack](#imback).
     * @param session (Optional) Current session object for the conversation. If specified will be used to localize titles.
     */
    static postBack(session: Session, msg: string, title?: TextType): CardAction;

    /**
     * Plays the specified audio file to the user. Not currently supported for Skype.
     * @param session (Optional) Current session object for the conversation. If specified will be used to localize titles.
     */
    static playAudio(session: Session, url: string, title?: TextType): CardAction;

    /**
     * Plays the specified video to the user. Not currently supported for Skype.
     * @param session (Optional) Current session object for the conversation. If specified will be used to localize titles.
     */
    static playVideo(session: Session, url: string, title?: TextType): CardAction;

    /**
     * Opens the specified image in a native image viewer. For Skype only valid as a tap action on a CardImage.
     * @param session (Optional) Current session object for the conversation. If specified will be used to localize titles.
     */
    static showImage(session: Session, url: string, title?: TextType): CardAction;

    /**
     * Downloads the specified file to the users device. Not currently supported for Skype.
     * @param session (Optional) Current session object for the conversation. If specified will be used to localize titles.
     */
    static downloadFile(session: Session, url: string, title?: TextType): CardAction;

    /**
     * Binds a button or tap action to a named action registered for a dialog or globally off the bot.
     *
     * Can be used anywhere a [postBack](#postback) is valid. You may also statically bind a button
     * to an action for something like Facebooks [Persistent Menus](https://developers.facebook.com/docs/messenger-platform/thread-settings/persistent-menu).
     * The payload for the button should be `action?<action>` for actions without data or
     * `action?<action>=<data>` for actions with data.
     * @param session (Optional) Current session object for the conversation. If specified will be used to localize titles.
     * @param action Name of the action to invoke when tapped.
     * @param data (Optional) data to pass to the action when invoked. The [IRecognizeActionResult.data](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.irecognizeactionresult#data)
     * property can be used to access this data. If using [beginDialogAction()](dlg./en-us/node/builder/chat-reference/classes/_botbuilder_d_.dialog#begindialogaction) this value will be passed
     * as part of the dialogs initial arguments.
     * @param title (Optional) title to assign when binding the action to a button.
     */
    static dialogAction(session: Session, action: string, data?: string, title?: TextType): CardAction;

    /**
     * Sends a message to the bot for processing. A `messageBack` has the ability to act like both an [imBack](#imback) and a [postBack](#postBack).
     * @param session (Optional) Current session object for the conversation. If specified will be used to localize titles.
     */
    static messageBack(session: Session, msg: string, title?: TextType): CardAction;
}

/** Builder class to add suggested actions to a message */
export class SuggestedActions implements IIsSuggestedActions {

    /**
     * Creates a new SuggestedActions
     * @param session (Optional) session object
     */
    constructor(session?: Session);

    /** Optional recipients of the actions. Only supported by certain channels. */
    to(text: TextType): SuggestedActions;

    /** Collection of actions to be displayed as suggested actions. */
    actions(list: ICardAction[]|IIsCardAction[]): SuggestedActions;

    /** Adds an action to be displayed as a suggested action */
    addAction(action: ICardAction|IIsCardAction): SuggestedActions;

    /** Returns the JSON object for the suggested actions */
    toSuggestedActions(): ISuggestedActions;

    /** Creates a new SuggestedActions */
    static create(session: Session, actions: ICardAction[]|IIsCardAction[], to?: string|string[]): SuggestedActions;
}
/** Builder class to simplify adding images to a card. */
export class CardImage implements IIsCardImage {

    /**
     * Creates a new CardImage.
     * @param session (Optional) will be used to localize any text.
     */
    constructor(session?: Session);

    /** URL of the image to display. */
    url(u: string): CardImage;

    /** Alternate text of the image to use for accessibility pourposes. */
    alt(text: TextType, ...args: any[]): CardImage;

    /** Action to take when the image is tapped. */
    tap(action: ICardAction|IIsCardAction): CardImage;

    /** Returns the JSON for the image. */
    toImage(): ICardImage;

    /** Creates a new CardImage for a given url. */
    static create(session: Session, url: string): CardImage;
}

/** Card builder class that simplifies building keyboard cards. */
export class Keyboard implements IIsAttachment {

    /**
     * Creates a new ThumbnailCard.
     * @param session (Optional) will be used to localize any text.
     */
    constructor(session?: Session);

    /** Session object for the current conversation. */
    protected session?: Session;

    /** Set of actions applicable to the current card. Not all channels support buttons or cards with buttons. Some channels may choose to render the buttons using a custom keyboard. */
    buttons(list: ICardAction[]|IIsCardAction[]): ThumbnailCard;

    /** Returns the JSON for the card */
    toAttachment(): IAttachment;
}

/** Card builder class that simplifies building thumbnail cards. */
export class ThumbnailCard extends Keyboard {

    /**
     * Creates a new ThumbnailCard.
     * @param session (Optional) will be used to localize any text.
     */
    constructor(session?: Session);

    /** Title of the Card. */
    title(text: TextType, ...args: any[]): ThumbnailCard;

    /** Subtitle appears just below Title field, differs from Title in font styling only. */
    subtitle(text: TextType, ...args: any[]): ThumbnailCard;

    /** Text field appears just below subtitle, differs from Subtitle in font styling only. */
    text(text: TextType, ...args: any[]): ThumbnailCard;

    /** Messaging supports all media formats: audio, video, images and thumbnails as well to optimize content download. */
    images(list: ICardImage[]|IIsCardImage[]): ThumbnailCard;

    /** This action will be activated when user taps on the card. Not all channels support tap actions and some channels may choose to render the tap action as the titles link. */
    tap(action: ICardAction|IIsCardAction): ThumbnailCard;
}

/** Card builder class that simplifies building Video cards. */
export class VideoCard extends MediaCard implements IIsAttachment {

    /**
     * Creates a new VideoCard.
     * @param session (Optional) will be used to localize any text.
     */
    constructor(session?: Session);
    aspect(text: TextType, ...args: any[]): this;
}

/** Card builder class that simplifies building Animation cards. */
export class AnimationCard extends MediaCard implements IIsAttachment {

    /**
     * Creates a new AnimationCard.
     * @param session (Optional) will be used to localize any text.
     */
    constructor(session?: Session);
}

/** Card builder class that simplifies building Media cards. */
export class AudioCard extends MediaCard implements IIsAttachment{

    /**
     * Creates a new Audio.
     * @param session (Optional) will be used to localize any text.
     */
    constructor(session?: Session);
}

/** Card builder class that simplifies building Media cards. */
export class MediaCard  implements IIsAttachment{

    /**
     * Creates a new MediaCard.
     * @param session (Optional) will be used to localize any text.
     */
    constructor(session?: Session);

    /** Title of the Card */
    title(text: TextType, ...args: any[]): this;

    /** Subtitle appears just below Title field, differs from Title in font styling only */
    subtitle(text: TextType, ...args: any[]): this;

    /** Text field appears just below subtitle, differs from Subtitle in font styling only */
    text(text: TextType, ...args: any[]): this;

    /** Messaging supports all media formats: audio, video, images and thumbnails as well to optimize content download.*/
    image(image: ICardImage|IIsCardImage): this;

    /** Media source for video, audio or animations */
    media(list: ICardMediaUrl[]): this;

    /** Returns the JSON for the card*/
    toAttachment(): IAttachment;

    /** Should the media source reproduction run in a loop */
    autoloop(choice: boolean): this;

    /** Should the media start automatically */
    autostart(choice: boolean): this;

    /** Should media be shareable */
    shareable(choice: boolean): this;

    /** Supplementary parameter for this card. */
    value(param: any): this;
}

/** Entities that can be converted to Media for cards */
export interface IIsCardMedia{

    /** Returns the url definition for a Media entity for a card */
    toMedia(): ICardMediaUrl;
}

/** Definition of a media entity for a card */
export class CardMedia implements IIsCardMedia{

    /**
     * Creates a new CardMedia, which defines a media entity for a card.
     * @param session (Optional) will be used to localize any text.
     */
    constructor(session?: Session);

    /** Url of the media */
    url(u: string): this;

    /** Optional profile hint to the client to differentiate multiple MediaUrl objects from each other */
    profile(text: string): this;

    /** Returns the url definition for a Media entity for a card */
    toMedia(): ICardMediaUrl;

    /** Factory method for creation of Card media entities */
    static create(session: Session, url: string): CardMedia;
}

/** Card builder class that simplifies building hero cards. Hero cards contain the same information as a thumbnail card, just with a larger more pronounced layout for the cards images. */
export class HeroCard extends ThumbnailCard {

    /**
     * Creates a new HeroCard.
     * @param session (Optional) will be used to localize any text.
     */
    constructor(session?: Session);
}

/** Card builder class that simplifies building signin cards. */
export class SigninCard implements IIsAttachment {

    /**
     * Creates a new SigninCard.
     * @param session (Optional) will be used to localize any text.
     */
    constructor(session?: Session);

    /** Title of the Card. */
    text(prompts: TextType, ...args: any[]): SigninCard;

    /** Signin button label and link. */
    button(title: TextType, url: string): SigninCard;

    /** Returns the JSON for the card, */
    toAttachment(): IAttachment;
}

/** Card builder class that simplifies building receipt cards. */
export class ReceiptCard implements IIsAttachment {

    /**
     * Creates a new ReceiptCard.
     * @param session (Optional) will be used to localize any text.
     */
    constructor(session?: Session);

    /** Title of the Card. */
    title(text: TextType, ...args: any[]): ReceiptCard;

    /** Array of receipt items. */
    items(list: IReceiptItem[]|IIsReceiptItem[]): ReceiptCard;

    /** Array of additional facts to display to user (shipping charges and such.) Not all facts will be displayed on all channels. */
    facts(list: IFact[]|IIsFact[]): ReceiptCard;

    /** This action will be activated when user taps on the card. Not all channels support tap actions. */
    tap(action: ICardAction|IIsCardAction): ReceiptCard;

    /** Total amount of money paid (or should be paid.) */
    total(v: string): ReceiptCard;

    /** Total amount of TAX paid (or should be paid.) */
    tax(v: string): ReceiptCard;

    /** Total amount of VAT paid (or should be paid.) */
    vat(v: string): ReceiptCard;

    /** Set of actions applicable to the current card. Not all channels support buttons and the number of allowed buttons varies by channel. */
    buttons(list: ICardAction[]|IIsCardAction[]): ReceiptCard;

    /** Returns the JSON for the card. */
    toAttachment(): IAttachment;
}

/** Builder class to simplify adding items to a receipt card. */
export class ReceiptItem implements IIsReceiptItem {

    /**
     * Creates a new ReceiptItem.
     * @param session (Optional) will be used to localize any text.
     */
    constructor(session?: Session);

    /** Title of the item. */
    title(text: TextType, ...args: any[]): ReceiptItem;

    /** Subtitle appears just below Title field, differs from Title in font styling only. On some channels may be combined with the [title](#title) or [text](#text). */
    subtitle(text: TextType, ...args: any[]): ReceiptItem;

    /** Text field appears just below subtitle, differs from Subtitle in font styling only. */
    text(text: TextType, ...args: any[]): ReceiptItem;

    /** Image to display on the card. Some channels may either send the image as a seperate message or simply include a link to the image. */
    image(img: ICardImage|IIsCardImage): ReceiptItem;

    /** Amount with currency. */
    price(v: string): ReceiptItem;

    /** Number of items of given kind. */
    quantity(v: string): ReceiptItem;

    /** This action will be activated when user taps on the Item bubble. Not all channels support tap actions. */
    tap(action: ICardAction|IIsCardAction): ReceiptItem;

    /** Returns the JSON for the item. */
    toItem(): IReceiptItem;

    /** Creates a new ReceiptItem. */
    static create(session: Session, price: string, title?: TextType): ReceiptItem;
}

/** Builder class to simplify creating a list of facts for a card like a receipt. */
export class Fact implements IIsFact {

    /**
     * Creates a new Fact.
     * @param session (Optional) will be used to localize any text.
     */
    constructor(session?: Session);

    /** Display name of the fact. */
    key(text: TextType, ...args: any[]): Fact;

    /** Display value of the fact. */
    value(v: string): Fact;

    /** Returns the JSON for the fact. */
    toFact(): IFact;

    /** Creates a new Fact. */
    static create(session: Session, value: string, key?: TextType): Fact;
}


/**
 * Implement support for named actions which can be bound to a dialog to handle global utterances from the user like "help" or
 * "cancel". Actions get pushed onto and off of the dialog stack as part of dialogs so these listeners can
 * come into and out of scope as the conversation progresses. You can also bind named to actions to buttons
 * which let your bot respond to button clicks on cards that have maybe scrolled off the screen.
 */
export class ActionSet {
    /**
     * Returns a clone of an existing ActionSet.
     * @param copyTo (Optional) instance to copy the current object to. If missing a new instance will be created.
     */
    clone(copyTo?: ActionSet): ActionSet;

    /**
     * Called once for each dialog within a library to give the dialog a chance to add its
     * `triggerAction()` to the libraries global action set.  These triggers get mapped to
     * a `beginDialogAction()` that starts the dialog when the trigger condition is met.
     * @param actions Libraries global action set.
     * @param dialogId The fully qualified ID of the dialog to trigger.
     */
    addDialogTrigger(actions: ActionSet, dialogId: string): void;

    /**
     * Called during the [Library.findRoutes()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.library#findroutes)
     * call for each dialog on the stack to determine if any of the dialogs actions are triggered
     * by the users utterance.
     * @param context The context of the incoming message as well as the [dialogData](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.session#dialogdata) for the evaluated dialog.
     * @param callback Function to invoke with the top candidate route(s).
     */
    findActionRoutes(context: IRecognizeDialogContext, callback: (err: Error, results: IRouteResult[]) => void): void;

    /**
     * Selects the route that had the highest confidence score for the utterance.
     * @param session Session object for the current conversation.
     * @param route Results returned from the call to [findActionRoutes()](#findactionroute).
     */
    selectActionRoute(session: Session, route: IRouteResult): void;
}

/**
 * Base class for all dialogs. Dialogs are the core component of the BotBuilder
 * framework. Bots use Dialogs to manage arbitrarily complex conversations with
 * a user.
 */
export abstract class Dialog extends ActionSet {
    /**
     * Called when a new dialog session is being started.
     * @param session Session object for the current conversation.
     * @param args (Optional) arguments passed to the dialog by its parent.
     */
    begin<T>(session: Session, args?: T): void;

    /**
     * Called when a new reply message has been received from a user.
     *
     * Derived classes should implement this to process the message received from the user.
     * @param session Session object for the current conversation.
     * @param recognizeResult Results returned from a prior call to the dialogs [recognize()](#recognize) method.
     */
    abstract replyReceived(session: Session, recognizeResult: IRecognizeResult): void;

    /**
     * A child dialog has ended and the current one is being resumed.
     * @param session Session object for the current conversation.
     * @param result Result returned by the child dialog.
     */
    dialogResumed<T>(session: Session, result: IDialogResult<T>): void;

    /**
     * Called when a root dialog is being interrupted by another dialog. This gives the dialog
     * that's being interrupted a chance to run custom logic before it's removed from the stack.
     *
     * The dialog itself is responsible for clearing the dialog stack and starting the new dialog.
     * @param session Session object for the current conversation.
     * @param dialogId ID of the dialog that should be started.
     * @param dialogArgs Arguments that should be passed to the new dialog.
     */
    dialogInterrupted(session: Session, dialogId: string, dialogArgs: any): void;

    /**
     * Parses the users utterance and assigns a score from 0.0 - 1.0 indicating how confident the
     * dialog is that it understood the users utterance.  This method is always called for the active
     * dialog on the stack.  A score of 1.0 will indicate a perfect match and terminate any further
     * recognition.
     *
     * When the score is less than 1.0, every dialog on the stack will have its
     * [recognizeAction()](#recognizeaction) method called as well to see if there are any named
     * actions bound to the dialog that better matches the users utterance. Global actions registered
     * at the bot level will also be evaluated. If the dialog has a score higher then any bound actions,
     * the dialogs [replyReceived()](#replyreceived) method will be called with the result object
     * returned from the recognize() call.  This lets the dialog pass additional data collected during
     * the recognize phase to the replyReceived() method for handling.
     *
     * Should there be an action with a higher score then the dialog the action will be invoked instead
     * of the dialogs replyReceived() method.  The dialog will stay on the stack and may be resumed
     * at some point should the action invoke a new dialog so dialogs should prepare for unexpected calls
     * to [dialogResumed()](#dialogresumed).
     * @param context The context of the request.
     * @param callback Function to invoke with the recognition results.
     */
    recognize(context: IRecognizeDialogContext, callback: (err: Error, result: IRecognizeResult) => void): void;

    /**
     * Binds an action to the dialog that will make it the active dialog anytime it's triggered.
     * The default behaviour is to interupt any existing dialog by clearing the stack and starting
     * the dialog at the root of the stack.  The dialog being interrupted can intercept this
     * interruption by adding a custom [onInterrupted](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.itriggeractionsoptions#oninterrupted)
     * handler to their trigger action options.  Additionally, you can customize the way the
     * triggered dialog is started by providing a custom [onSelectAction](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.ibegindialogactionsoptions#onselectaction)
     * handler to your trigger action options.
     * @param options Options used to configure the action.
     */
    triggerAction(options: ITriggerActionOptions): Dialog;

    /**
     * Binds an action to the dialog that will cancel the dialog anytime it's triggered. When canceled, the
     * dialogs parent will be resumed with a [resumed](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogresult#resumed) code indicating that it was [canceled](/en-us/node/builder/chat-reference/enums/_botbuilder_d_.resumereason#canceled).
     * @param name Unique name to assign the action.
     * @param msg (Optional) message to send the user prior to canceling the dialog.
     * @param options (Optional) options used to configure the action. If [matches](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogactionoptions#matches) is specified the action will listen
     * for the user to say a word or phrase that triggers the action, otherwise the action needs to be bound to a button using [CardAction.dialogAction()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.cardaction#dialogaction)
     * to trigger the action.
     */
    cancelAction(name: string, msg?: TextOrMessageType, options?: ICancelActionOptions): Dialog;

    /**
     * Binds an action to the dialog that will cause the dialog to be reloaded anytime it's triggered. This is
     * useful to implement logic that handle user utterances like "start over".
     * @param name Unique name to assign the action.
     * @param msg (Optional) message to send the user prior to reloading the dialog.
     * @param options (Optional) options used to configure the action. If [matches](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogactionoptions#matches) is specified the action will listen
     * for the user to say a word or phrase that triggers the action, otherwise the action needs to be bound to a button using [CardAction.dialogAction()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.cardaction#dialogaction)
     * to trigger the action. You can also use [dialogArgs](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogactionoptions#dialogargs) to pass additional params to the dialog when reloaded.
     */
    reloadAction(name: string, msg?: TextOrMessageType, options?: IBeginDialogActionOptions): Dialog;

    /**
     * Binds an action to the dialog that will start another dialog anytime it's triggered. The new
     * dialog will be pushed onto the stack so it does not automatically end the current task. The
     * current task will be continued once the new dialog ends. The built-in prompts will automatically
     * re-prompt the user once this happens but that behaviour can be disabled by setting the [promptAfterAction](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.ipromptoptions#promptafteraction)
     * flag when calling a built-in prompt.
     * @param name Unique name to assign the action.
     * @param id ID of the dialog to start.
     * @param options (Optional) options used to configure the action. If [matches](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogactionoptions#matches) is specified the action will listen
     * for the user to say a word or phrase that triggers the action, otherwise the action needs to be bound to a button using [CardAction.dialogAction()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.cardaction#dialogaction)
     * to trigger the action. You can also use [dialogArgs](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogactionoptions#dialogargs) to pass additional params to the dialog being started.
     */
    beginDialogAction(name: string, id: string, options?: IBeginDialogActionOptions): Dialog;

    /**
     * Binds an action that will end the conversation with the user when triggered.
     * @param name Unique name to assign the action.
     * @param msg (Optional) message to send the user prior to ending the conversation.
     * @param options (Optional) options used to configure the action. If [matches](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogactionoptions#matches) is specified the action will listen
     * for the user to say a word or phrase that triggers the action, otherwise the action needs to be bound to a button using [CardAction.dialogAction()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.cardaction#dialogaction)
     * to trigger the action.
     */
    endConversationAction(name: string, msg?: TextOrMessageType, options?: ICancelActionOptions): Dialog;

    /**
     * Binds a custom action to the dialog that will call the passed in [onSelectAction](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogactionoptions#onselectaction)
     * handler when triggered.
     * @param options The options used to configure the action. If [matches](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogactionoptions#matches) is specified the action will listen
     * for the user to say a word or phrase that triggers the action. Custom matching logic can be provided using [onFindAction](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogactionoptions#onfindaction).
     */
    customAction(options: IDialogActionOptions): Library;
}

/**
 * Dialog actions offer static shortcuts to implementing common actions. They also implement support for
 * named actions which can be bound to a dialog to handle global utterances from the user like "help" or
 * "cancel". Actions get pushed onto and off of the dialog stack as part of dialogs so these listeners can
 * come into and out of scope as the conversation progresses. You can also bind named to actions to buttons
 * which let your bot respond to button clicks on cards that have maybe scrolled off the screen.
 */
export class DialogAction {
    /**
     * Returns a closure that will send a simple text message to the user.
     * @param msg Text of the message to send. The message will be localized using the sessions configured [localizer](#localizer). If arguments are passed in the message will be formatted using [sprintf-js](https://github.com/alexei/sprintf.js) (see the docs for details.)
     * @param args (Optional) arguments used to format the final output string.
     */
    static send(msg: string, ...args: any[]): IDialogWaterfallStep;

    /**
     * Returns a closure that will passes control of the conversation to a new dialog.
     * @param id Unique ID of the dialog to start.
     * @param args (Optional) arguments to pass to the dialogs begin() method.
     */
    static beginDialog<T>(id: string, args?: T): IDialogWaterfallStep;

    /**
     * Returns a closure that will end the current dialog.
     * @param result (Optional) results to pass to the parent dialog.
     */
    static endDialog(result?: any): IDialogWaterfallStep;

    /**
     * Returns a closure that wraps a built-in prompt with validation logic. The closure should be used
     * to define a new dialog for the prompt using bot.add('/myPrompt', builder.DialogAction.)
     * @param promptType Type of built-in prompt to validate.
     * @param validator Function used to validate the response. Should return true if the response is valid.
     * @param validator.response The users [IDialogResult.response](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogresult.html#response) returned by the built-in prompt.
     * @example
     * <pre><code>
     * var bot = new builder.BotConnectorBot();
     * bot.add('/', [
     *     function (session) {
     *         session.beginDialog('/meaningOfLife', { prompt: "What's the meaning of life?" });
     *     },
     *     function (session, results) {
     *         if (results.response) {
     *             session.send("That's correct! The meaning of life is 42.");
     *         } else {
     *             session.send("Sorry you couldn't figure it out. Everyone knows that the meaning of life is 42.");
     *         }
     *     }
     * ]);
     * bot.add('/meaningOfLife', builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
     *     return response === '42';
     * }));
     * </code></pre>
     */
    static validatedPrompt(promptType: PromptType, validator: (response: any) => boolean): Dialog;
}


/**
 * A library of related dialogs used for routing purposes. Libraries can be chained together to enable
 * the development of complex bots. The [UniversalBot](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.universalbot.html)
 * class is itself a Library that forms the root of this chain.
 *
 * Libraries of reusable parts can be developed by creating a new Library instance and adding dialogs
 * just as you would to a bot. Your library should have a unique name that corresponds to either your
 * libraries website or NPM module name.  Bots can then reuse your library by simply adding your parts
 * Library instance to their bot using [UniversalBot.library()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.universalbot.html#library).
 * If your library itself depends on other libraries you should add them to your library as a dependency
 * using [Library.library()](#library). You can easily manage multiple versions of your library by
 * adding a version number to your library name.
 *
 * To invoke dialogs within your library bots will need to call [session.beginDialog()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.session.html#begindialog)
 * with a fully qualified dialog id in the form of '<libName>:<dialogId>'. You'll typically hide
 * this from the developer by exposing a function from their module that starts the dialog for them.
 * So calling something like `myLib.someDialog(session, { arg: '' });` would end up calling
 * `session.beginDialog('myLib:someDialog', args);` under the covers.
 *
 * It's worth noting that dialogs are always invoked within the current dialog so once your within
 * a dialog from your library you don't need to prefix every beginDialog() call your with your
 * libraries name. It's only when crossing from one library context to another that you need to
 * include the library name prefix.
 */
export class Library {
    /** Supported [routeType](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.irouteresult#routetype) values returned by default from [findRoutes()](#findroutes). */
    static RouteTypes: {
        /** The route is for one of the libraries global actions that has been triggered. */
        GlobalAction: string;

        /** The route is for an action on the dialog stack that has been triggered. */
        StackAction: string;

        /** The route is for the active dialog on the stack. */
        ActiveDialog: string;
    };

    /**
     * The libraries unique namespace. This is used to issolate the libraries dialogs and localized
     * prompts.
     */
    readonly name: string;

    /**
     * Creates a new instance of the library.
     * @param name Unique namespace for the library.
     */
    constructor(name: string);

    /**
     * Returns a clone of an existing Library.
     * @param copyTo (Optional) instance to copy the current object to. If missing a new instance will be created.
     * @param newName (Optional) if specified the returned copy will be renamed to a new name.
     */
    clone(copyTo?: Library, newName?: string): Library;

    /**
     * Gets or sets the path to the libraries "/locale/" folder containing its localized prompts.
     * The prompts for the library should be stored in a "/locale/<IETF_TAG>/<NAMESPACE>.json" file
     * under this path where "<IETF_TAG>" representes the 2-3 digit language tage for the locale and
     * "<NAMESPACE>" is a filename matching the libraries namespace.
     * @param path (Optional) path to the libraries "/locale/" folder. If specified this will update the libraries path.
     */
    localePath(path?: string): string;

    /**
     * Attempts to match a users text utterance to an intent using the libraries recognizers. See
     * [IIntentRecognizer.recognize()](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iintentrecognizer#recognize)
     * for details.
     * @param context Read-only recognizer context for the current conversation.
     * @param callback Function that should be invoked upon completion of the recognition.
     * @param callback.err Any error that occured during the operation.
     * @param callback.result The result of the recognition operation.
     */
    recognize(context: IRecognizeContext, callback: (err: Error, result: IIntentRecognizerResult) => void): void;

    /**
     * Adds a new recognizer plugin to the library.
     * @param plugin The recognizer to add.
     */
    recognizer(plugin: IIntentRecognizer): IntentDialog;

    /**
     * Searches for candidate routes to handle the current message. To actually initiate the
     * handling of the message you should call [selectRoute()](#selectroute) with one of the
     * returned results.
     *
     * The default search logic can be overriden using [onFindRoute()](#onfindroute) and only the
     * current library is searched so you should call `findRoutes()` seperately for each library
     * within the hierarchy.
     * @param context Read-only recognizer context for the current conversation.
     * @param callback Function that should be invoked with the found routes.
     * @param callback.err Any error that occured during the operation.
     * @param callback.routes List of routes best suited to handle the current message.
     */
    findRoutes(context: IRecognizeContext, callback: (err: Error, routes: IRouteResult[]) => void): void

    /**
     * Replaces [findRoutes()](#findroutes) default route searching logic with a custom
     * implementation.
     * @param handler Function that will be invoked anytime `findRoutes()` is called for the library.
     */
    onFindRoutes(handler: IFindRoutesHandler): void;

    /**
     * Triggers the handling of the current message using the selected route. The default logic can
     * be overriden using [onSelectRoute()](#onselectroute).
     * @param session Session object for the current conversation.
     * @param route Route result returned from a previous call to [findRoutes()](#findroutes).
     */
    selectRoute(session: Session, route: IRouteResult): void;

    /**
     * Replaces the default logic for [selectRoute()](#selectroute) with a custom implementation.
     * @param handler Function that will be invoked anytime `selectRoute()` is called.
     */
    onSelectRoute(handler: ISelectRouteHandler): void;

    /**
     * Gets the active dialogs confidence that it understands the current message. The dialog
     * must be a member of the current library, otherwise a score of 0.0 will be returned.
     * @param context Read-only recognizer context for the current conversation.
     * @param callback Function that should be invoked with the found routes.
     * @param callback.err Any error that occured during the operation.
     * @param callback.routes List of routes best suited to handle the current message.
     * @param dialogStack (Optional) dialog stack to search over. The default behaviour is to search over the sessions current dialog stack.
     */
    findActiveDialogRoutes(context: IRecognizeContext, callback: (err: Error, routes: IRouteResult[]) => void, dialogStack?: IDialogState[]): void;

    /**
     * Routes the current message to the active dialog.
     * @param session Session object for the current conversation.
     * @param route Route result returned from a previous call to [findRoutes()](#findroutes) or [findActiveDialogRoutes()](#findactivedialogroutes).
     */
    selectActiveDialogRoute(session: Session, route: IRouteResult, newStack?: IDialogState[]): void;

    /**
     * Searches the sessions dialog stack to see if any actions have been triggered.
     * @param context Read-only recognizer context for the current conversation.
     * @param callback Function that should be invoked with the found routes.
     * @param callback.err Any error that occured during the operation.
     * @param callback.routes List of routes best suited to handle the current message.
     * @param dialogStack (Optional) dialog stack to search over. The default behaviour is to search over the sessions current dialog stack.
     */
    findStackActionRoutes(context: IRecognizeContext, callback: (err: Error, routes: IRouteResult[]) => void, dialogStack?: IDialogState[]): void;

    /**
     * Routes the current message to a triggered stack action.
     * @param session Session object for the current conversation.
     * @param route Route result returned from a previous call to [findRoutes()](#findroutes) or [findStackActionRoutes()](#findstackactionroutes).
     */
    selectStackActionRoute(session: Session, route: IRouteResult, newStack?: IDialogState[]): void;

    /**
     * Searches the library to see if any global actions have been triggered.
     * @param context Read-only recognizer context for the current conversation.
     * @param callback Function that should be invoked with the found routes.
     * @param callback.err Any error that occured during the operation.
     * @param callback.routes List of routes best suited to handle the current message.
     */
    findGlobalActionRoutes(context: IRecognizeContext, callback: (err: Error, routes: IRouteResult[]) => void): void;

    /**
     * Routes the current message to a triggered global action.
     * @param session Session object for the current conversation.
     * @param route Route result returned from a previous call to [findRoutes()](#findroutes) or [findGlobalActionRoutes()](#findglobalactionroutes).
     */
    selectGlobalActionRoute(session: Session, route: IRouteResult, newStack?: IDialogState[]): void;

    /**
     * Registers or returns a dialog from the library.
     * @param id Unique ID of the dialog being regsitered or retrieved.
     * @param dialog (Optional) dialog or waterfall to register.
     * * __dialog:__ _{Dialog}_ - Dialog to add.
     * * __dialog:__ _{IDialogWaterfallStep[]}_ - Waterfall of steps to execute. See [IDialogWaterfallStep](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogwaterfallstep.html) for details.
     * * __dialog:__ _{IDialogWaterfallStep}_ - Single step waterfall. Calling a built-in prompt or starting a new dialog will result in the current dialog ending upon completion of the child prompt/dialog.
     * @param replace (Optional) if true, the dialog should replace the existing dialog if already registered.
     */
    dialog(id: string, dialog?: Dialog|IDialogWaterfallStep[]|IDialogWaterfallStep, replace?:boolean): Dialog;

    /**
     * Searches the library and all of its dependencies for a specific dialog. Returns the dialog
     * if found, otherwise null.
     * @param libName Name of the library containing the dialog.
     * @param dialogId Unique ID of the dialog within the library.
     */
    findDialog(libName: string, dialogId: string): Dialog;

    /**
     * Enumerates all of the libraries dialogs.
     * @param callback Iterator function to call with each dialog.
     * @param callback.dialog The current dialog.
     * @param id Unique ID of the dialog.
     */
    forEachDialog(callback: (dialog: Dialog, id: string) => void): void;

    /**
     * Registers or returns a library dependency.
     * @param lib
     * * __lib:__ _{Library}_ - Library to register as a dependency.
     * * __lib:__ _{string}_ - Unique name of the library to lookup. All dependencies will be searched as well.
     */
    library(lib: Library|string): Library;

    /**
     * Enumerates all of the libraries child libraries. The caller should take appropriate steps to
     * avoid circular references when enumerating the hierarchy. In most cases calling
     * [libraryList()](#librarylist) is a better choice as it already contains logic to avoid cycles.
     * @param callback Iterator function to call with each child libray.
     * @param callback.library The current child.
     */
    forEachLibrary(callback: (library: Library) => void): void;

    /**
     * Returns a list of unique libraries within the hierarchy. Should be called on the root of the
     * library hierarchy and avoids cycles created when two child libraries reference the same
     * dependent library.
     * @param reverse (Optional) If true list will be generated from the leaves up meaning the root library will be listed last. The default value is false which means it will be generated from the roots down and the root library will be listed first.
     */
    libraryList(reverse?: boolean): Library[];

    /**
     * Registers a global action that will start another dialog anytime it's triggered. The new
     * dialog will be pushed onto the stack so it does not automatically end any current task. The
     * current task will be continued once the new dialog ends. The built-in prompts will automatically
     * re-prompt the user once this happens but that behaviour can be disabled by setting the [promptAfterAction](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.ipromptoptions#promptafteraction)
     * flag when calling a built-in prompt.
     * @param name Unique name to assign the action.
     * @param id ID of the dialog to start.
     * @param options (Optional) options used to configure the action. If [matches](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogactionoptions#matches) is specified the action will listen
     * for the user to say a word or phrase that triggers the action, otherwise the action needs to be bound to a button using [CardAction.dialogAction()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.cardaction#dialogaction)
     * to trigger the action. You can also use [dialogArgs](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogactionoptions#dialogargs) to pass additional params to the dialog being started.
     */
    beginDialogAction(name: string, id: string, options?: IDialogActionOptions): Dialog;

    /**
     * Registers a global action that will end the conversation with the user when triggered.
     * @param name Unique name to assign the action.
     * @param msg (Optional) message to send the user prior to ending the conversation.
     * @param options (Optional) options used to configure the action. If [matches](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogactionoptions#matches) is specified the action will listen
     * for the user to say a word or phrase that triggers the action, otherwise the action needs to be bound to a button using [CardAction.dialogAction()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.cardaction#dialogaction)
     * to trigger the action.
     */
    endConversationAction(name: string, msg?: TextOrMessageType, options?: ICancelActionOptions): Dialog;

    /**
     * Registers a custom global action that will call the passed in [onSelectAction](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogactionoptions#onselectaction)
     * handler when triggered.
     * @param options The options used to configure the action. If [matches](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogactionoptions#matches) is specified the action will listen
     * for the user to say a word or phrase that triggers the action. Custom matching logic can be provided using [onFindAction](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.idialogactionoptions#onfindaction).
     */
    customAction(options: IDialogActionOptions): Library;

    /**
     * Helper method called from the various route finding methods to manage adding a candidate
     * route to the result set.
     *
     * * If the score is greater then the current best match in the set a new result set will be returned containing just the new match.
     * * If the score is equal to the current best match it will be added to the existing set.
     * * If the score is less than the current best match it will be ignored.
     * @param route The candidate route to add to the set.
     * @param current (Optional) result set to add the route too. If missing then a new set with just the route will be returned.
     */
    static addRouteResult(route: IRouteResult, current?: IRouteResult[]): IRouteResult[];

    /**
     * Finds the best route to use within a result set containing multiple ambiguous routes. The
     * following disambigution strategy will be used:
     *
     * 1. __<custom>__: Custom route types are the highest priority and will alwsays be preferred. This lets the developer override routing within a bot in very powerful way.
     * 2. __ActiveDialog__: The active dialog is the next highest priority.
     * 3. __StackAction__: Stack actions are the next highest priority and the action with the deepest stack position will be returned.
     * 4. __GlobalAction__: Global actions are the lowest priority. If a `dialogStack` is past in the actions from the library deepest on the stack will be favored. Otherwise the first one will be returned.
     * @param routes Array of candidate routes to filter.
     * @param dialogStack (Optional) dialog stack used to determine which libraries global actions to favor.
     * @param rootLibraryName (Optional) library namespace to prefer when disambiguating global actions and there's no dialogs on the stack.
     */
    static bestRouteResult(routes: IRouteResult[], dialogStack?: IDialogState[], rootLibraryName?: string): IRouteResult;
}

/**
 * Base class for built-in prompts and can be used to build new custom prompts. The Prompt class
 * provides the basic logic to prompt/re-prompt a user and provides a set of extensible hooks to
 * customize the prompts recognition of the users reply as well as the output sent to the user.
 *
 * Prompts should always have at least one [onRecognize()](#onrecognize) handler registered and
 * they support adding any number of [matches()](#matches) or [matchesAny()](#matchesany) handlers
 * which can be used to add special user initiated commands to the prompt.  For instance, the
 * built-in prompts add a `matches('BotBuilder.RepeatIntent')` to listen for a user to ask to
 * have a prompt repeated, causing the prompt to send its initial prompt again.
 */
export class Prompt<T extends IPromptFeatures> extends Dialog {
    /**
     * Creates a new customizable instance of the prompt. Your new prompt should be added as a
     * dialog to either a bot or library.
     * @param features (Optional) features used to customize the prompts behaviour.
     */
    constructor(features?: IPromptFeatures);

    /**
     * Processes messages received from the user. Called by the dialog system.
     * @param session Session object for the current conversation.
     * @param (Optional) recognition results returned from a prior call to the dialogs [recognize()](#recognize) method.
     */
    replyReceived(session: Session, recognizeResult?: IRecognizeResult): void;

    /**
     * Sends a prompt to the user for the current turn. This can be called from a [matches()][#matches]
     * handler to manually send a prompt/reprompt to the user. To force sending of the initial prompt
     * you would need to set `session.dialogData.turns = 0;` before calling `sendPrompt()`.
     * @param session Session object for the current conversation.
     */
    sendPrompt(session: Session): void;

    /**
     * Creates the message to send for the prompt. This is called automatically by [sendPrompt()](#sendprompt)
     * so in most cases you'll want to register a [onFormatMessage()](#onformatmessage) handler to
     * customize the message sent for a prompt. You should only need to call this method if you're
     * implementing your own `sendPrompt()` logic.
     * @param session Session object for the current conversation.
     * @param text Current prompt/retryPrompt text.
     * @param speak Current speak/retrySpeak SSML. This value may be null.
     * @param callback Function to receive the created message.
     */
    formatMessage(session: Session, text: TextType, speak: TextType, callback: (err: Error, msg: IMessage) => void): void;

    /**
     * Registers a handler that will be called every time the prompt is about to send a message to
     * the user. You can use this hook to implement your own custom prompt sending logic.
     *
     * Multiple handlers can be registered and calling `next()` will invoke the next handler in
     * the chain. The final handler performs the prompts default logic which is to create a new
     * message using [formatMessage()](#formatmessage) and then send it.
     * @param handler Function that will be called anytime [sendPrompt()](#sendprompt) is called.
     */
    onPrompt(handler: (session: Session, next: Function) => void): Prompt<any>;

    /**
     * Registers a handler that will be called to create the outgoing [IMessage](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.imessage)
     * that will be sent for the prompt.  This handler is only called when the current
     * prompt/retryPrompt is of type `string|string[]`. Anytime the prompt/retryPrompt is an
     * `IMessage|IIsMessage` the configured message is used so your handler will not be called.
     *
     * Multiple handlers can be registered and the first handler to call `callback()` with a message
     * will be used. Calling `callback(null, null)` will cause processing to move to the next handler
     * in the chain.
     * @param handler Function that will be called to create an `IMessage` for the current prompt. Call `callback()` with either a message or `null` to continue processing.
     */
    onFormatMessage(handler: (session: Session, text: TextType, speak: TextType, callback: (err: Error, message?: IMessage) => void)=> void): Prompt<any>;

    /**
     * Registers a handler that will be called everytime the prompt receives a reply from the user.
     * The handlers `callback()` can be used to return a confidence score that it understood the
     * users input as well as the value that should be returned to the caller of the prompt.
     *
     * Calling `callback(null, 1.0, true);` would indicate a high confidence that the user answered
     * the prompt and would return a `boolean` true as the response from the prompt. Any response
     * type is possible, including objects. Calling `callback(null, 0.0);` indicates that the users
     * input was not understood at all and that they should be re-prompted.
     *
     * Multiple handlers can be registered and unlike the other handler types, all of the registered
     * will be called and handler providing the highest confidence score will be chosen as the winner.
     * When customizing one of the built-in prompt types you'll often want to disable the prompts
     * default recognizer logic. This can be achieved by setting the [features](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.ipromptfeatures)
     * of the prompt when you create it. Just keep in mind that if you completely disable the prompts
     * default recognizer logic, you'll need to do all of the recognition yourself.
     * @param handler Function that will be called to recognize the users reply to a prompt.
     */
    onRecognize(handler: (context: IRecognizeDialogContext, callback: (err: Error, score: number, response?: any) => void) => void): Prompt<any>;

    /**
     * Invokes a handler when a given intent is detected in the users utterance. For `string` based
     * intents, the intent can either be an intent returned by a [recognizer()](#recognizer) registered
     * for the prompt or it can be an intent that flows in from a global [recognizer()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.library#recognizer).
     *
     * > __NOTE:__ The full details of the match, including the list of intents & entities detected, will be passed to the [args](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iintentrecognizerresult) of the first waterfall step or dialog that's started.
     * @param intent
     * * __intent:__ _{RegExp}_ - A regular expression that will be evaluated to detect the users intent.
     * * __intent:__ _{string}_ - A named intent returned by an [IIntentRecognizer](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iintentrecognizer) plugin that will be used to match the users intent.
     * @param dialogId
     * * __dialogId:__ _{string} - The ID of a dialog to begin when the intent is matched.
     * * __dialogId:__ _{IDialogWaterfallStep[]}_ - Waterfall of steps to execute when the intent is matched.
     * * __dialogId:__ _{IDialogWaterfallStep}_ - Single step waterfall to execute when the intent is matched. Calling a built-in prompt or starting a new dialog will result in the current dialog ending upon completion of the child prompt/dialog.
     * @param dialogArgs (Optional) arguments to pass the dialog that started when `dialogId` is a _{string}_.
     */
    matches(intent: RegExp|string, dialogId: string|IDialogWaterfallStep[]|IDialogWaterfallStep, dialogArgs?: any): IntentDialog;

    /**
     * Invokes a handler when any of the given intents are detected in the users utterance. For `string` based
     * intents, the intent can either be an intent returned by a [recognizer()](#recognizer) registered
     * for the prompt or it can be an intent that flows in from a global [recognizer()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.library#recognizer).
     *
     * > __NOTE:__ The full details of the match, including the list of intents & entities detected, will be passed to the [args](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iintentrecognizerresult) of the first waterfall step or dialog that's started.
     * @param intent
     * * __intent:__ _{RegExp[]}_ - Array of regular expressions that will be evaluated to detect the users intent.
     * * __intent:__ _{string[]}_ - Array of named intents returned by an [IIntentRecognizer](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iintentrecognizer) plugin that will be used to match the users intent.
     * @param dialogId
     * * __dialogId:__ _{string} - The ID of a dialog to begin when the intent is matched.
     * * __dialogId:__ _{IDialogWaterfallStep[]}_ - Waterfall of steps to execute when the intent is matched.
     * * __dialogId:__ _{IDialogWaterfallStep}_ - Single step waterfall to execute when the intent is matched. Calling a built-in prompt or starting a new dialog will result in the current dialog ending upon completion of the child prompt/dialog.
     * @param dialogArgs (Optional) arguments to pass the dialog that started when `dialogId` is a _{string}_.
     */
    matchesAny(intent: RegExp[]|string[], dialogId: string|IDialogWaterfallStep[]|IDialogWaterfallStep, dialogArgs?: any): IntentDialog;

    /**
     * Adds a new recognizer plugin to the Prompt which will be run everytime the user replies
     * to the prompt.
     * @param plugin The recognizer to add.
     */
    recognizer(plugin: IIntentRecognizer): IntentDialog;

    /** The prompts current configured set of features. */
    public features: T;

    /**
     * Applies a new set of features for the prompt. Normally called from a derived classes constructor
     * to apply feature options passed in to the derived class.
     * @param features New features to apply.
     */
    protected updateFeatures(features: T): Prompt<any>;

    /**
     * Returns the text for a prompt that's been localized using the namespace of the prompts caller.
     * @param session Current session for the conversation.
     * @param text Prompt to localize.
     * @param namespace (Optional) library namespace to use for localizing the prompt. By default the namespace of the prompts caller will be used.
     */
    static gettext(session: Session, text: TextType, namespace?: string): string;
}

/** Customizable attachment prompt. */
export class PromptAttachment extends Prompt<IPromptAttachmentFeatures> {
    /**
     * Creates a new customizable instance of the prompt. Your new prompt should be added as a
     * dialog to either a bot or library.
     * @param features (Optional) features used to customize the prompts behaviour.
     */
    constructor(features?: IPromptAttachmentFeatures);
}

/** Customizable choice prompt. */
export class PromptChoice extends Prompt<IPromptChoiceFeatures> {
    /**
     * Creates a new customizable instance of the prompt. Your new prompt should be added as a
     * dialog to either a bot or library.
     * @param features (Optional) features used to customize the prompts behaviour.
     */
    constructor(features?: IPromptChoiceFeatures);

    /**
     * Returns the list of dynamic or static choices for the prompt. This method is typically called
     * twice, once to get the list of choices to display and a second time to get the list of choices
     * to recognize over.
     * @param context Read-only recognizer context for the current conversation.
     * @param recognizePhase If true, the list of choices will be used to recognize the users utterance. Otherwise they will be used to render a list of available choices to the user.
     * @param callback Function that will be called with the prompts list of choices.
     */
    findChoices(context: IRecognizeContext, recognizePhase: boolean, callback: (err: Error, choices: IChoice[]) => void): void;

    /**
     * Registers a handler to provide a dynamic list of choices. The handler will be called at least
     * twice during the lifetime of the prompt. Once to generate a list of choices to display to the
     * user and a second time to retrieve the list of choices to compare against the users utterance.
     * No caching of the returned choices is done and the handler will be called for every turn of ability
     * conversation so you shoudl implement your own caching as appropriate.
     *
     * Multiple handlers can be registered and the first handler to return a valid (not `null`) list
     * of choices will be used.
     * @param handler Function to call when a list of choices is need. The `recognizePhase` parameter will be "true" if the choices will be used to recognize the users response.
     */
    onChoices(handler: (context: IRecognizeContext, callback: (err: Error, choices?: IChoice[]) => void, recognizePhase?: boolean) => void): PromptChoice;

    /**
     * Returns a message containing a list of choices.
     * @param session Current session for the conversation.
     * @param listStyle Style of list to include in message.
     * @param text Text of the message.
     * @param speak (Optional) SSML to return with the message. This can be null.
     * @param choices (Optional) list of choices to include in the message. If ommitted the message will be sent without including choices.
     */
    static formatMessage(session: Session, listStyle: ListStyle, text: TextType, speak?: TextType, choices?: IChoice[]): IMessage;
}

/** Customizable confirmation prompt. */
export class PromptConfirm extends PromptChoice {
    /**
     * Creates a new customizable instance of the prompt. Your new prompt should be added as a
     * dialog to either a bot or library.
     * @param features (Optional) features used to customize the prompts behaviour.
     */
    constructor(features?: IPromptFeatures);
}

/** Customizable confirmation prompt. */
export class PromptNumber extends Prompt<IPromptFeatures> {
    /**
     * Creates a new customizable instance of the prompt. Your new prompt should be added as a
     * dialog to either a bot or library.
     * @param features (Optional) features used to customize the prompts behaviour.
     */
    constructor(features?: IPromptFeatures);
}

/** Customizable text prompt. */
export class PromptText extends Prompt<IPromptTextFeatures> {
    /**
     * Creates a new customizable instance of the prompt. Your new prompt should be added as a
     * dialog to either a bot or library.
     * @param features (Optional) features used to customize the prompts behaviour.
     */
    constructor(features?: IPromptTextFeatures);
}

/** Customizable time prompt. */
export class PromptTime extends Prompt<IPromptFeatures> {
    /**
     * Creates a new customizable instance of the prompt. Your new prompt should be added as a
     * dialog to either a bot or library.
     * @param features (Optional) features used to customize the prompts behaviour.
     */
    constructor(features?: IPromptFeatures);
}

declare global {
    /**
     * Extensible set of built-in prompts. For TypeScript developers you can use interface decliration
     * merging to add new global prompts in a way that will be TypeScript aware.
     */
    export interface IPrompts {
        /**
         * Captures from the user a raw string of text.
         * @param session Session object for the current conversation.
         * @param prompt
         * * __prompt:__ _{string}_ - Initial message to send the user.
         * * __prompt:__ _{string[]}_ - Array of possible messages to send user. One will be chosen at random.
         * * __prompt:__ _{IMessage|IIsMessage}_ - Initial message to send the user. Message can contain attachments.
         * @param options (Optional) parameters to control the behaviour of the prompt.
         */
        text(session: Session, prompt: TextOrMessageType, options?: IPromptTextOptions): void;

        /**
         * Prompts the user to enter a number.
         * @param session Session object for the current conversation.
         * @param prompt
         * * __prompt:__ _{string}_ - Initial message to send the user.
         * * __prompt:__ _{string[]}_ - Array of possible messages to send user. One will be chosen at random.
         * * __prompt:__ _{IMessage|IIsMessage}_ - Initial message to send the user. Message can contain attachments.
         * @param options (Optional) parameters to control the behaviour of the prompt.
         */
        number(session: Session, prompt: TextOrMessageType, options?: IPromptNumberOptions): void;

        /**
         * Prompts the user to confirm an action with a yes/no response.
         * @param session Session object for the current conversation.
         * @param prompt
         * * __prompt:__ _{string}_ - Initial message to send the user.
         * * __prompt:__ _{string[]}_ - Array of possible messages to send user. One will be chosen at random.
         * * __prompt:__ _{IMessage|IIsMessage}_ - Initial message to send the user. Message can contain attachments.
         * @param options (Optional) parameters to control the behaviour of the prompt.
         */
        confirm(session: Session, prompt: TextOrMessageType, options?: IPromptOptions): void;

        /**
         * Prompts the user to choose from a list of options.
         * @param session Session object for the current conversation.
         * @param prompt
         * * __prompt:__ _{string}_ - Initial message to send the user.
         * * __prompt:__ _{string[]}_ - Array of possible messages to send user. One will be chosen at random.
         * * __prompt:__ _{IMessage|IIsMessage}_ - Initial message to send the user. Message can contain attachments. Any [listStyle](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.ipromptoptions.html#liststyle) options will be ignored.
         * @param choices
         * * __choices:__ _{string}_ - List of choices as a pipe ('|') delimted string.
         * * __choices:__ _{Object}_ - List of choices expressed as an Object map. The objects field names will be used to build the list of values.
         * * __choices:__ _{string[]}_ - List of choices as an array of strings.
         * * __choices:__ _{IChoice[]}_ - List of choices as an array of IChoice objects.
         * @param options (Optional) parameters to control the behaviour of the prompt.
         */
        choice(session: Session, prompt: TextOrMessageType, choices: string|Object|string[]|IChoice[], options?: IPromptChoiceOptions): void;

        /**
         * Prompts the user to enter a time.
         * @param session Session object for the current conversation.
         * @param prompt
         * * __prompt:__ _{string}_ - Initial message to send the user.
         * * __prompt:__ _{string[]}_ - Array of possible messages to send user. One will be chosen at random.
         * * __prompt:__ _{IMessage|IIsMessage}_ - Initial message to send the user. Message can contain attachments.
         * @param options (Optional) parameters to control the behaviour of the prompt.
         */
        time(session: Session, prompt: TextOrMessageType, options?: IPromptOptions): void;

        /**
         * Prompts the user to upload a file attachment.
         * @param session Session object for the current conversation.
         * @param prompt
         * * __prompt:__ _{string}_ - Initial message to send the user.
         * * __prompt:__ _{string[]}_ - Array of possible messages to send user. One will be chosen at random.
         * * __prompt:__ _{IMessage|IIsMessage}_ - Initial message to send the user. Message can contain attachments.
         * @param options (Optional) parameters to control the behaviour of the prompt.
         */
        attachment(session: Session, prompt: TextOrMessageType, options?: IPromptAttachmentOptions): void;

        /**
         * Prompts the user to disambiguate multiple triggered actions. Should typically be called
         * from [UniversalBot.onDisambiguateRoute()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.universalbot#ondisambiguateroute).
         * @example
         * <pre><code>
         * builder.Prompts.disambiguate(session, "What would you like to cancel?", {
         *      "Cancel Item": cancelItemRoute,
         *      "Cancel Order": cancelOrderRoute,
         *      "Neither": null
         * });
         * </code></pre>
         * @param session Session object for the current conversation.
         * @param prompt
         * * __prompt:__ _{string}_ - Initial message to send the user.
         * * __prompt:__ _{string[]}_ - Array of possible messages to send user. One will be chosen at random.
         * * __prompt:__ _{IMessage|IIsMessage}_ - Initial message to send the user. Message can contain attachments.
         * @param choices Map of routes to select from. The key is the choice label that will be displayed to the user.
         * @param options (Optional) parameters to control the behaviour of the prompt.
         */
        disambiguate(session: Session, prompt: TextOrMessageType, choices: IDisambiguateChoices, options?: IPromptOptions): void;

        /**
         * Replaces a built-in prompt with a new implementation. This lets you completely customize the
         * way a prompt like [builder.Prompts.time()](#time) works globally.
         * @param type The type of built-in prompt that you're customizing.
         * @param dialog The dialog that you wish to use in place of the default prompt. Be aware that your
         * dialog will be registered in the system namespace ('BotBuilder') which can potentially impact
         * localization and calls to [session.beginDialog()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.session#begindialog). For calls to
         * beginDialog() from within your custom prompt you'll want to prefix your dialogID's with the
         * namespace of the library you're calling into, typically '*' for the bots default namespace. So
         * you would use `session.beginDialog('*:help');` to call a "help" dialog from your custom prompt.
         */
        customize(type: PromptType, dialog: Dialog): IPrompts;

        /** __DEPRECATED__ this is no longer used as of v3.8. Use custom prompts instead. */
        configure(options: IPromptsOptions): void;
    }
}

/**
 * Provides global access to the SDK's built-in prompts. New prompts can be added by simply
 * adding a new function using `builder.Prompts.myPrompt = function (session, prompt, options) { }`.
 * If you are using TypeScript you will first want to add the signature for your prompt to the [IPrompts](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.__global.iprompts)
 * interface using interface decleration merging.
 * @example
 * <pre><code>
 * declare global {
 *      interface IPrompts {
 *           myPrompt(session: Session, prompt: string, options?: IPromptOptions): void;
 *      }
 *
 *
 * }
 * builder.Prompts.disambiguate(session, "What would you like to cancel?", {
 *      "Cancel Item": cancelItemRoute,
 *      "Cancel Order": cancelOrderRoute,
 *      "Neither": null
 * });
 * </code></pre>
 */
export const Prompts: IPrompts;

/** Federates a recognize() call across a set of intent recognizers. */
export class IntentRecognizerSet extends IntentRecognizer {
    /** Number of recognizers in the set. */
    readonly length: number;

    /**
     * Constructs a new instance of an IntentRecognizerSet.
     * @param options (Optional) options used to initialize the set and control the flow of recognition.
     */
    constructor(options?: IIntentRecognizerSetOptions);

    /**
     * Returns a clone of an existing IntentRecognizerSet.
     * @param copyTo (Optional) instance to copy the current object to. If missing a new instance will be created.
     */
    clone(copyTo?: IntentRecognizerSet): IntentRecognizerSet;

    /** Implements the actual recognition logic. */
    onRecognize(context: IRecognizeContext, callback: (err: Error, result: IIntentRecognizerResult) => void): void;

    /**
     * Adds a new recognizer plugin to the set.
     * @param plugin The recognizer to add.
     */
    recognizer(plugin: IIntentRecognizer): IntentDialog;
}

/** Identifies a users intent and optionally extracts entities from a users utterance. */
export class IntentDialog extends Dialog {
    /**
     * Constructs a new instance of an IntentDialog.
     * @param options (Optional) options used to initialize the dialog.
     */
    constructor(options?: IIntentDialogOptions);

    /**
     * Processes messages received from the user. Called by the dialog system.
     * @param session Session object for the current conversation.
     * @param (Optional) recognition results returned from a prior call to the dialogs [recognize()](#recognize) method.
     */
    replyReceived(session: Session, recognizeResult?: IRecognizeResult): void;

    /**
     * Called when the dialog is first loaded after a call to [session.beginDialog()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.session#begindialog). This gives the bot an opportunity to process arguments passed to the dialog.  Handlers should always call the `next()` function to continue execution of the dialogs main logic.
     * @param handler Function to invoke when the dialog begins.
     * @param handler.session Session object for the current conversation.
     * @param handler.args Arguments passed to the dialog in the `session.beginDialog()` call.
     * @param handler.next Function to call when handler is finished to continue execution of the dialog.
     */
    onBegin(handler: (session: Session, args: any, next: () => void) => void): IntentDialog;

    /**
     * Invokes a handler when a given intent is detected in the users utterance.
     *
     * > __NOTE:__ The full details of the match, including the list of intents & entities detected, will be passed to the [args](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iintentrecognizerresult) of the first waterfall step or dialog that's started.
     * @param intent
     * * __intent:__ _{RegExp}_ - A regular expression that will be evaluated to detect the users intent.
     * * __intent:__ _{string}_ - A named intent returned by an [IIntentRecognizer](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iintentrecognizer) plugin that will be used to match the users intent.
     * @param dialogId
     * * __dialogId:__ _{string} - The ID of a dialog to begin when the intent is matched.
     * * __dialogId:__ _{IDialogWaterfallStep[]}_ - Waterfall of steps to execute when the intent is matched.
     * * __dialogId:__ _{IDialogWaterfallStep}_ - Single step waterfall to execute when the intent is matched. Calling a built-in prompt or starting a new dialog will result in the current dialog ending upon completion of the child prompt/dialog.
     * @param dialogArgs (Optional) arguments to pass the dialog that started when `dialogId` is a _{string}_.
     */
    matches(intent: RegExp|string, dialogId: string|IDialogWaterfallStep[]|IDialogWaterfallStep, dialogArgs?: any): IntentDialog;

    /**
     * Invokes a handler when any of the given intents are detected in the users utterance.
     *
     * > __NOTE:__ The full details of the match, including the list of intents & entities detected, will be passed to the [args](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iintentrecognizerresult) of the first waterfall step or dialog that's started.
     * @param intent
     * * __intent:__ _{RegExp[]}_ - Array of regular expressions that will be evaluated to detect the users intent.
     * * __intent:__ _{string[]}_ - Array of named intents returned by an [IIntentRecognizer](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iintentrecognizer) plugin that will be used to match the users intent.
     * @param dialogId
     * * __dialogId:__ _{string} - The ID of a dialog to begin when the intent is matched.
     * * __dialogId:__ _{IDialogWaterfallStep[]}_ - Waterfall of steps to execute when the intent is matched.
     * * __dialogId:__ _{IDialogWaterfallStep}_ - Single step waterfall to execute when the intent is matched. Calling a built-in prompt or starting a new dialog will result in the current dialog ending upon completion of the child prompt/dialog.
     * @param dialogArgs (Optional) arguments to pass the dialog that started when `dialogId` is a _{string}_.
     */
    matchesAny(intent: RegExp[]|string[], dialogId: string|IDialogWaterfallStep[]|IDialogWaterfallStep, dialogArgs?: any): IntentDialog;

    /**
     * The default handler to invoke when there are no handlers that match the users intent.
     *
     * > __NOTE:__ The full details of the recognition attempt, including the list of intents & entities detected, will be passed to the [args](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iintentrecognizerresult) of the first waterfall step or dialog that's started.
     * @param dialogId
     * * __dialogId:__ _{string} - The ID of a dialog to begin.
     * * __dialogId:__ _{IDialogWaterfallStep[]}_ - Waterfall of steps to execute.
     * * __dialogId:__ _{IDialogWaterfallStep}_ - Single step waterfall to execute. Calling a built-in prompt or starting a new dialog will result in the current dialog ending upon completion of the child prompt/dialog.
     * @param dialogArgs (Optional) arguments to pass the dialog that started when `dialogId` is a _{string}_.
     */
    onDefault(dialogId: string|IDialogWaterfallStep[]|IDialogWaterfallStep, dialogArgs?: any): IntentDialog;

    /**
     * Adds a new recognizer plugin to the intent dialog.
     * @param plugin The recognizer to add.
     */
    recognizer(plugin: IIntentRecognizer): IntentDialog;
}

/**
 * Base class for all core recognizers. Allows conditional execution of a recognizer and post
 * filtering of recognized intents.  Derived class should override the abstract
 * [onRecognize()](#onrecognize) method.
 */
export abstract class IntentRecognizer implements IIntentRecognizer {
    /**
     * Overriden by derived class to implement the actual recognition logic.
     * @param context Contextual information for a received message that's being recognized.
     * @param callback Function to invoke with the results of the recognition operation.
     * @param callback.error Any error that occurred or `null`.
     * @param callback.result The result of the recognition.
     */
    abstract onRecognize(context: IRecognizeContext, callback: (err: Error, result: IIntentRecognizerResult) => void): void;

    /**
     * Attempts to match a users text utterance to an intent.
     * @param context Contextual information for a received message that's being recognized.
     * @param callback Function to invoke with the results of the recognition operation.
     */
    public recognize(context: IRecognizeContext, callback: (err: Error, result: IIntentRecognizerResult) => void): void;

    /**
     * Registers a function to conditionally enable/disable the recognizer. Multiple handlers can
     * be registered and the new handler will be executed before any other handlers.
     * @param handler Function called for every message. You should call `callback(null, true)` for every message that should be recognized.
     */
    public onEnabled(handler: (context: IRecognizeContext, callback: (err: Error, enabled: boolean) => void) => void): IntentRecognizer;

    /**
     * Registers a function to filter the output from the recognizer. Multiple handlers can be
     * registered and the new handler will be executed after any other handlers.
     * @param handler Function called for every message that results in an intent with a score greater then 0.0. You should call `callback(null, { score: 0.0, intent: null })` to block an intent from being returned.
     */
    public onFilter(handler: (context: IRecognizeContext, result: IIntentRecognizerResult, callback: (err: Error, result: IIntentRecognizerResult) => void) => void): IntentRecognizer;
}

/**
 * Intent recognizer plugin that detects a users intent using a regular expression. Multiple
 * expressions can be passed in to support recognizing across multiple languages.
 */
export class RegExpRecognizer extends IntentRecognizer {
    /**
     * Constructs a new instance of the recognizer.
     * @param intent The name of the intent to return when the expression is matched.
     * @param expressions Either an individual expression used for all utterances or a map of per/locale expressions conditionally used depending on the locale of the utterance.
     */
    constructor(intent: string, expressions: RegExp|IRegExpMap);

    /** Implements the actual recognition logic. */
    onRecognize(context: IRecognizeContext, callback: (err: Error, result: IIntentRecognizerResult) => void): void;
}

/**
 * Version of the [RegExpRecognizer](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.regexprecognizer)
 * that uses the frameworks localization system to retrieve a localized regular expression.
 * The lookup key in the index.json file should be provided and upon receiving a message for
 * a new locale, the recognizer will retrieve the localized expression and a new case insensitive
 * `RegExp` will be created and used to recognize the intent.
 *
 * Libraries can use this feature to let a bot override their default matching expressions. just
 * create instances of the recognizer using the namespace of your library and bot developers can
 * customize your matching expressions by using a `<namespace>.json` file in their locale directory.
 */
export class LocalizedRegExpRecognizer extends IntentRecognizer {
    /**
     * Constructs a new instance of the recognizer.
     * @param intent The name of the intent to return when the expression is matched.
     * @param key Key for the expression in the `index.json` or `<namespace>.json` file.
     * @param namespace (Optional) library namespace to lookup `key` from. The expression should be a string in the `<namespace>.json` locale file.
     */
    constructor(intent: string, key: string, namespace?: string);

    /** Implements the actual recognition logic. */
    onRecognize(context: IRecognizeContext, callback: (err: Error, result: IIntentRecognizerResult) => void): void;
}

/**
 * Intent recognizer plugin that detects a users intent using Microsofts [Language Understanding Intelligent Service (LUIS)](https://luis.ai)
 * The service URLs for multiple LUIS models (apps) can be passed in to support recognition
 * across multiple languages.
 */
export class LuisRecognizer extends IntentRecognizer {
    /**
     * Constructs a new instance of the recognizer.
     * @param models Either an individual LUIS model used for all utterances or a map of per/locale models conditionally used depending on the locale of the utterance.
     */
    constructor(models: string|ILuisModelMap);

    /** Implements the actual recognition logic. */
    onRecognize(context: IRecognizeContext, callback: (err: Error, result: IIntentRecognizerResult) => void): void;

    /**
     * Calls LUIS to recognizing intents & entities in a users utterance.
     * @param utterance The text to pass to LUIS for recognition.
     * @param serviceUri URI for LUIS App hosted on http://luis.ai.
     * @param callback Callback to invoke with the results of the intent recognition step.
     * @param callback.err Error that occured during the recognition step.
     * @param callback.intents List of intents that were recognized.
     * @param callback.entities List of entities that were recognized.
     */
    static recognize(utterance: string, modelUrl: string, callback: (err: Error, intents?: IIntent[], entities?: IEntity[]) => void): void;
}

/**
 * Utility class used to parse & resolve common entities like datetimes received from LUIS.
 */
export class EntityRecognizer {
    /**
     * Searches for the first occurance of a specific entity type within a set.
     * @param entities Set of entities to search over.
     * @param type Type of entity to find.
     */
    static findEntity(entities: IEntity[], type: string): IEntity;

    /**
     * Finds all occurrences of a specific entity type within a set.
     * @param entities Set of entities to search over.
     * @param type Type of entity to find.
     */
    static findAllEntities(entities: IEntity[], type: string): IEntity[];

    /**
     * Parses a date from either a users text utterance or a set of entities.
     * @param value
     * * __value:__ _{string}_ - Text utterance to parse. The utterance is parsed using the [Chrono](http://wanasit.github.io/pages/chrono/) library.
     * * __value:__ _{IEntity[]}_ - Set of entities to resolve.
     * @returns A valid Date object if the user spoke a time otherwise _null_.
     */
    static parseTime(value: string | IEntity[]): Date;

    /**
     * Calculates a Date from a set of datetime entities.
     * @param entities List of entities to extract date from.
     * @returns The successfully calculated Date or _null_ if a date couldn't be determined.
     */
    static resolveTime(entities: IEntity[]): Date;

    /**
     * Recognizes a time from a users utterance. The utterance is parsed using the [Chrono](http://wanasit.github.io/pages/chrono/) library.
     * @param utterance Text utterance to parse.
     * @param refDate (Optional) reference date used to calculate the final date.
     * @returns An entity containing the resolved date if successful or _null_ if a date couldn't be determined.
     */
    static recognizeTime(utterance: string, refDate?: Date): IEntity;

    /**
     * Parses a number from either a users text utterance or a set of entities.
     * @param value
     * * __value:__ _{string}_ - Text utterance to parse.
     * * __value:__ _{IEntity[]}_ - Set of entities to resolve.
     * @returns A valid number otherwise _Number.NaN_.
     */
    static parseNumber(value: string | IEntity[]): number;

    /**
     * Parses a boolean from a users utterance.
     * @param value Text utterance to parse.
     * @returns A valid boolean otherwise _undefined_.
     */
    static parseBoolean(value: string): boolean;

    /**
     * Finds the best match for a users utterance given a list of choices.
     * @param choices
     * * __choices:__ _{string}_ - Pipe ('|') delimited list of values to compare against the users utterance.
     * * __choices:__ _{Object}_ - Object used to generate the list of choices. The objects field names will be used to build the list of choices.
     * * __choices:__ _{string[]}_ - Array of strings to compare against the users utterance.
     * @param utterance Text utterance to parse.
     * @param threshold (Optional) minimum score needed for a match to be considered. The default value is 0.6.
     */
    static findBestMatch(choices: string | Object | string[], utterance: string, threshold?: number): IFindMatchResult;

    /**
     * Finds all possible matches for a users utterance given a list of choices.
     * @param choices
     * * __choices:__ _{string}_ - Pipe ('|') delimited list of values to compare against the users utterance.
     * * __choices:__ _{Object}_ - Object used to generate the list of choices. The objects field names will be used to build the list of choices.
     * * __choices:__ _{string[]}_ - Array of strings to compare against the users utterance.
     * @param utterance Text utterance to parse.
     * @param threshold (Optional) minimum score needed for a match to be considered. The default value is 0.6.
     */
    static findAllMatches(choices: string | Object | string[], utterance: string, threshold?: number): IFindMatchResult[];

    /**
     * Converts a set of choices into an expanded array.
     * @param choices
     * * __choices:__ _{string}_ - Pipe ('|') delimited list of values.
     * * __choices:__ _{Object}_ - Object used to generate the list of choices. The objects field names will be used to build the list of choices.
     * * __choices:__ _{string[]}_ - Array of strings. This will just be echoed back as the output.
     */
    static expandChoices(choices: string | Object | string[]): string[];
}

/**
 * Allows for the creation of custom dialogs that are based on a simple closure. This is useful for
 * cases where you want a dynamic conversation flow or you have a situation that just doesn’t map
 * very well to using a waterfall.  The things to keep in mind:
 * * Your dialogs closure is can get called in two different contexts that you potentially need to
 *   test for. It will get called as expected when the user send your dialog a message but if you
 *   call another prompt or dialog from your closure it will get called a second time with the
 *   results from the prompt/dialog. You can typically test for this second case by checking for the
 *   existant of an `args.resumed` property. It's important to avoid getting yourself into an
 *   infinite loop which can be easy to do.
 * * Unlike a waterfall your dialog will not automatically end. It will remain the active dialog
 *   until you call [session.endDialog()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.session.html#enddialog).
 */
export class SimpleDialog extends Dialog {
    /**
     * Creates a new custom dialog based on a simple closure.
     * @param handler The function closure for your dialog.
     * @param handler.session Session object for the current conversation.
     * @param handler.args
     * * __args:__ _{any}_ - For the first call to the handler this will be either `null` or the value of any arguments passed to [Session.beginDialog()](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.session.html#begindialog).
     * * __args:__ _{IDialogResult}_ - If the handler takes an action that results in a new dialog being started those results will be returned via subsequent calls to the handler.
     */
    constructor(handler: (session: Session, args?: any | IDialogResult<any>) => void);

    /**
     * Processes messages received from the user. Called by the dialog system.
     * @param session Session object for the current conversation.
     */
    replyReceived(session: Session): void;
}

/** Allows for the creation of custom dialogs that are based on a waterfall. */
export class WaterfallDialog extends Dialog {
    /**
     * Creates a new waterfall dialog.
     * @param steps Sequence of function(s) that should be called in order.
     */
    constructor(steps: IDialogWaterfallStep|IDialogWaterfallStep[]);

    /**
     * Processes messages received from the user. Called by the dialog system.
     * @param session Session object for the current conversation.
     */
    replyReceived(session: Session): void;

    /**
     * Registers a handler that will be called before every step of the waterfall. The handlers
     * `next()` function will execute either the next handler in the chain or the waterfall step
     * itself.  This handler lets a developer skip steps and process the args being passed to
     * the next step.
     *
     * Multiple handlers may be registered and the handler being registered will be executed before
     * any other handlers in the chain.
     * @param handler Function to invoke in-between each waterfall step.
     */
    onBeforeStep(handler: (session: Session, step: number, args: any, next: (step: number, args: any) => void) => void): WaterfallDialog;

    /**
     * Creates a function that can drive a waterfall. Everytime the function is called it will drive
     * the waterfall forward by invoking the next step of the waterfall. The function uses
     * `session.dialogData` to hold the waterfalls current step.
     *
     * To drive the waterfall forward, the `args` param passed to the handler should have
     * `args.resumed = builder.ResumeReason.completed`. Once the end of the waterfall is reached
     * it will automatically call `session.endDialogWithResult(args)` returning the passed in args.
     * If the `args` param is missing the `resumed` field the waterfall will simply start over
     * calling the first step.
     * @param steps Waterfall steps to execute.
     */
    static createHandler(steps: IDialogWaterfallStep[]): (session: Session, args?: any) => void;
}

/** Default in memory storage implementation for storing user & session state data. */
export class MemoryBotStorage implements IBotStorage {
    /** Returns data from memory for the given context. */
    getData(context: IBotStorageContext, callback: (err: Error, data: IBotStorageData) => void): void;

    /** Saves data to memory for the given context. */
    saveData(context: IBotStorageContext, data: IBotStorageData, callback?: (err: Error) => void): void;

    /** Deletes in-memory data for the given context. */
    deleteData(context: IBotStorageContext): void;
}

/** Manages your bots conversations with users across multiple channels. */
export class UniversalBot extends Library  {
    /**
     * Creates a new instance of the UniversalBot.
     * @param connector (Optional) the default connector to use for requests. If there's not a more specific connector registered for a channel then this connector will be used./**
     * @param defaultDialog (Optional) default handler of received messages. This can either be an individual function or a waterfall sequence.
     * @param libraryName (Optional) library namespace for the bot.  The default value is '*'.
     */
    constructor(connector?: IConnector, defaultDialog?: IDialogWaterfallStep|IDialogWaterfallStep[], libraryName?: string);

    /**
     * Returns a clone of an existing bot.
     * @param copyTo (Optional) instance to copy the current object to. If missing a new instance will be created.
     * @param newName (Optional) if specified the returned copy will be renamed to a new name.
     */
    clone(copyTo?: UniversalBot, newName?: string): UniversalBot;

    /**
     * Registers an event listener. The bot will emit its own events as it processes incoming and outgoing messages. It will also forward activity related events emitted from the connector, giving you one place to listen for all activity from your bot. The flow of events from the bot is as follows:
     *
     * #### Message Received
     * When the bot receives a new message it will emit the following events in order:
     *
     * > lookupUser -> receive -> incoming -> getStorageData -> routing
     *
     * Any [receive middleware](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.imiddlewaremap#receive) that's been installed will be executed between the 'receive' and 'incoming' events. After the 'routing' event is emitted any
     * [botbuilder middleware](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.imiddlewaremap#botbuilder) will be executed prior to dispatching the message to the bots active dialog.
     *
     * #### Connector Activity Received
     * Connectors can emit activity events to signal things like a user is typing or that they friended a bot. These activities get routed through middleware like messages but they are not routed through the bots dialog system.  They are only ever emitted as events.
     *
     * The flow of connector events is:
     *
     * > lookupUser -> receive -> (activity)
     *
     * #### Message sent
     * Bots can send multiple messages so the session will batch up all outgoing message and then save the bots current state before delivering the sent messages.  You'll see a single 'saveStorageData' event emitted and then for every outgoing message in the batch you'll see the following
     * sequence of events:
     *
     * > send -> outgoing
     *
     * Any [send middleware](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.imiddlewaremap#send) that's been installed will be executed between the 'send' and 'outgoing' events.
     *
     * @param event Name of the event. Bot and connector specific event types:
     * #### Bot Events
     * - __error:__ An error occured. Passed a JavaScript `Error` object.
     * - __lookupUser:__ The user is for an address is about to be looked up. Passed an [IAddress](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iaddress.html) object.
     * - __receive:__ An incoming message has been received. Passed an [IEvent](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.ievent.html) object.
     * - __incoming:__ An incoming message has been received and processed by middleware. Passed an [IMessage](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.imessage.html) object.
     * - __routing:__ An incoming message has been bound to a session and is about to be routed through any session middleware and then dispatched to the active dialog for processing. Passed a [Session](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.session.html) object.
     * - __send:__ An outgoing message is about to be sent to middleware for processing. Passed an [IMessage](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.imessage.html) object.
     * - __outgoing:__ An outgoing message has just been sent through middleware and is about to be delivered to the users chat client.
     * - __getStorageData:__ The sessions persisted state data is being loaded from storage. Passed an [IBotStorageContext](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.ibotstoragecontext.html) object.
     * - __saveStorageData:__ The sessions persisted state data is being written to storage. Passed an [IBotStorageContext](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.ibotstoragecontext.html) object.
     *
     * #### ChatConnector Events
     * - __conversationUpdate:__ Your bot was added to a conversation or other conversation metadata changed. Passed an [IConversationUpdate](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iconversationupdate.html) object.
     * - __contactRelationUpdate:__ The bot was added to or removed from a user's contact list. Passed an [IContactRelationUpdate](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.icontactrelationupdate.html) object.
     * - __typing:__ The user or bot on the other end of the conversation is typing. Passed an [IEvent](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.ievent.html) object.
     *
     * @param listener Function to invoke.
     * @param listener.data The data for the event. Consult the list above for specific types of data you can expect to receive.
     */
    on(event: string, listener: (data: any) => void): void;

    /**
     * Sets a setting on the bot.
     * @param name Name of the property to set. Valid names are properties on [IUniversalBotSettings](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iuniversalbotsettings.html).
     * @param value The value to assign to the setting.
     */
    set(name: string, value: any): UniversalBot;

    /**
     * Returns the current value of a setting.
     * @param name Name of the property to return. Valid names are properties on [IUniversalBotSettings](/en-us/node/builder/chat-reference/interfaces/_botbuilder_d_.iuniversalbotsettings.html).
     */
    get(name: string): any;

    /**
     * Registers or returns a connector for a specific channel.
     * @param channelId Unique ID of the channel. Use a channelId of '*' to reference the default connector.
     * @param connector (Optional) connector to register. If ommited the connector for __channelId__ will be returned.
     */
    connector(channelId: string, connector?: IConnector): IConnector;

    /**
     * Installs middleware for the bot. Middleware lets you intercept incoming and outgoing events/messages.
     * @param args One or more sets of middleware hooks to install.
     */
    use(...args: IMiddlewareMap[]): UniversalBot;

    /**
     * Called when a new event is received. This can be called manually to mimic the bot receiving a message from the user.
     * @param events Event or (array of events) received.
     * @param done (Optional) function to invoke once the operation is completed.
     */
    receive(events: IEvent|IEvent[], done?: (err: Error) => void): void;

    /**
     * Proactively starts a new dialog with the user. Any current conversation between the bot and user will be replaced with a new dialog stack.
     * @param address Address of the user to start a new conversation with. This should be saved during a previous conversation with the user. Any existing conversation or dialog will be immediately terminated.
     * @param dialogId ID of the dialog to begin.
     * @param dialogArgs (Optional) arguments to pass to dialog.
     * @param done (Optional) function to invoke once the operation is completed.
     */
    beginDialog(address: IAddress, dialogId: string, dialogArgs?: any, done?: (err: Error) => void): void;

    /**
     * Sends a message to the user without disrupting the current conversations dialog stack.
     * @param messages The message (or array of messages) to send the user.
     * @param done (Optional) function to invoke once the operation is completed.
     * @param done.err Any error that occured during the send.
     * @param done.addresses An array of address objects returned for each individual message within the batch. These address objects contain the ID of the posted messages so can be used to update or delete a message in the future.
     */
    send(messages: IIsMessage|IMessage|IMessage[], done?: (err: Error, addresses?: IAddress[]) => void): void;

    /**
     * Returns information about when the last turn between the user and a bot occured. This can be called
     * before [beginDialog](#begindialog) to determine if the user is currently in a conversation with the
     * bot.
     * @param address Address of the user to lookup. This should be saved during a previous conversation with the user.
     * @param callback Function to invoke with the results of the query.
     */
    isInConversation(address: IAddress, callback: (err: Error, lastAccess: Date) => void): void;

    /**
     * Loads a session object for an arbitrary address.
     * @param address Address of the user/session to load. This should be saved during a previous conversation with the user.
     * @param callback Function to invoke with the loaded session.
     */
    loadSession(address: IAddress, callback: (err: Error, session: Session) => void): void;

    /**
     * Replaces the bots default route disambiguation logic with a custom implementation.
     * @param handler Function that will be invoked with the candidate routes to dispatch an incoming message to.
     */
    onDisambiguateRoute(handler: IDisambiguateRouteHandler): void;
}

/** Connects a UniversalBot to multiple channels via the Bot Framework. */
export class ChatConnector implements IConnector, IBotStorage {

    /**
     * Creates a new instnace of the ChatConnector.
     * @param settings (Optional) config params that let you specify the bots App ID & Password you were assigned in the Bot Frameworks developer portal.
     */
    constructor(settings?: IChatConnectorSettings);

    /** Registers an Express or Restify style hook to listen for new messages. */
    listen(): (req: any, res: any) => void;

    /** Used to register a handler for receiving incoming invoke events. */
    onInvoke(handler: (event: IEvent, cb?: (err: Error, body: any, status?: number) => void) => void): void;

    /** Called by the UniversalBot at registration time to register a handler for receiving incoming events from a channel. */
    onEvent(handler: (events: IEvent[], callback?: (err: Error) => void) => void): void;

    /** Called by the UniversalBot to deliver outgoing messages to a user. */
    send(messages: IMessage[], done: (err: Error, addresses?: IAddress[]) => void): void;

    /** Called when a UniversalBot wants to start a new proactive conversation with a user. The connector should return a properly formated __address__ object with a populated __conversation__ field. */
    startConversation(address: IAddress, done: (err: Error, address?: IAddress) => void): void;

    /** Replaces an existing message with a new one. */
    update(message: IMessage, done: (err: Error, address?: IAddress) => void): void;

    /** Deletes an existing message. */
    delete(address: IAddress, done: (err: Error) => void): void;

    /** Reads in data from the Bot Frameworks state service. */
    getData(context: IBotStorageContext, callback: (err: Error, data: IBotStorageData) => void): void;

    /** Writes out data to the Bot Frameworks state service. */
    saveData(context: IBotStorageContext, data: IBotStorageData, callback?: (err: Error) => void): void;

    /** Gets the current access token for the bot. */
    getAccessToken(callback: (err: Error, accessToken: string) => void): void;

    /**
     * Called after the connector receives, authenticates, and prepares an event. Derived classes
     * can override this to filter out incoming events before they're dispatched to the bot.
     * Calling `super.onDispatchMessage(event, callback)` will perform the connectors default
     * logic.
     * @param events Array of 0 or more events to dispatch.
     * @param callback Function that will be called after all events have been dispatched.
     */
    protected onDispatchEvents(events: IEvent[], callback: (err: Error, body: any, status?: number) => void): void;

    /** Configuration parameters for the connector. */
    protected settings: IChatConnectorSettings;
}

/** Connects a UniversalBot to the command line via a console window. */
export class ConsoleConnector implements IConnector {
    /** Starts the connector listening to stdIn. */
    listen(): ConsoleConnector;

    /** Sends a message through the connector. */
    processMessage(line: string): ConsoleConnector;

    /** Sends a event through the connector. */
    processEvent(event: IEvent): ConsoleConnector;

    /** Used to register a handler for receiving incoming invoke events. */
    onInvoke(handler: (event: IEvent, cb?: (err: Error, body: any, status?: number) => void) => void): void;

    /** Called by the UniversalBot at registration time to register a handler for receiving incoming events from a channel. */
    onEvent(handler: (events: IEvent[], callback?: (err: Error) => void) => void): void;

    /** Called by the UniversalBot to deliver outgoing messages to a user. */
    send(messages: IMessage[], callback: (err: Error, addresses?: IAddress[]) => void): void;

    /** Called when a UniversalBot wants to start a new proactive conversation with a user. The connector should return a properly formated __address__ object with a populated __conversation__ field. */
    startConversation(address: IAddress, callback: (err: Error, address?: IAddress) => void): void;
}

export class Middleware {
    /**
     * Installs a piece of middleware that manages the versioning of a bots dialogs.
     * @param options Settings to configure the bahviour of the installed middleware.
     */
    static dialogVersion(options: IDialogVersionOptions): IMiddlewareMap;

    /**
     * Adds a first run experience to a bot. The middleware uses Session.userData to store the latest version of the first run dialog the user has been through. Incrementing the version number can force users to run back through either the full or a partial first run dialog.
     * @param options Settings to configure the bahviour of the installed middleware.
     */
    static firstRun(options: IFirstRunOptions): IMiddlewareMap;

    /**
     * Installs a piece of middleware that will always send an initial typing indication to the user.
     * This is useful because it lets you send the typing indication before any LUIS models are called.
     * The typing indicator will only stay valid for a few seconds so if you're performing any long running
     * operations you may want to send an additional typing indicator using [session.sendTyping](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.session#sendtyping).
     */
    static sendTyping(): IMiddlewareMap;
}

/** __DEPRECATED__ no longer supported as of v3.8. Use custom prompts instead. */
export class SimplePromptRecognizer implements IPromptRecognizer {
    recognize(args: IPromptRecognizerArgs, callback: (result: IPromptResult<any>) => void): void;
}

/** __DEPRECATED__ no longer supported as of v3.8. Use custom prompts instead. */
export interface IPromptRecognizer {
    recognize<T>(args: IPromptRecognizerArgs, callback: (result: IPromptRecognizerResult<T>) => void): void;
}

/** __DEPRECATED__ no longer supported as of v3.8. Use custom prompts instead. */
export interface IPromptRecognizerArgs {
    promptType: PromptType;
    text: string;
    language?: string;
    enumValues?: string[];
    refDate?: number;
}

/** __DEPRECATED__ no longer supported as of v3.8. Use custom prompts instead. */
export interface IPromptsOptions {
    recognizer?: IPromptRecognizer
}

/** __DEPRECATED__ the new prompt system just uses IPromptOptions. */
export interface IPromptArgs extends IPromptOptions {
    retryCnt?: number;
    promptType: PromptType;
    enumsValues?: string[];
}

/** __DEPRECATED__ use an [IntentDialog](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.intentdialog) with a [LuisRecognizer](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.luisrecognizer) instead. */
export class LuisDialog extends Dialog {
    replyReceived(session: Session, recognizeResult?: IRecognizeResult): void;
}

/** __DEPRECATED__ use an [IntentDialog](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.intentdialog) instead. */
export class CommandDialog extends Dialog {
    replyReceived(session: Session, recognizeResult?: IRecognizeResult): void;
}

/** __DEPRECATED__ use [UniversalBot](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.universalbot) and a [ChatConnector](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.chatconnector) instead. */
export class BotConnectorBot extends Dialog {
    replyReceived(session: Session, recognizeResult?: IRecognizeResult): void;
}

/** __DEPRECATED__ use [UniversalBot](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.universalbot) and a [ConsoleConnector](/en-us/node/builder/chat-reference/classes/_botbuilder_d_.consoleconnector) instead. */
export class TextBot extends Dialog {
    replyReceived(session: Session, recognizeResult?: IRecognizeResult): void;
}
