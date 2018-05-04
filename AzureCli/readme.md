# Azure CLI

Botservice Extension is an Azure CLI extension that provides support for managing bots and channels on the Azure Bot Service.</br>

## Prerequisites

Get a [valid Azure subscription](https://azure.microsoft.com/en-us/free/).
Install the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest).

## Installation
Remove the azure bot extension if it's already installed.  
`az extension list`  
`az extension remove -n <extensionname>`  
Install the bot service extension as follows -  
`az extension add --source https://icscratch.blob.core.windows.net/bot-packages/botservice-0.0.1-py2.py3-none-any.whl`

# Managing a Bot

## Creating a Bot
Login into your Azure account via CLI:

`az login`

Ensure that you are using the right subscription for creating your bot:

`az account show`

If needed, change your subscription:
`az account set --subscription <your-subscription-name>`

You need a resource group (existing or new) to create your bot and related assets. If needed, create a new resource group:
`az group create -l <resource-group-location> -n <resource-group-name>`

Now create your bot:
`az bot create -k webapp -g myResourceGroup -n myBot`

If you did not specify Microsoft app credentials during creation, you will be asked to login again so that we can create those credentials on your behalf.
> Tip: To avoid specifying the resource group, use `az configure --defaults group=myResourceGroup`.

You can get your bot credentials and information using the `--msbot` option:
`az bot show --msbot -n myBot -g myResourceGroup`

Pro Tips:
1) To avoid having to type your bot name and resource group name every time, use
`az configure --defaults botname=myBot group=myResourceGroup`

2) If you are stuck at any point, add a `-h` to the command to help you out.  For example:
`az bot create -h`

## Modifying a Bot
The following workflow assumes that you have your bot name and resource group name configured by default using 
`az configure`.  

A typical bot workflow is connecting your bot to msbot, downloading the source code, and then publishing back to Azure with changes.

First, connect your bot to msbot. You can get the MsBot CLI at [here](https://github.com/Microsoft/botbuilder-tools/tree/master/MSBot).
`az bot show --msbot | msbot connect Azure --stdin`

This will update your .bot file with all the information needed by other botbuilder tools to access it.  Now download the source code:
`az bot download`

This creates a folder with your bot name in the current directory (use `--file-save-path` to override the target folder), and downloads the bot source code into that folder. If you created your bot using `az bot create`, then the source code will be an echo bot project. It contains post-deploy scripts and build scripts to help deploy it back to Azure. Modify this template code as needed.

To publish your code back to azure, from within the bot directory (use `--code-dir` to override the source folder) run:
`az bot publish`

## Updating Bot Properties
Use the `az update` command to update your bot's description, message endpoint, etc.  
For this, the command expects you to supply the right property and value that needs to be updated.  To update your bot's description:

`az bot update --set properties.description="my new bot description"`

## Deleting a Bot
`az bot delete` deletes your bot.

Please note that deleting your bot only deletes the bot resource. It does not clean up other resources provisioned during the creation of your bot like storage account, web site, etc.

# Managing Bot Channels
The Azure bot extension supports addition, removal and display of properties for all kinds of channels supported by the Azure Bot Service.  Refer to [Bot Service Channel Management](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-manage-channels) for the necessary parameters needed to configure each channel.

The CLI supports various commands for each channel.  Type `az bot <ChannelName> -h` to learn more.  For example,
`az bot webchat show -n myBot -g myResourceGroup` shows the parameters in the webchat channel for the bot.  If you used `az configure` to set bot name and ResourceGroup, you can call `az bot webchat show`.

To remove a channel from a bot, use `az bot directline delete`.

# Known Issues and Limitations
These are the known issues and limitations that the CLI has right now.  
1) Creation of msa app id and password is not supported for hotmail.com accounts.
2) `az bot publish` fails for a c# solution , when the project is open in visual studio. To work around this for now, please close the solution before doing a publish.
