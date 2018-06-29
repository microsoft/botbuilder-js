# Chit Chat
Small talk/chit-chat helps to make chatbots more conversational and personable. Here are a collection of chit-chat style conversational abilities categories by personality type/ personas for your bot - [professional](Professional), [friendly](Friendly), [humorous](Humorous). Choose the persona that most closely resembles your chatbot's voice. 

You can use the ludown tool to parse these into QnA Maker KBs (one or more as you see fit) to easily add small talk/ chit-chat capabilities to your bot. See [here](../docs/create-qna-json.md) about parsing these to a QnA Maker KB. 

To use these - 
1. Clone the tools repo
```bash
> git clone https://github.com/Microsoft/botbuilder-tools.git
```
2. Install the ludown tool
```bash
> npm i -g ludown
```
3. Run the ludown parse toqna command
```bash
> ludown parse toqna --in ChitChat\\DataSet\\Professional\\AboutBot.lu
```
```bash
> ludown parse toqna -l ChitChat\\DataSet\\Professional -n chitchat-professional
```

Also see [here](https://github.com/Microsoft/BotBuilder-PersonalityChat) to learn more about PersonalityChat service.
