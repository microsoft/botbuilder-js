// 
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
// 
// Microsoft Bot Framework: http://botframework.com
// 
// Bot Builder SDK Github:
// https://github.com/Microsoft/BotBuilder
// 
// Copyright (c) Microsoft Corporation
// All rights reserved.
// 
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

type TextType = string|string[];
type MessageType = IMessage|IIsMessage;
type TextOrMessageType = TextType|MessageType;
type CardActionType = ICardAction|IIsCardAction;
type CardImageType = ICardImage|IIsCardImage;
type AttachmentType = IAttachment|IIsAttachment;
type MatchType = RegExp|string|(RegExp|string)[];
type ValueListType = string|string[];


interface IEvent {
    type: string;
    address: IAddress;
    agent?: string;
    source?: string;
    sourceEvent?: any;
    user?: IIdentity;
}

interface IMessage extends IEvent {
    timestamp?: string;              // UTC Time when message was sent (set by service)
    localTimestamp?: string;         // Local time when message was sent (set by client or bot, Ex: 2016-09-23T13:07:49.4714686-07:00)
    summary?: string;                // Text to be displayed by as fall-back and as short description of the message content in e.g. list of recent conversations 
    text?: string;                   // Message text
    speak?: string;                  // Spoken message as Speech Synthesis Markup Language (SSML)
    textLocale?: string;             // Identified language of the message text.
    attachments?: IAttachment[];     // This is placeholder for structured objects attached to this message 
    suggestedActions: ISuggestedActions; // Quick reply actions that can be suggested as part of the message 
    entities?: any[];                // This property is intended to keep structured data objects intended for Client application e.g.: Contacts, Reservation, Booking, Tickets. Structure of these object objects should be known to Client application.
    textFormat?: string;             // Format of text fields [plain|markdown|xml] default:markdown
    attachmentLayout?: string;       // AttachmentLayout - hint for how to deal with multiple attachments Values: [list|carousel] default:list
    inputHint?: string;              // Hint for clients to indicate if the bot is waiting for input or not.
    value?: any;                     // Open-ended value.
    name?: string;                   // Name of the operation to invoke or the name of the event.
    relatesTo?: IAddress;            // Reference to another conversation or message.
    code?: string;                   // Code indicating why the conversation has ended.
}

interface IIsMessage {
    toMessage(): IMessage;
}

interface IMessageOptions {
    attachments?: AttachmentType[];
    attachmentLayout?: string;
    entities?: any[];
    textFormat?: string;
    inputHint?: string;
}

interface IIdentity {
    id: string;                     // Channel specific ID for this identity
    name?: string;                  // Friendly name for this identity
    isGroup?: boolean;              // If true the identity is a group.  
}

interface IAddress {
    channelId: string;              // Unique identifier for channel
    user: IIdentity;                // User that sent or should receive the message
    bot?: IIdentity;                // Bot that either received or is sending the message
    conversation?: IIdentity;       // Represents the current conversation and tracks where replies should be routed to. 
}

interface IAttachment {
    contentType: string;            // MIME type string which describes type of attachment 
    content?: any;                  // (Optional) object structure of attachment 
    contentUrl?: string;            // (Optional) reference to location of attachment content
}

interface IIsAttachment {
    toAttachment(): IAttachment;
}

interface ISigninCard {
    text: string;                   // Title of the Card 
    buttons: ICardAction[];         // Sign in action 
}

interface IKeyboard {
    buttons: ICardAction[];         // Set of actions applicable to the current card. 
}

interface IThumbnailCard extends IKeyboard {
    title: string;                  // Title of the Card 
    subtitle: string;               // Subtitle appears just below Title field, differs from Title in font styling only 
    text: string;                   // Text field appears just below subtitle, differs from Subtitle in font styling only 
    images: ICardImage[];           // Messaging supports all media formats: audio, video, images and thumbnails as well to optimize content download. 
    tap: ICardAction;               // This action will be activated when user taps on the section bubble. 
}

interface IMediaCard extends IKeyboard{
    title: string;                  // Title of the Card 
    subtitle: string;               // Subtitle appears just below Title field, differs from Title in font styling only 
    text: string;                   // Text field appears just below subtitle, differs from Subtitle in font styling only 
    image: ICardImage;              // Messaging supports all media formats: audio, video, images and thumbnails as well to optimize content download.
    media: ICardMediaUrl[];         // Media source for video, audio or animations
    autoloop: boolean;              // Should the media source reproduction run in a lool
    autostart: boolean;             // Should the media start automatically
    shareable: boolean;             // Should media be shareable
    value: any;                     // Supplementary parameter for this card.
}

interface IVideoCard extends IMediaCard {
    aspect: string;                 //Hint of the aspect ratio of the video or animation. (16:9)(4:3)
}

interface IAnimationCard extends IMediaCard {
}

interface IAudioCard extends IMediaCard {
}

interface IIsCardMedia{
    toMedia(): ICardMediaUrl;      //Returns the media to serialize
}

interface ICardMediaUrl {
    url: string,                    // Url to audio, video or animation media
    profile: string                 // Optional profile hint to the client to differentiate multiple MediaUrl objects from each other
}

interface IReceiptCard {
    title: string;                  // Title of the Card 
    items: IReceiptItem[];          // Array of receipt items.
    facts: IFact[];                 // Array of key-value pairs. 
    tap: ICardAction;                   // This action will be activated when user taps on the section bubble. 
    total: string;                  // Total amount of money paid (or should be paid) 
    tax: string;                    // Total amount of TAX paid (or should be paid) 
    vat: string;                    // Total amount of VAT paid (or should be paid) 
    buttons: ICardAction[];             // Set of actions applicable to the current card. 
}

interface IReceiptItem {
    title: string;                  // Title of the Card 
    subtitle: string;               // Subtitle appears just below Title field, differs from Title in font styling only 
    text: string;                   // Text field appears just below subtitle, differs from Subtitle in font styling only 
    image: ICardImage;
    price: string;                  // Amount with currency 
    quantity: string;               // Number of items of given kind 
    tap: ICardAction;               // This action will be activated when user taps on the Item bubble. 
}

interface IIsReceiptItem {
    toItem(): IReceiptItem;
}

interface ICardAction {
    type: string;                   // Defines the type of action implemented by this button.  
    title: string;                  // Text description which appear on the button. 
    value: string;                  // Parameter for Action. Content of this property depends on Action type. 
    image?: string;                 // (Optional) Picture which will appear on the button, next to text label. 
    text?: string;                  // (Optional) Text for this action.
    displayText?: string;           // (Optional) text to display in the chat feed if the button is clicked.
}

interface IIsCardAction {
    toAction(): ICardAction;
}

interface ISuggestedActions {
    to?: string[]; // Optional recipients of the suggested actions. Not supported in all channels.
    actions: ICardAction[]; // Quick reply actions that can be suggested as part of the message 
}


interface IIsSuggestedActions {
    toSuggestedActions(): ISuggestedActions;
}

interface ICardImage {
    url: string;                    // Thumbnail image for major content property. 
    alt: string;                    // Image description intended for screen readers 
    tap: ICardAction;                   // Action assigned to specific Attachment. E.g. navigate to specific URL or play/open media content 
}

interface IIsCardImage {
    toImage(): ICardImage;
}

interface IFact {
    key: string;                    // Name of parameter 
    value: string;                  // Value of parameter 
}

interface IIsFact {
    toFact(): IFact;
}

interface IRating {
    score: number;                  // Score is a floating point number. 
    max: number;                    // Defines maximum score (e.g. 5, 10 or etc). This is mandatory property. 
    text: string;                   // Text to be displayed next to score. 
}

interface ILocationV2 {
    altitude?: number;
    latitude: number;
    longitude: number;
}

interface ILocalizer {
    load(locale: string, callback?: (err?: Error) => void): void;     
    defaultLocale(locale?: string): string   
    gettext(locale: string, msgid: string, namespace?: string): string;
    trygettext(locale: string, msgid: string, namespace?: string): string;
    ngettext(locale: string, msgid: string, msgid_plural: string, count: number, namespace?: string): string;
}

interface IDefaultLocalizerSettings {
    botLocalePath?: string;
    defaultLocale?: string;
}

interface ISessionState {
    callstack: IDialogState[];
    lastAccess: number;
    version: number;
}

interface IDialogState {
    id: string;
    state: any;
}

interface IIntent {
    intent: string;
    score: number;
}

interface IEntity<T> {
    entity: T;
    type: string;
    startIndex?: number;
    endIndex?: number;
    score?: number;
    //resolution?: IEntityResolution<T>;
}

interface IEntityResolution<T> {
    value?: string;
    values?: string[]|ILuisValues[];
}

interface ILuisValues {
    timex: string;
    type: string;
    value: string;
    Start: string;
    End: string;
}

interface ICompositeEntity<T> {
    parentType: string;
    value: string;
    children: ICompositeEntityChild<T>[]
}

interface ICompositeEntityChild<T> {
    type: string;
    value: string;
}