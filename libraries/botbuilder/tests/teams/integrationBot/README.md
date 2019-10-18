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
1. Link Unfurl: Type "https://foo.com" (or some URL with https) in the client.  Should see
2. Action Based Messaging Extension - Fetch Task:
   1. Click on Menu

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