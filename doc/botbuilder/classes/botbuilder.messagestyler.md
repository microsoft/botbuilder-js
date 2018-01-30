[Bot Builder SDK - Core](../README.md) > [MessageStyler](../classes/botbuilder.messagestyler.md)



# Class: MessageStyler


A set of utility functions to assist with the formatting of the various message types a bot can return.

**Usage Example**

    // init message object
    const message = MessageStyler.attachment(
        CardStyler.heroCard(
            'White T-Shirt',
            ['https://example.com/whiteShirt.jpg'],
            ['buy']
         )
    );

    context.reply(message); // send message

## Index

### Methods

* [attachment](botbuilder.messagestyler.md#attachment)
* [carousel](botbuilder.messagestyler.md#carousel)
* [contentUrl](botbuilder.messagestyler.md#contenturl)
* [list](botbuilder.messagestyler.md#list)
* [suggestedActions](botbuilder.messagestyler.md#suggestedactions)
* [text](botbuilder.messagestyler.md#text)



---
## Methods
<a id="attachment"></a>

### «Static» attachment

► **attachment**(attachment: *[Attachment](../interfaces/botbuilder.attachment.md)*, text?: *`undefined`⎮`string`*, speak?: *`undefined`⎮`string`*): [Partial]()[Activity](../interfaces/botbuilder.activity.md)



*Defined in [libraries/botbuilder/lib/messageStyler.d.ts:57](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/messageStyler.d.ts#L57)*



Returns a single message activity containing an attachment.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| attachment | [Attachment](../interfaces/botbuilder.attachment.md)   |  Adaptive card to include in the message. |
| text | `undefined`⎮`string`   |  (Optional) text of the message. |
| speak | `undefined`⎮`string`   |  (Optional) SSML to include with the message. |





**Returns:** [Partial]()[Activity](../interfaces/botbuilder.activity.md)





___

<a id="carousel"></a>

### «Static» carousel

► **carousel**(attachments: *[Attachment](../interfaces/botbuilder.attachment.md)[]*, text?: *`undefined`⎮`string`*, speak?: *`undefined`⎮`string`*): [Partial]()[Activity](../interfaces/botbuilder.activity.md)



*Defined in [libraries/botbuilder/lib/messageStyler.d.ts:86](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/messageStyler.d.ts#L86)*



Returns a message that will display a set of attachments using a carousel layout.

**Usage Example**

    // init message object
    let messageWithCarouselOfCards = MessageStyler.carousel([
      CardStyler.heroCard('title1', ['imageUrl1'], ['button1']),
      CardStyler.heroCard('title2', ['imageUrl2'], ['button2']),
      CardStyler.heroCard('title3', ['imageUrl3'], ['button3'])
    ]);

    context.reply(messageWithCarouselOfCards); // send the message


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| attachments | [Attachment](../interfaces/botbuilder.attachment.md)[]   |  Array of attachments to include in the message. |
| text | `undefined`⎮`string`   |  (Optional) text of the message. |
| speak | `undefined`⎮`string`   |  (Optional) SSML to include with the message. |





**Returns:** [Partial]()[Activity](../interfaces/botbuilder.activity.md)





___

<a id="contenturl"></a>

### «Static» contentUrl

► **contentUrl**(url: *`string`*, contentType: *`string`*, name?: *`undefined`⎮`string`*, text?: *`undefined`⎮`string`*, speak?: *`undefined`⎮`string`*): [Partial]()[Activity](../interfaces/botbuilder.activity.md)



*Defined in [libraries/botbuilder/lib/messageStyler.d.ts:105](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/messageStyler.d.ts#L105)*



Returns a message that will display a single image or video to a user.

**Usage Example**

    // init message object
    let imageOrVideoMessage = MessageStyler.contentUrl('url', 'content-type', 'optional-name', 'optional-text', 'optional-speak');

    context.reply(imageOrVideoMessage); // send the message


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| url | `string`   |  Url of the image/video to send. |
| contentType | `string`   |  The MIME type of the image/video. |
| name | `undefined`⎮`string`   |  (Optional) Name of the image/video file. |
| text | `undefined`⎮`string`   |  (Optional) text of the message. |
| speak | `undefined`⎮`string`   |  (Optional) SSML to include with the message. |





**Returns:** [Partial]()[Activity](../interfaces/botbuilder.activity.md)





___

<a id="list"></a>

### «Static» list

► **list**(attachments: *[Attachment](../interfaces/botbuilder.attachment.md)[]*, text?: *`undefined`⎮`string`*, speak?: *`undefined`⎮`string`*): [Partial]()[Activity](../interfaces/botbuilder.activity.md)



*Defined in [libraries/botbuilder/lib/messageStyler.d.ts:65](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/messageStyler.d.ts#L65)*



Returns a message that will display a set of attachments in list form.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| attachments | [Attachment](../interfaces/botbuilder.attachment.md)[]   |  Array of attachments to include in the message. |
| text | `undefined`⎮`string`   |  (Optional) text of the message. |
| speak | `undefined`⎮`string`   |  (Optional) SSML to include with the message. |





**Returns:** [Partial]()[Activity](../interfaces/botbuilder.activity.md)





___

<a id="suggestedactions"></a>

### «Static» suggestedActions

► **suggestedActions**(actions: *(`string`⎮[CardAction](../interfaces/botbuilder.cardaction.md))[]*, text?: *`undefined`⎮`string`*, speak?: *`undefined`⎮`string`*): [Partial]()[Activity](../interfaces/botbuilder.activity.md)



*Defined in [libraries/botbuilder/lib/messageStyler.d.ts:49](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/messageStyler.d.ts#L49)*



Returns a message that includes a set of suggested actions and optional text.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| actions | (`string`⎮[CardAction](../interfaces/botbuilder.cardaction.md))[]   |  Array of card actions or strings to include. Strings will be converted to `messageBack` actions. |
| text | `undefined`⎮`string`   |  (Optional) text of the message. |
| speak | `undefined`⎮`string`   |  (Optional) SSML to include with the message. |





**Returns:** [Partial]()[Activity](../interfaces/botbuilder.activity.md)





___

<a id="text"></a>

### «Static» text

► **text**(text: *`string`*, speak?: *`undefined`⎮`string`*): [Partial]()[Activity](../interfaces/botbuilder.activity.md)



*Defined in [libraries/botbuilder/lib/messageStyler.d.ts:41](https://github.com/Microsoft/botbuilder-js/blob/a28edbb/libraries/botbuilder/lib/messageStyler.d.ts#L41)*



Returns a simple text message.

**Usage Example**

    // init message object
    const basicMessage = MessageStyler.text('Greetings from example message');

    context.reply(basicMessage); // send message


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| text | `string`   |  Text to include in the message. |
| speak | `undefined`⎮`string`   |  (Optional) SSML to include in the message. |





**Returns:** [Partial]()[Activity](../interfaces/botbuilder.activity.md)





___


