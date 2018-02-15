[Bot Builder SDK - Core](../README.md) > [CardStyler](../classes/botbuilder.cardstyler.md)



# Class: CardStyler


A set of utility functions designed to assist with the formatting of the various card types a bot can return. All of these functions return an `Attachment` which can be added to an `Activity` directly or passed as input to a `MessageStyler` function.

**Usage Example**

    const card = CardStyler.heroCard(
         'White T-Shirt',
         ['https://example.com/whiteShirt.jpg'],
         ['buy']
    );

## Index

### Properties

* [contentTypes](botbuilder.cardstyler.md#contenttypes)


### Methods

* [actions](botbuilder.cardstyler.md#actions)
* [adaptiveCard](botbuilder.cardstyler.md#adaptivecard-1)
* [animationCard](botbuilder.cardstyler.md#animationcard-1)
* [audioCard](botbuilder.cardstyler.md#audiocard-1)
* [heroCard](botbuilder.cardstyler.md#herocard-1)
* [images](botbuilder.cardstyler.md#images)
* [media](botbuilder.cardstyler.md#media)
* [receiptCard](botbuilder.cardstyler.md#receiptcard-1)
* [signinCard](botbuilder.cardstyler.md#signincard-1)
* [thumbnailCard](botbuilder.cardstyler.md#thumbnailcard-1)
* [videoCard](botbuilder.cardstyler.md#videocard-1)



---
## Properties
<a id="contenttypes"></a>

### «Static» contentTypes

**●  contentTypes**:  *`object`* 

*Defined in [libraries/botbuilder/lib/cardStyler.d.ts:26](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/cardStyler.d.ts#L26)*



List of content types for each card style.

#### Type declaration




 adaptiveCard: `string`






 animationCard: `string`






 audioCard: `string`






 heroCard: `string`






 receiptCard: `string`






 signinCard: `string`






 thumbnailCard: `string`






 videoCard: `string`







___


## Methods
<a id="actions"></a>

### «Static» actions

► **actions**(actions: *(`string`⎮[CardAction]())[]⎮`undefined`*): [CardAction]()[]



*Defined in [libraries/botbuilder/lib/cardStyler.d.ts:127](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/cardStyler.d.ts#L127)*



Returns a properly formatted array of actions. Supports converting strings to `messageBack` actions (note: using 'imBack' for now as 'messageBack' doesn't work properly in emulator.)


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| actions | (`string`⎮[CardAction]())[]⎮`undefined`   |  Array of card actions or strings. Strings will be converted to `messageBack` actions. |





**Returns:** [CardAction]()[]





___

<a id="adaptivecard-1"></a>

### «Static» adaptiveCard

► **adaptiveCard**(card: *`any`*): [Attachment]()



*Defined in [libraries/botbuilder/lib/cardStyler.d.ts:51](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/cardStyler.d.ts#L51)*



Returns an attachment for an adaptive card. The attachment will contain the card and the appropriate `contentType`.

Adaptive Cards are a new way for bots to send interactive and immersive card content to users. For channels that don't yet support Adaptive Cards natively, the Bot Framework will down render the card to an image that's been styled to look good on the target channel. For channels that support [hero cards](#herocards) you can continue to include Adaptive Card actions and they will be sent as buttons along with the rendered version of the card.

For more information about Adaptive Cards and to download the latest SDK, visit [adaptivecards.io](http://adaptivecards.io/).


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| card | `any`   |  The adaptive card to return as an attachment. |





**Returns:** [Attachment]()





___

<a id="animationcard-1"></a>

### «Static» animationCard

► **animationCard**(title: *`string`*, media: *(`string`⎮[MediaUrl]())[]*, buttons?: *(`string`⎮[CardAction]())[]*, other?: *[Partial]()[AnimationCard]()*): [Attachment]()



*Defined in [libraries/botbuilder/lib/cardStyler.d.ts:60](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/cardStyler.d.ts#L60)*



Returns an attachment for an animation card.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| title | `string`   |  The cards title. |
| media | (`string`⎮[MediaUrl]())[]   |  Media URL's for the card. |
| buttons | (`string`⎮[CardAction]())[]   |  (Optional) set of buttons to include on the card. |
| other | [Partial]()[AnimationCard]()   |  (Optional) additional properties to include on the card. |





**Returns:** [Attachment]()





___

<a id="audiocard-1"></a>

### «Static» audioCard

► **audioCard**(title: *`string`*, media: *(`string`⎮[MediaUrl]())[]*, buttons?: *(`string`⎮[CardAction]())[]*, other?: *[Partial]()[AnimationCard]()*): [Attachment]()



*Defined in [libraries/botbuilder/lib/cardStyler.d.ts:69](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/cardStyler.d.ts#L69)*



Returns an attachment for an audio card.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| title | `string`   |  The cards title. |
| media | (`string`⎮[MediaUrl]())[]   |  Media URL's for the card. |
| buttons | (`string`⎮[CardAction]())[]   |  (Optional) set of buttons to include on the card. |
| other | [Partial]()[AnimationCard]()   |  (Optional) additional properties to include on the card. |





**Returns:** [Attachment]()





___

<a id="herocard-1"></a>

### «Static» heroCard

► **heroCard**(title: *`string`*, images?: *(`string`⎮[CardImage]())[]*, buttons?: *(`string`⎮[CardAction]())[]*, other?: *[Partial]()[HeroCard]()*): [Attachment]()

► **heroCard**(title: *`string`*, text: *`string`*, images?: *(`string`⎮[CardImage]())[]*, buttons?: *(`string`⎮[CardAction]())[]*, other?: *[Partial]()[HeroCard]()*): [Attachment]()



*Defined in [libraries/botbuilder/lib/cardStyler.d.ts:80](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/cardStyler.d.ts#L80)*



Returns an attachment for a hero card. Hero cards tend to have one dominant full width image and the cards text & buttons can usually be found below the image.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| title | `string`   |  The cards title. |
| images | (`string`⎮[CardImage]())[]   |  (Optional) set of images to include on the card. |
| buttons | (`string`⎮[CardAction]())[]   |  (Optional) set of buttons to include on the card. |
| other | [Partial]()[HeroCard]()   |  (Optional) additional properties to include on the card. |





**Returns:** [Attachment]()



*Defined in [libraries/botbuilder/lib/cardStyler.d.ts:81](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/cardStyler.d.ts#L81)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| title | `string`   |  - |
| text | `string`   |  - |
| images | (`string`⎮[CardImage]())[]   |  - |
| buttons | (`string`⎮[CardAction]())[]   |  - |
| other | [Partial]()[HeroCard]()   |  - |





**Returns:** [Attachment]()





___

<a id="images"></a>

### «Static» images

► **images**(images: *(`string`⎮[CardImage]())[]⎮`undefined`*): [CardImage]()[]



*Defined in [libraries/botbuilder/lib/cardStyler.d.ts:133](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/cardStyler.d.ts#L133)*



Returns a properly formatted array of card images.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| images | (`string`⎮[CardImage]())[]⎮`undefined`   |  Array of card images or strings. Strings will be converted to card images. |





**Returns:** [CardImage]()[]





___

<a id="media"></a>

### «Static» media

► **media**(links: *(`string`⎮[MediaUrl]())[]⎮`undefined`*): [MediaUrl]()[]



*Defined in [libraries/botbuilder/lib/cardStyler.d.ts:139](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/cardStyler.d.ts#L139)*



Returns a properly formatted array of media url objects.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| links | (`string`⎮[MediaUrl]())[]⎮`undefined`   |  Array of media url objects or strings. Strings will be converted to a media url object. |





**Returns:** [MediaUrl]()[]





___

<a id="receiptcard-1"></a>

### «Static» receiptCard

► **receiptCard**(card: *[ReceiptCard]()*): [Attachment]()



*Defined in [libraries/botbuilder/lib/cardStyler.d.ts:88](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/cardStyler.d.ts#L88)*



Returns an attachment for a receipt card. The attachment will contain the card and the appropriate `contentType`.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| card | [ReceiptCard]()   |  The adaptive card to return as an attachment. |





**Returns:** [Attachment]()





___

<a id="signincard-1"></a>

### «Static» signinCard

► **signinCard**(title: *`string`*, url: *`string`*, text?: *`undefined`⎮`string`*): [Attachment]()



*Defined in [libraries/botbuilder/lib/cardStyler.d.ts:97](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/cardStyler.d.ts#L97)*



Returns an attachment for a signin card. For channels that don't natively support signin cards an alternative message will be rendered.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| title | `string`   |  The cards title. |
| url | `string`   |  The link to the signin page the user needs to visit. |
| text | `undefined`⎮`string`   |  (Optional) additional text to include on the card. |





**Returns:** [Attachment]()





___

<a id="thumbnailcard-1"></a>

### «Static» thumbnailCard

► **thumbnailCard**(title: *`string`*, images?: *(`string`⎮[CardImage]())[]*, buttons?: *(`string`⎮[CardAction]())[]*, other?: *[Partial]()[ThumbnailCard]()*): [Attachment]()

► **thumbnailCard**(title: *`string`*, text: *`string`*, images?: *(`string`⎮[CardImage]())[]*, buttons?: *(`string`⎮[CardAction]())[]*, other?: *[Partial]()[ThumbnailCard]()*): [Attachment]()



*Defined in [libraries/botbuilder/lib/cardStyler.d.ts:110](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/cardStyler.d.ts#L110)*



Returns an attachment for a thumbnail card. Thumbnail cards are similar to [hero cards](#herocard) but instead of a full width image, they're typically rendered with a smaller thumbnail version of the image on either side and the text will be rendered in column next to the image. Any buttons will typically show up under the card.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| title | `string`   |  The cards title. |
| images | (`string`⎮[CardImage]())[]   |  (Optional) set of images to include on the card. |
| buttons | (`string`⎮[CardAction]())[]   |  (Optional) set of buttons to include on the card. |
| other | [Partial]()[ThumbnailCard]()   |  (Optional) additional properties to include on the card. |





**Returns:** [Attachment]()



*Defined in [libraries/botbuilder/lib/cardStyler.d.ts:111](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/cardStyler.d.ts#L111)*



**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| title | `string`   |  - |
| text | `string`   |  - |
| images | (`string`⎮[CardImage]())[]   |  - |
| buttons | (`string`⎮[CardAction]())[]   |  - |
| other | [Partial]()[ThumbnailCard]()   |  - |





**Returns:** [Attachment]()





___

<a id="videocard-1"></a>

### «Static» videoCard

► **videoCard**(title: *`string`*, media: *(`string`⎮[MediaUrl]())[]*, buttons?: *(`string`⎮[CardAction]())[]*, other?: *[Partial]()[AnimationCard]()*): [Attachment]()



*Defined in [libraries/botbuilder/lib/cardStyler.d.ts:120](https://github.com/Microsoft/botbuilder-js/blob/6102823/libraries/botbuilder/lib/cardStyler.d.ts#L120)*



Returns an attachment for a video card.


**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| title | `string`   |  The cards title. |
| media | (`string`⎮[MediaUrl]())[]   |  Media URL's for the card. |
| buttons | (`string`⎮[CardAction]())[]   |  (Optional) set of buttons to include on the card. |
| other | [Partial]()[AnimationCard]()   |  (Optional) additional properties to include on the card. |





**Returns:** [Attachment]()





___


