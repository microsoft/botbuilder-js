# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

from knack.help_files import helps

helps['bot'] = """
    type: group
    short-summary: Manage Bot Services.
"""
helps['bot create'] = """
    type: command 
    short-summary: Create a new Bot Service.
"""
helps['bot show'] = """
    type: command 
    short-summary: get an existing Bot Service.
"""
helps['bot delete'] = """
    type: command 
    short-summary: delete an existing Bot Service.
"""
helps['bot update'] = """
    type: command 
    short-summary: update an existing Bot Service.
    examples:
        - name: Update description on a bot
          text: |-
            az bot update -n botname -g resource_group_name --set properties.description="some description"
"""
helps['bot publish'] = """
    type: command 
    short-summary: publish to an existing Bot Service.
    long-summary: publish your github or zip code to a bot service.
                  This lets you overwrite the existing template code on a bot.
"""
helps['bot download'] = """
    type: command 
    short-summary: download an existing Bot Service.
    long-summary: download the code deployed to your web/function app for your bot.
                  You can then make changes to it and publish it back to your app.
"""
helps['bot facebook create'] = """
    type: command 
    short-summary: Create Facebook Channel on a Bot.
"""
helps['bot email create'] = """
    type: command 
    short-summary: Create Email Channel on a Bot.
    examples:
        - name: Add Email Channel for a Bot
          text: |-
            az bot email create -n botname -g resource_group_name -a abc@outlook.com
            -p password --enable
"""
helps['bot msteams create'] = """
    type: command 
    short-summary: Create MsTeams Channel on a Bot.
    examples:
        - name: Add MsTeams Channel for a Bot with messaging and video enabled
          text: |-
            az bot msteams -n botname -g resource_group_name --enable-messaging
            --enable-video --enable
"""
helps['bot skype create'] = """
    type: command 
    short-summary: Create Skype Channel on a Bot.
    examples:
        - name: Add Skype Channel for a Bot with messaging and screen sharing enabled
          text: |-
            az bot msteams -n botname -g resource_group_name --enable-messaging
            --enable-screen-sharing --enable
"""
helps['bot kik create'] = """
    type: command 
    short-summary: Create Kik Channel on a Bot.
    examples:
        - name: Add Kik Channel for a Bot.
          text: |-
            az bot kik create -n botname -g resource_group_name -u mykikname
            -p password --key key --is-validated --enable
"""
helps['bot webchat create'] = """
    type: command 
    short-summary: Create WebChat Channel on a Bot.
    examples:
        - name: Add WebChat Channel for a Bot.
          text: |-
            az bot webchat create -n botname -g resource_group_name --enablev3 --enable
"""
helps['bot directline create'] = """
    type: command 
    short-summary: Create DirectLine Channel on a Bot.
    examples:
        - name: Add DirectLine Channel for a Bot.
          text: |-
            az bot webchat create -n botname -g resource_group_name --enablev3 --enable
"""
helps['bot telegram create'] = """
    type: command 
    short-summary: Create Telegram Channel on a Bot.
    examples:
        - name: Add Telegram Channel for a Bot.
          text: |-
            az bot telegram create -n botname -g resource_group_name --access-token token
            --is-validated --enable
"""
helps['bot sms create'] = """
    type: command 
    short-summary: Create Sms Channel on a Bot.
    examples:
        - name: Add Sms Channel for a Bot.
          text: |-
            az bot sms create -n botname -g resource_group_name --account-sid sid
            --auth-token token --is-validated --enable
"""
helps['bot slack create'] = """
    type: command 
    short-summary: Create Slack Channel on a Bot.
"""

for channel in ['facebook', 'email', 'msteams', 'skype', 'kik', 'webchat', 'directline', 'telegram', 'sms', 'slack']:
    channelTitle = channel[:1].upper() + channel[1:]
    helps['bot {0} delete'.format(channel)] = """
        type: command
        short-summary: Delete {0} Channel on a Bot
    """.format(channelTitle)
    helps['bot {0} get'.format(channel)] = """
        type: command
        short-summary: Get details of {0} Channel on a Bot
    """.format(channelTitle)
    helps['bot {0}'.format(channel)] = """
        type: group 
        short-summary: Manage {0} Channel on a Bot.
    """.format(channelTitle)