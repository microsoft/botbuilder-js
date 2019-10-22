# Integration Bot

This bot has been created using [Bot Framework](https://dev.botframework.com), it is used to exercise features of [Teams](https://products.office.com/microsoft-teams/) integration.

## Recordings for integration testing.
This bot demonstrates how to perform recordings with Teams for integration testing.  See [background info](https://github.com/daveta/teams/blob/master/README.md) for more information.  

### Recording
See [the prequisites for running this sample](#prerequisites) to completely set up **ngrok**.

Recordings use [nock](https://github.com/nock/nock) to capture traffic from the client.  The specific script/scenario used to exercise all the features of this bot are [here](#recording-script)

```bash
# Install
mkdir recordings
npm install

# Set record mode
  # Windows
  set TEST_MODE=RECORD
  # Powershell
  $env:TEST_MODE=RECORD
  # Linux
  export TEST_MODE=RECORD
  
# run the bot
npm start
```
Once the bot is started in record mode, execute the scenario(s) you wish to repeat later.  In this sample, typing ''`exit`" shuts the bot down gracefully.  All the traffic should be captured in the form of .json files in the `recordings` directory.

### Playing recordings locally
To play back the recordings locally, perform the following.
```bash
# Set record mode - true or false
  # Windows
  set TEST_MODE=PLAY
  # Powershell
  $env:TEST_MODE=PLAY
  # Linux
  export TEST_MODE=PLAY

# run the bot
npm start
```
The bot should run through the recording and validate the data is correct.

### Proxy host the recordings 

For other languages such as C#, it's convenient to host the recordings as a pseudo Teams server, and run through the scenarios that were recorded.

To create the proxy host (which acts as the Teams proxy) perform the following:

  > NOTE: The recordings exercise any AuthN paths.
  >
  > NOTE: The proxy by default listens on port 3979/
```
  # Windows
  set TEST_MODE=PROXY_HOST
  set PROXY_HOST=http://localhost:3979 # Or wherever the proxy is running
  # Powershell
  $env:TEST_MODE=PROXY_HOST
  $env:PROXY_HOST=http://localhost:3979 # Or wherever the proxy is running
  # Linux
  export TEST_MODE=PROXY_HOST
  export PROXY_HOST=http://localhost:3979 # Or wherever the proxy is running

# run the bot
npm start
```


In order to trigger the test, the client first must begin recording (`GET /api/runtests`) to start the tests. 



![Proxy Recordingsl](./_images/proxy_recordings.jpg)

### Play recordings against proxy

To use the proxy host, the client must trigger the proxy to begin the calls (see drawing above).

To create the use the proxy host, perform the following:
  > NOTE: The recordings exercise any AuthN paths.
```
  # Windows
  set TEST_MODE=PROXY_PLAY
  # Powershell
  $env:TEST_MODE=PROXY_PLAY
  # Linux
  export TEST_MODE=PROXY_PLAY

# run the bot
npm start
```
## Recording Script 
- Action Based Messaging Extension - Fetch Task

  - Enter a Teams **channel** (other than "General") where the bot is registered.

  - Click on triple dots (". . .") menu at bottom of compose window.

  - Select "Integration Bot"

  - Click on "+" to the right of the title.  A menu should pop up.

  - Click on "Create cards with preview"

  - Type a question in the "Enter text for Question" (ie, What is your phone?)

  - Select "Is Multi-Select" to False

  - Enter three options to choose from (ie, Android, Apple, Other).

  - Click the "Submit" button  This should take you to a different dialog.

  - Click on the "Edit" button.  This should return you back to the original screen (with question and options you originally typed in)

  - Click "Submit" button a second time.

  - Click "Send"
  - **Validate:** You should see the same card posted in 3 areas: 

  - Your compose window

  - The Channel you are currently in.

  - The General channel for the team.

  - Click Submit on one of the cards.

  - **Validate**: You should see a message something lik:

    `App sent a message with empty  text but with value {"submitLocation":"messagingExtensionSubmit", "Answer":""}`

- Link Unfurl: 

  -  Type `@Integration Bot https://foo.com` (Integration Bot being the name of the registered bot.)

  - Type a space after the 'm' in '.com'.
  - **Validate**: You should see a hero card with "HeroCard for Link Unfurling" with "You entered https://foo.com"

  - Hit enter.  
  - Validate: The bot should reply with "You said 'https://foo.com''"

-  Add/Delete Users

  - On a Team where the bot is registered, click on the ". . ." menu next to the name -> Add member.
  - Select a user to add to the team.
  - **Validate**: A message should be posted to the "General" channel with "Account Added" message.
  - Remove the user from the team.
  - **Validate**: A message should be posted to the "General" channel with "Account Removed" message.

- Rename Events

  - On a Team where the bot is registered, click on the ". . ." menu next to the name -> "Edit Team".
  - Under "Team name" rename the team.
  - **Validate**: A message should be posted to the "General" channel with "Team Renamed" message.
  - On a Team **Channel** where the bot is registered, click on the ". . ." menu next to the name -> "Edit Channel".
  - Under "Channel name" rename the channel.
  - **Validate**: A message should be posted to the "General" channel with "Channel Renamed" message

- Add Channel Event

  - On a Team where the bot is registered, click on the ". . ." menu next to the name -> "Add Channel".
  - Under "Channel name" type a new channel.
  - **Validate**: A message should be posted to the "General" channel with "Channel Created" message

- Delete channel Event

  - On a Team Channel where the bot is registered, click on the ". . ." menu next to the name -> "Delete this channel".
  - Click on Delete.
  - **Validate**: A message should be posted to the "General" channel with "Channel Deleted" message

- Add member to Group Chat

  - On a Teams Group Chat, add a member (click on the icon with people and plus sign towards the top left of the UI)
  - Add a new user.
  - **Validate**: A message should be posted to the group chat with "Member Added" message.

- Remove member from Group Chat

  - On a Teams Group Chat, click on the icon with people and plus sign towards the top left of the UI.
  - Click the "X" to the right of a user to remove the user.
  - **Validate**: A message should be posted to the group chat with "Member Removed" message.

- Adaptive card "1"
  - Works in personal, group chat and teams

  - On a Teams channel or General channel with the bot installed, type "@IntegrationBot1".  The "1" is the command sent to the bot.

  - Validate: A card should appear that says "Bot Builder actions" and contains four buttons:

    - imBack: Click this and it should add a message that references the bot and adds "text".
    - message back: The bot should respond with "text" / "App sent a message with empty text but with value {"key":"value}.
    - message back local echo: Click this and it should send a message from you that says 'display text message back'.
    - invoke: Click this and see the bot should send a message that states: "text received by bots" / "handleTeamsCardActionInvoke value: {"key":"value"}"

- Adaptive card "2"
  - Works in personal, group chat and teams
  - On a Teams channel or General channel with the bot installed, type "@IntegrationBot2".  The "2" is the command sent to the bot.

  - Validate: A card should appear that says "Task Module Adaptive Card" and contains one button:

    - Launch Task Module: Click this and it should add a message that references the bot and adds "text".
    - Type a message and submit.
    - It should show "Thanks"
    - Click X to dismiss the modal dialog.

- Adaptive card "3"
  - Works in personal, group chat and teams  
  - On a Teams channel or General channel with the bot installed, type "@IntegrationBot3".  The "3" is the command sent to the bot.
  - Validate: A card should appear that says "Bot Builder actions" with an edit control and button labeled "Action.Submit".
  - Validate: Type some text and click "Action.Submit".  You should receive a message `App sent a message with empty text but with valid {"key":"value", "x":"<your text>"}`
  
- "Hero" card
  - Works in personal, group chat and teams
  - On a Teams channel or General channel with the bot installed, type "@IntegrationBothero".  The "hero" is the command sent to the bot.
  - The bot should respond with a hero card and button "Get Started"
  
- "Thumbnail" card
  - Works in personal, group chat and teams
  - On a Teams channel or General channel with the bot installed, type "@IntegrationBotthumbnail".  The "thumbnail" is the command sent to the bot.
  - The bot should respond with a thumbnail card and button "Get Started"
  
- "Receipt" card
  - Works in personal, group chat and teams
  - On a Teams channel or General channel with the bot installed, type "@IntegrationBotreceipt".  The "receipt" is the command sent to the bot.
  - The bot should respond with a receipt card and button "More information"
  
- "Signin" card
  - Works in personal, group chat and teams
  - On a Teams channel or General channel with the bot installed, type "@IntegrationBotsignin".  The "signin" is the command sent to the bot.
  - The bot should respond with a Sign-In card and button "BotFramework Sign-in Card"
  
- "Carousel" card
  - Works in personal, group chat and teams
  - On a Teams channel or General channel with the bot installed, type "@IntegrationBotcarousel".  The "carousel" is the command sent to the bot.
  - The bot should respond with a carousel card with three cards.
  
- "List" card
  - Works in personal, group chat and teams
  - On a Teams channel or General channel with the bot installed, type "@IntegrationBotlist".  The "list" is the command sent to the bot.
  - The bot should respond with a list of two cards.
  
- "show members"
  - Works in personal, group chat and teams
  - On a Teams channel or General channel with the bot installed, type "@IntegrationBotshow members".  The "show members" is the command sent to the bot.
  - The bot should respond with a list of members currently in the team.
  
- "show channels"
  - Works in personal, group chat and teams
  - On a Teams channel or General channel with the bot installed, type "@IntegrationBotshow channels".  The "show channels" is the command sent to the bot.
  - The bot should respond with a list of channels..
  
- "show details"
  - Works in personal, group chat and teams
  - On a Teams channel or General channel with the bot installed, type "@IntegrationBotshow details".  The "show details" is the command sent to the bot.
  - The bot should respond with team name, team ID and AAD GroupID.
  
- "updatetext"
  - Works in personal, group chat and teams
  - On a Teams channel or General channel with the bot installed, type "@IntegrationBotupdatetext".  The "updatetext" (or anything that isn't a command listed above)  is the command sent to the bot.
  - The bot should respond with "You said..." and then update the message with "updatetext" or whatever you typed.
  
- File upload "file"
  - Works in personal chat only
  - On a Teams channel or General channel with the bot installed, type "@IntegrationBotfile".  The "file" is the command sent to the bot.
  - The bot should respond with a file consent card with the 'Allow' and 'Decline' buttons
- If 'Allow' button is clicked, bot will respond with "File is uploaded.  Your file teams-logo.png is ready to download".
  - If 'Decline' button is clicked, bot will respond with "Declined.  We won't upload file teams-logo.png".
  
- O365 card "o365" 
  - Works in personal, group chat and teams
  - On a Teams channel, group chat or personal chat with the bot installed, type "@IntegrationBoto365".  The "0365" is the command sent to the bot.
  - The bot should respond with Office 365 card with 'Multiple Choice', 'Text Input', 'Date Input', 'View Action', 'Open Uri' buttons at the bottom of the card
  - Click on each of the button and add inputs.  With the exceptions of 'View Action' and 'Open Uri' buttons, bot should respond back with text containing input names/values and button name, ie 'O365ConnectorCardActionQuery event value: {"body":"{"date1":"2019-10-09T07:30:00.000Z", "date2":"2019-10-02T07:00:00.000Z"}","actionId":"card-3-btn-1"}'.

- Task Module "task module" 

- Works in personal, group chat and teams
- On a Teams channel, group chat or personal chat with the bot installed, type "@IntegrationBottask module".  The "task module" is the command sent to the bot.
- The bot should respond with Task Module Invocation Hero Card.
- Click on the Adaptive Card button.  A task module popup shows up, type some text and click on Submit button.  Bot should reply with 'Thanks' inside the popup and also with something like 'handleTeamsTaskModuleFetchAsync Value: {"data":{"usertext":"<<USER TEXT>>"},"context":{"theme":"dark"}}'.

## Prerequisites

This sample **requires** prerequisites in order to run.

### Clone the repository

```bash
git clone https://github.com/Microsoft/botbuilder-samples.git
```





### Ngrok setup

1. Download and install [Ngrok](https://ngrok.com/download)
2. In terminal navigate to the directory where Ngrok is installed
3. Run this command: ```ngrok http -host-header=rewrite 3978 ```
4. Copy the https://xxxxxxxx.ngrok.io address and put it into notepad. 
  >**NOTE** : You want the `https` address.

### Azure Set up to provision bot with Team Channel enabled

1. Login to the [Azure Portal](https://portal.azure.com) 
2. (optional) create a new resource group if you don't currently have one
3. Go to your resource group 
4. Click "Create a new resource" 
5. Search for "Bot Channel Registration" 
6. Click Create 
7. Enter bot name, subscription
8. In the "Messaging endpoint url" enter the ngrok address from earlier. 
9. Finish the url with "/api/messages. It should look like ```https://xxxxxxxxx.ngrok.io/api/messages```
10. Click the "Microsoft App Id and password" box 
11. Click on "Create New" 
12. Click on "Create App ID in the App Registration Portal" 
13. Click "New registration" 
14. Enter a name 
15. Under "Supported account types" select "Accounts in any organizational directory and personal Microsoft accounts" 
16. Click register 
17. Copy the application (client) ID and put it in Notepad. Label it "Microsoft App ID" 
18. Go to "Certificates & Secrets" 
19. Click "+ New client secret" 
20. Enter a description 
21. Click "Add" 
22. Copy the value and put it into Notepad. Label it "Password"
23. (back in the channel registration view) Copy/Paste the Microsoft App ID and Password into their respective fields 
24. Click Create 
25. Go to "Resource groups" on the left 
26. Select the resource group that the bot channel reg was created in 
27. Select the bot channel registration 
28. Go to Settings  
29. Select the "Teams" icon under "Add a featured channel 
30. Click Save 



### Updating Sample Settings

1. Open `.env` file.
2. Enter the app id under the `MicrosoftAppId` and the password under the `MicrosoftAppPassword`. 
3. Save the close the file.
4. Under the `TeamsAppManifest` folder open the `manifest.json` file.
5. Update the ```botId``` fields with the Microsoft App ID from before  (2 places)
6. Update the ```id``` with the Microsoft App ID from before 



### Uploading the bot to Teams

1. In file explorer navigate to the `teams-app-manifest` folder in the project 
2. Select the 3 files (`color.png`, `manifest.json` and `outline.png`) and zip them. 
3. Open Teams 
4. Click on "Apps" 
5. Select "Upload a custom app" on the left at the bottom 
6. Select the zip  
7. Select for you  
8. (optionally) click install if prompted 
9. Click open 

   

## To try this sample

- In a terminal, navigate to bot folder (ie `link-unfurling`).

It's suggested you run the bot twice.  First with recording turned on, second with recording turned off.

```bash
# Install
mkdir recordings
npm install

# Set record mode - true or false
  # Windows
  set AZURE_NOCK_RECORD=true
  # Powershell
  $env:AZURE_NOCK_RECORD="true"

# run the bot
npm start
```

### Interacting with the bot

1. Send a message to your bot in Teams.
2. Type any valid https url, ie https://www.bing.com, wait until the url is bolded, hit the space key and you should see a thumbnail card for the url info populated, like below. 
   ![Sample Unfurl](./_images/1569017810114.png)
3. If recording, as you send messages, you should see new text files in the `./recordings` directory.
4. Type `exit` into the Teams bot if you want the bot to exit.

### Notes
1. Url unfurls are cached.  Try using different https `.com` sites each time.
2. If you install multiple bots which handle link unfurling, the first bot that responds will be displayed.
3. If the bot returns multiple results, the first result will be displayed.
4. Link unfurling action is handled by `onAppBasedLinkQuery` method in the bot code

# Appendix A 

To edit drawing, go to [Web Sequence Diagrams](https://www.websequencediagrams.com/) and copy and paste the following:
```
title Proxy Recordings Scenario

note left of Bot\n(TEST_MODE=PROXY_PLAY) : **Start the tests**\nAll the tests run\nin context of this call.
Bot\n(TEST_MODE=PROXY_PLAY) ->Proxy Service\n(TEST_MODE=PROXY_HOST): GET /api/runtests
note right of Proxy Service\n(TEST_MODE=PROXY_HOST): Load recordings and\ninvoke bot simulating user.
Proxy Service\n(TEST_MODE=PROXY_HOST)->Bot\n(TEST_MODE=PROXY_PLAY): Activity Request
Bot\n(TEST_MODE=PROXY_PLAY)->Proxy Service\n(TEST_MODE=PROXY_HOST): Activity Response
note left of Bot\n(TEST_MODE=PROXY_PLAY): Bot processes Activity
Bot\n(TEST_MODE=PROXY_PLAY)->Proxy Service\n(TEST_MODE=PROXY_HOST): Activity Reply
note right of Proxy Service\n(TEST_MODE=PROXY_HOST): Validate reply\nmatches recordings.
Proxy Service\n(TEST_MODE=PROXY_HOST)->Bot\n(TEST_MODE=PROXY_PLAY): Activity Reply Response
Proxy Service\n(TEST_MODE=PROXY_HOST)->Bot\n(TEST_MODE=PROXY_PLAY): Response /api/runtests
note left of Bot\n(TEST_MODE=PROXY_PLAY): **End the tests**\nAll tests are complete.
```

# Appendix B

Here's an example `.vscode/launch.json` to debug this sample.
It's assumed the `workspaceFolder` is set to `botbuilder-js` directory.

```json
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
    
        {
            "type": "node",
            "request": "launch",
            "name": "Proxy Play",
            "program": "${workspaceFolder}\\libraries\\botbuilder\\tests\\teams\\integrationBot\\lib\\index.js",
            "sourceMaps": false,
            "env": {"TEST_MODE":"PROXY_PLAY", "PROXY_HOST":"http://localhost:3979"},
            "cwd": "${workspaceFolder}\\libraries\\botbuilder\\tests\\teams\\integrationBot",
            "outFiles": [
                "${workspaceFolder}/**/*.js"
            ]
        },
        {
            "type": "node",
            "request": "launch",
            "name": "Play",
            "program": "${workspaceFolder}\\libraries\\botbuilder\\tests\\teams\\integrationBot\\lib\\index.js",
            "sourceMaps": false,
            "env": {"TEST_MODE":"PLAY", "PROXY_HOST":"http://localhost:3979"},
            "cwd": "${workspaceFolder}\\libraries\\botbuilder\\tests\\teams\\integrationBot",
            "outFiles": [
                "${workspaceFolder}/**/*.js"
            ]
        },
        {
            "type": "node",
            "request": "launch",
            "name": "Record",
            "program": "${workspaceFolder}\\libraries\\botbuilder\\tests\\teams\\integrationBot\\lib\\index.js",
            "sourceMaps": false,
            "env": {"TEST_MODE":"RECORD"},
            "cwd": "${workspaceFolder}\\libraries\\botbuilder\\tests\\teams\\integrationBot",
            "outFiles": [
                "${workspaceFolder}/**/*.js"
            ]
        },
        {
            "type": "node",
            "request": "launch",
            "name": "Proxy Host",
            "program": "${workspaceFolder}\\libraries\\botbuilder\\tests\\teams\\integrationBot\\lib\\index.js",
            "sourceMaps": false,
            "env": {"TEST_MODE":"PROXY_HOST"},
            "cwd": "${workspaceFolder}\\libraries\\botbuilder\\tests\\teams\\integrationBot",
            "outFiles": [
                "${workspaceFolder}/**/*.js"
            ]
        },

    ]
}
```