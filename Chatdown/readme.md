# Chatdown

[![npm version](https://badge.fury.io/js/chatdown.svg)](https://badge.fury.io/js/chatdown)

Chatdown is a transcript generator which consumes a .chat file to generate mock transcripts. Generated mock transcript files are output to stdout.

A good bot, just like any successful application or a website, starts with clarity on supported scenarios. Creating mockups of conversations between bot and user is useful for: 
- Framing the scenarios supported by the bot.
- Business decision makers to review, provide feedback.
- Defining a "happy path" (as well as other paths) through conversational flows between a user and a bot

`.chat` file format helps you create mockups of conversations between a user and a bot. Chatdown CLI tool converts `.chat` files into conversation transcripts (`.transcript` files) that can be viewed in the Bot Framework Emulator.

## Prerequisite

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
| `<chatfile>` | The path of the chat file to be parsed. If omitted, stdin will be used. |
| `-v, --version` | show version |
| `--help`    | Output the help to the console|

## .chat File Format

Here's an example `.chat` file:

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

> See the [Examples](https://github.com/Microsoft/botbuilder-tools/tree/master/Chatdown/Examples) folder for more samples.


Chat files are markdown files that contain 2 parts:
- Header that defines who the participants are in the conversation
- Back and forth conversation between a user and a bot

### Header
The header defines who the participants are in the conversation and defines other options.

|Option               |Description|
|---------------------|------------------------------|
|`user=<user>` |This option tells chatdown that a user message will begin with `<user>` followed by a colon. For example, `user=Joe` instructs chatdown that lines beginning with `Joe:` or `user:` are the start of a message from the user Joe. |
|`bot=<bot>` | This options tells chatdown that a bot message will begin with `<bot>` followed by a colon.  For example, `bot=LulaBot` instructs chadown that lines beginning with `LulaBot:` or `bot:` are the start of a message from the bot Lulabot. |
| `channelId=<channelID>`| This option tells chatdown to use the specified `channelID` for each activity.|

Once the configuration options for `user` and `bot` are defined, the rest of the conversation can use the alias prefixes `user:` and `bot:` or the names directly.  Chatdown will correctly make the associations to the specified names for you.

### Conversation
The conversation between the user and the bot with markdown support for bot's responses. Every time a `user:` or `bot:`  is found at the beginning of the line, a new activity will be inserted into the transcript.  Inside the markdown, you can insert commands to generate richer transcripts:

| Command        | Description                                                |
| --------------- | ------------------------------------------------------------ |
|`[Typing]` | Inserts a typing activity into the transcript to signify that a user or a bot is typing. |
|`[Delay=<milliseconds>]` | Delays the transcript by `<milliseconds>`. |
|`[Suggestions=<Option 1>|<Option 2>|<Option 3>]` | Add suggested action buttons, delimited by `|` |
|`[AttachmentLayout=LayoutType]`| Specify how multiple attachments would be dislpayed. Layout types are `carousel` or `list`|


### Cards
You can add cards using simple commands as well.  Currently we support a number of cards:

| description | card name                                                    |
| ----------- | ------------------------------------------------------------ |
| HeroCard    | A simple card with single large image, title, subtitle, text and buttons |
| ThumbnailCard | Same as herocard, but image is much smaller |
| AudioCard | send audio card for playing back an audio url |
| VideoCard | send an video player card for playing back a video file |
| AnimationCard | send a animated gif card |
| MediaCard | send arbitrary media with transport control |
| SigninCard | send a signin card |
| OauthCard | send an oauth card which uses azure bot service oauth flow 

```markdown
Bot: 
[Herocard   
    title=Cheese gromit!
    subtitle=Hero Card
    text=This is some text describing the card, it's cool because it's cool
    image=https://memegenerator.net/img/instances/500x/73055378/cheese-gromit.jpg
    buttons=Option 1| Option 2| Option 3]

Bot: 
[ThumbnailCard
    title=Cheese gromit!
    subtitle=Thumbnail Card
    text=This is some text describing the card, it's cool because it's cool
    image=https://memegenerator.net/img/instances/500x/73055378/cheese-gromit.jpg
    buttons=Option 1| Option 2| Option 3]
```
The properties that are supported are

| property | description |
|----|----|
| title | The title of the card|
| subtitle| a subtitle for the card with less emphasis|
| text | a generic text property which can contain longer text describing the card|
| image | image url to use for the card |
| buttons | a set of button labels seperated by `|`|


### Attachments
To add an attachment, you use `[Attachment=path contentPath]`.  The path can be a URL or a local path (either absolute or relative to `.chat` file).  The content type is optional and if not passed, will be inferred from the file extension. You can also pass it using a shortcut or full mime type.

```markdown
[Attachment=path contentType]
```

The following examples illustrates sending a carousel of photos:
```markdown
Enjoy these pictures!
[AttachmentLayout=carousel]
[Attachment=http://4.bp.blogspot.com/--cFa6t-x4qY/UAqEgUvPd2I/AAAAAAAANIg/pMLE080Zjh4/s1600/turtle.jpg]
[Attachment=http://viagemempauta.com.br/wp-content/uploads/2015/09/2_All-Angle-By-Andreza-dos-Santos_FTS_2914-344-620x415.jpg]
[Attachment=http://images.fineartamerica.com/images-medium-large/good-morning-turtles-freund-gloria.jpg]
[Attachment=http://4.bp.blogspot.com/--cFa6t-x4qY/UAqEgUvPd2I/AAAAAAAANIg/pMLE080Zjh4/s1600/turtle.jpg]
[Attachment=image.png]
```

This example sends a local adaptive card using a content type shortcut:
```markdown
[Attachment=folder/sample.json "adaptivecard"]
```

#### Attachment content type shortcuts
Some of the content types have shortcuts:

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

### Basic usage
In the simplest form, a chatdown command looks like the following:
```bash
chatdown sample.chat > sample.transcript
```
This will consume `sample.chat` and output `sample.transcript`.

### Using stdin
stdin can be used as an alternative to specifying an input file.
```bash
(echo user=Joe && echo bot=LulaBot && echo Joe: 'Hi!' && echo LulaBot: 'Hi there!') | chatdown > sample.transcript
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
The transcript will be piped to stdout.

### As a library
Chatdown can be used within a Node.js application as an imported library. 
Install locally:
```bash
npm i -s chatdown
```
In your node project:
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

To run as a watcher:
```bash
chokidar "**/*.chat" -c "chatdown {path} > {path}.transcript"
```

Now, any time a .chat file is created or saved, chatdown will automatically create the transcript file beside it.

