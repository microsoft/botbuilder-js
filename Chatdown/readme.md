# Chatdown

[![npm version](https://badge.fury.io/js/chatdown.svg)](https://badge.fury.io/js/chatdown)

Chatdown is a transcript generator which consumes a .chat file to generate mock transcripts. Generated mock transcript files are output to stdout.

A good bot just like any successful application or website out there starts with clarity on supported scenarios. Creating mockups of conversations between bot and user is useful for: 
- Framing the scenarios supported by the bot
- Business deicion makaers to review, provide feedback.
- Flushing out happy path (as well as others) through conversational flows between user and bot

.Chat file format helps you create mockups of conversations between user and bot. Chatdown CLI tool convert .chat files into conversation transcripts (.transcript file) that can be viewed in the Bot Framework Emulator.

## Pre-requisite

- [Node.js](https://nodejs.org/) version 8.5 or higher

## Installation
```bash
npm i -g chatdown
```

## Arguments
Usage:
```
chatdown <chat> --help
```

| Argument| Description|
|-------------| ------------------------- |
| `<chatfile>` | The path of the chat file to be parsed. If omitted, stdin will be used |
| `-v, --version` | show version |
| `--help`    | Output the help to the console|

## .chat File Format

Here's an example .chat file:

```markdown
user=Joe
bot=LulaBot

bot: Hi!
user: yo!
bot: [Typing][Delay=3000]
Greetings!
What would you like to do?
* update - You can update your account
* List - You can list your data
* help - you can get help

user: I need the bot framework logo.

bot:
Here you go.
[Attachment=bot-framework.png]
[Attachment=http://yahoo.com/bot-framework.png]
[AttachmentLayout=carousel]

user: thanks
bot:
Here's a form for you
[Attachment=card.json adaptivecard]

```

Checkout the [Examples](https://github.com/Microsoft/botbuilder-tools/tree/master/Chatdown/Examples) folder for more samples.


Chat files are markdown files that contain 2 parts:
- Header that defines who the participants are in the conversation
- Back and forth conversation between user and bot

### Header
The header defines who the participants are in the conversation and other options.

|Option               |Description|
|---------------------|------------------------------|
|`user=<user>` |This option tells chatdown that a user message will begin with `<user>` followed by a colon. for example: `user=Joe` instructs chatdown that lines beginning with `Joe:` or `user:` are the start of a message from the user Joe|
|`bot=<bot>` | This options tells chatdown that a bot message will begin with `<bot>` followed by a colon.  For example: `bot=LulaBot` instructs chadown that lines beginning with `LulaBot:` or `bot:` are the start of a message from the bot Lulabot |
| `channelId=<channelid>`| This option tells chatdown to use the specified `channelid` for each activity.|

Once the configuration options for `user` and `bot` are defined, the rest of the conversation can use the alias prefixes `user:` and `bot:` or the names directly.  Chatdown will correctly make the associations to the specified names for you.

### Conversation
The conversation between the user and the bot with markdown support for bot's responses. Every time a `user:` or `bot:`  is found at the beginning of the line a new activity will be inserted into the transcript.  Inside of the markdown you can insert commands generate richer transcripts.

| Command        | Description                                                |
| --------------- | ------------------------------------------------------------ |
|`[Typing]` | Inserts a typing activity into the transcript to signify that a user or a bot is typing. |
|`[Delay=<milliseconds>]` | Delays the transcript by `<milliseconds>` |
|`[AttachmentLayout=LayoutType]`| Specify how multiple attachments would be dislpayed. Layout types are `carousel` or `list`|

### Attachments
To add an attachment you use `[Attachment=path contentPath]`.  The path can be a url or a local path (either absolute or relative to .chat file).  The content type is optional and if not passed will be inferred from the file extension, or you can pass it using shortcut or full mime type.

```markdown
[Attachment:path contentType]
```

Here is an example sending a carousel of photos
```markdown
Enjoy these pictures!
[AttachmentLayout=carousel]
[Attachment=http://4.bp.blogspot.com/--cFa6t-x4qY/UAqEgUvPd2I/AAAAAAAANIg/pMLE080Zjh4/s1600/turtle.jpg]
[Attachment=http://viagemempauta.com.br/wp-content/uploads/2015/09/2_All-Angle-By-Andreza-dos-Santos_FTS_2914-344-620x415.jpg]
[Attachment=http://images.fineartamerica.com/images-medium-large/good-morning-turtles-freund-gloria.jpg]
[Attachment=http://4.bp.blogspot.com/--cFa6t-x4qY/UAqEgUvPd2I/AAAAAAAANIg/pMLE080Zjh4/s1600/turtle.jpg]
[Attachment=image.png]
```

Here is an exaple sending a local adaptive card using a content type shortcut:
```markdown
[Attachment=folder/sample.json "adaptivecard"]
```

#### Attachment content type shortcuts
Some content types have shortcuts

| ContentType Shortcuts | Description                                |
| ----------------------|--------------------------------------------|
| animation             | `application/vnd.microsoft.card.animation` |
| audio                 | `application/vnd.microsoft.card.audio`     |
| hero                  | `application/vnd.microsoft.card.hero`      |
| receipt               | `application/vnd.microsoft.card.receipt`   |
| thumbnail             | `application/vnd.microsoft.card.thumbnail` |
| signin                | `application/vnd.microsoft.card.signin`    |
| video                 | `application/vnd.microsoft.card.video`     |
| adaptivecard          | `application/vnd.microsoft.card.adaptive`  |
| *application/custom*  | `application/custom`                       |



## CLI Examples

### Basic use
In the simplest form, a chatdown command looks like the following:
```bash
chatdown sample.chat > sample.transcript
```
This will consume `sample.chat` and output `sample.transcript`

### Using stdin
stdin can be used as an alternative to specifying an input file.
```bash
(echo user=Joe && echo bot=LulaBot && echo Joe: Hi! && echo LulaBot: Hi there!) | chatdown > sample.transcript
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

## Setting up a watcher to automatically transcribe chat files
Chokidar-cli is a great utility to do this.

To install:
```bash
npm install -g chokidar-cli
```

To run as a watcher
```bash
chokidar "**/*.chat" -c "chatdown {path} > {path}.transcript"
```

Now, any time a .chat file is created or saved chatdown will automatically create the transcript file beside it.

