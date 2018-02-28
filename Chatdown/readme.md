# Chatdown

Chatdown is a transcript generator which consumes a markdown file to generate activity transcripts
## Installation
```bash
npm i -g chatdown
```
## Arguments

| Argument                                  | Description                                                  |
| :---------------------------------------- | ------------------------------------------------------------ |
| --in <path> [optional]                    | The path of the markdown file to be parsed. If omitted, stdin will be used|
| --out <path> [optional]                   | The path of the transcript to be written. If omitted, stdout will be used|
| --help                                    | Output the help to the console
| no args                                   | If no arguments are provided, stdin is used as input and stdout is used as output |
## .chat File Format
Chat files are markdown files that contain 2 parts:
##### 1. Configuration options
Configuration options are defined at the top of the file before the conversation text begins.
Supported configuration options are:
1. `user=<user>` - This option tells chatdown that a user message will begin with `<user>` followed by a colon.
for example: `user=Joe` instructs chatdown that lines beginning with `Joe:` are the start of a message from Joe
2. `bot=<bot>` - This options tells chatdown that a bot message will begin with `<bot>` followed by a colon.
For example: `bot=LulaBot` instructs chadown that lines beginning with `LulaBot:` are the start of a message from the bot
3. `channelId=<channel id>` - This option tells chatdown to use the specified channel id ni each activity.

Once the configuration options for `user` and `bot` are defined, the rest of the conversation can use the alias prefixes
`user:` and `bot:`. Chatdown will correctly make the associations to the specified names for you.
 
##### 2. Conversation Text
The conversation text represents the rest of the `.chat` file. Each time an identifier is encountered at the beginning 
of a new line, a new activity begins. There are currently 2 activity types and 2 special instructions supported:
1. `[Message]` - The default activity which may be comprised of multiple lines of text within the file. 
the `[Message]` instruction is optional and should be omitted.
2. `[Typing]` - Reserved for a bot and usually precede a `[Delay:<milliseconds>]` instruction. 
3. `[Delay:<milliseconds>]` - Sets the timestamp of the activity ahead by the specified number of milliseconds.
2. `[Attachment:<filePath>:<contentType>]` - This specifies the details for an attachment. A single activity can 
have more than 1 attachment and the content type is derived from the file extension if omitted.

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

[Attachments:bot-framework.png]

```
## CLI Examples

### Basic use
In the simplest form, a chatdown command looks like the following:
```bash
chatdown --in sample.chat --out sample.transcript
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
chatdown --in sameple.chat
```
or 
```bash
chatdown --in sameple.chat > joe.transcript
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