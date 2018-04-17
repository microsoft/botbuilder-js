# Chatdown

Chatdown is a transcript generator which consumes a markdown file to generate activity transcripts
## Installation
```bash
npm i -g chatdown
```
## Arguments

| Argument| Description|
|-------------| ------------------------- |
| <chat> [optional]| The path of the chat file to be parsed. If omitted, stdin will be used |
| --out <transcript> [optional] | The path of the transcript to be written. If omitted, stdout will be used |
| --help    | Output the help to the console|

## .chat File Format
Chat files are markdown files that contain 2 parts:
##### ### Header
The header defines who the participants are in the conversation and other options.
|Option               |Description|
|---------------------|------------------------------|
|`user=<user>` |This option tells chatdown that a user message will begin with `<user>` followed by a colon. for example: `user=Joe` instructs chatdown that lines beginning with `Joe:` or `user:` are the start of a message from the user Joe|
|`bot=<bot>` | This options tells chatdown that a bot message will begin with `<bot>` followed by a colon.  For example: `bot=LulaBot` instructs chadown that lines beginning with `LulaBot:` or `bot:` are the start of a message from the bot Lulabot |
| `channelId=<channel id>`| This option tells chatdown to use the specified channel id for each activity.|

Once the configuration options for `user` and `bot` are defined, the rest of the conversation can use the alias prefixes `user:` and `bot:` or the names directly.  Chatdown will correctly make the associations to the specified names for you.

##### ### Commands
The conversation text represents markdown between the user and the bot.  Every time a `user:` or `bot:`  is found at the beginning of the line a new activity will be inserted into the transcript.  Inside of the markdown you can insert commands generate richer transcripts.

| Command        | Description                                                |
| --------------- | ------------------------------------------------------------ |
|`[Typing]` | Inserts a typing activity into the transcript to signify that a user or a bot is typing. |
| `[Delay:<milliseconds>]` | Delays the transcript by milliseconds |
|`[Attachment:<filePath>]` | Add an attachment to the activity. the content type is derived from the file extension if omitted. |
| `[Attachment:<filePath>:<contentType>]` | Add an attachment to the activity. The content type should be one of the content type values or a raw mime type |
|`[AttachmentLayout:layout]`| Specify how multiple attachments whould be dislpayed.  layout values are `carousel` or `list`|

#### Attachment content type shortcuts
Some content types have shortcuts
| ContentType | Description |
| -------------------|-------------------|
|animation| `application/vnd.microsoft.card.animation`|
|audio| `application/vnd.microsoft.card.audio`|
|hero| `application/vnd.microsoft.card.hero`|
|receipt| `application/vnd.microsoft.card.receipt`|
|thumbnail| `application/vnd.microsoft.card.thumbnail`|
|signin| `application/vnd.microsoft.card.signin`|
|video| `application/vnd.microsoft.card.video`|
|adaptivecard| `application/vnd.microsoft.card.adaptive`|
| *application/custom* | `application/custom` |

### Example .chat

```markdown
user=Joe
bot=LulaBot

bot: Hi!
user: yo!
bot: [Typing][Delay:3000]
Greetings!
What would you like to do?
* update - You can update your account
* List - You can list your data
* help - you can get help

user: I need the bot framework logo.

bot:
Here you go.
[Attachment:bot-framework.png]

user: thanks
bot:
Here's a form for you
[Attachment:card.json:adaptivecard]

```
## CLI Examples

### Basic use
In the simplest form, a chatdown command looks like the following:
```bash
chatdown sample.chat --out sample.transcript
```
This will consume `sample.chat` and output `sample.transcript`

### Using stdin
stdin can be used as an alternative to specifying an input file.
```bash
(echo user=Joe && echo bot=LulaBot && echo Joe: Hi! && echo LulaBot: Hi there!) | chatdown --out sample.transcript
```

### Using stdout
stdout can be used as an alternative to specifying the output file.
```bash
chatdown sample.chat
```
or 
```bash
chatdown sameple.chat > joe.transcript
```
The transcript will be piped to stdout

### As a library
Chatdown can be used within a Node application as an imported library:
Install locally:
```bash
npm i -s chatdown
```
Then in your node project:
```js
const chatdown = require('chatdown');
const conversation = `
    user=Joe
    bot=LulaBot
    user: Hello!
    bot: Hello, can I help you?
    user: I need an image
    bot: here you go! [Attachments:bot-framework.png]
`;
chatdown(conversation, config)
    .then(activities => {
        // do stuff with the resulting activities.
    })
    .catch(e =>{
         // oops! Something went wrong
    });
```