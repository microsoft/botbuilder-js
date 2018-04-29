# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

from knack.arguments import CLIArgumentType

from azure.cli.core.commands.parameters import (
    tags_type,
    resource_group_name_type,
    get_resource_name_completion_list,
    get_enum_type,
    get_three_state_flag)

name_arg_type = CLIArgumentType(metavar='NAME', configured_default='botname')

def load_arguments(self, _):
    with self.argument_context('bot') as c:
        c.argument('resource_group_name', arg_type=resource_group_name_type)
        c.argument('resource_name', options_list=['--name', '-n'], help='the Resouce Name of the bot', arg_type=name_arg_type)

    with self.argument_context('bot create') as c:
        c.argument('sku_name', options_list=['--sku'], arg_type=get_enum_type(['F0','S1']), help='the Sku of the Bot')
        c.argument('kind', options_list=['--kind', '-k'], arg_type=get_enum_type(['registration','function','webapp']), help='the Kind of the Bot.')
        c.argument('display_name', help='the Display Name of the bot.If not specified, defaults to the name of the bot.')
        c.argument('description', options_list=['--description', '-d'], help='the Description of the bot.')
        c.argument('endpoint', options_list=['-e', '--endpoint'], help='the Messaging Endpoint of the bot.')
        c.argument('msa_app_id', options_list=['--appid'], help='the msa account id to be used with the bot.')
        c.argument('password', options_list=['-p','--password'], help='the msa password for the bot from developer portal.')
        c.argument('storageAccountName', options_list=['-s','--storage'], help='Storage Account Name to be used with the bot.If one is not provided, a new account will be created.')
        c.argument('tags', help='set of tags to add to the bot.')
        c.argument('bot_json', options_list=['--msbot'], help='show the output as json compatible with a .bot file', arg_type=get_three_state_flag())
        c.argument('language', help='The language to be used to create the bot.', options_list=['--lang'], arg_type=get_enum_type(['Csharp','Node']))

    with self.argument_context('bot show') as c:
        c.argument('bot_json', options_list=['--msbot'], help='show the output as json compatible with a .bot file', arg_type=get_three_state_flag())

    with self.argument_context('bot facebook create') as c:
        c.argument('is_disabled', options_list=['--add-disabled'], arg_type=get_three_state_flag(), help='add the channel in a disabled state')
        c.argument('page_id', options_list=['--page-id'], help='the facebook page id.')
        c.argument('app_id', options_list=['--appid'], help='the facebook application id.')
        c.argument('app_secret', options_list=['--secret'], help='the facebook application secret.')
        c.argument('access_token', options_list=['--token'], help='the facebook application access token.')
    
    with self.argument_context('bot email create') as c:
        c.argument('is_disabled', options_list=['--add-disabled'], arg_type=get_three_state_flag())
        c.argument('email_address', options_list=['--email-address','-a'], help='the email address for the bot.')
        c.argument('password', options_list=['--password','-p'], help='the email password for the bot.')
    
    with self.argument_context('bot msteams create') as c:
        c.argument('is_disabled', options_list=['--add-disabled'], arg_type=get_three_state_flag(), help='add the channel in a disabled state')
        c.argument('enable_messaging', help='Enable messaging on Skype', arg_type=get_three_state_flag())
        c.argument('enable_media_cards', help='Enable media cards on Skype', arg_type=get_three_state_flag())
        c.argument('enable_video', help='Enable video on Skype', arg_type=get_three_state_flag())
        c.argument('enable_calling', help='Enable calling on Skype', arg_type=get_three_state_flag())
        c.argument('call_mode', help='The call mode to use on Microsoft Teams')
    
    with self.argument_context('bot skype create') as c:
        c.argument('is_disabled', options_list=['--add-disabled'], arg_type=get_three_state_flag(), help='add the channel in a disabled state')
        c.argument('enable_messaging', help='Enable messaging on Skype', arg_type=get_three_state_flag())
        c.argument('enable_media_cards', help='Enable media cards on Skype', arg_type=get_three_state_flag())
        c.argument('enable_video', help='Enable video on Skype', arg_type=get_three_state_flag())
        c.argument('enable_calling', help='Enable calling on Skype', arg_type=get_three_state_flag())
        c.argument('enable_screen_sharing', help='Enable screen sharing on Skype', arg_type=get_three_state_flag())
        c.argument('enable_groups', help='Enable groups on Skype', arg_type=get_three_state_flag())
        c.argument('groups_mode', help='The groups mode to use on Skype')
        c.argument('calling_web_hook', help='The calling web hook to use on Skype')
    
    with self.argument_context('bot kik create') as c:
        c.argument('is_disabled', options_list=['--add-disabled'], arg_type=get_three_state_flag(), help='add the channel in a disabled state')
        c.argument('user_name', options_list=['--user-name','-u'], help='kik user name')
        c.argument('is_validated', action='store_true', help='Has the user name been validated')
        c.argument('api_key', options_list=['--key'], help='the api key for the kik account')
    
    with self.argument_context('bot webchat create') as c:
        c.argument('is_disabled', options_list=['--add-disabled'], arg_type=get_three_state_flag(), help='add the channel in a disabled state')
        c.argument('site_name', options_list=['-s','--site-name'], help='name of the webchat channel site')
        c.argument('enable_preview', help='Enable preview features on the chat control', arg_type=get_three_state_flag())
    
    with self.argument_context('bot directline create') as c:
        c.argument('is_disabled', options_list=['--add-disabled'], arg_type=get_three_state_flag(), help='add the channel in a disabled state')
        c.argument('site_name', options_list=['-s','--site-name'], help='name of the webchat channel site')
        c.argument('is_v1_enabled', options_list=['--enablev1'], action='store_true', help='Enable v1 channel protocol')
        c.argument('is_v3_enabled', options_list=['--enablev3'], action='store_true', help='Enable v3 channel protocol')
    
    with self.argument_context('bot telegram create') as c:
        c.argument('is_disabled', options_list=['--add-disabled'], arg_type=get_three_state_flag())
        c.argument('access_token', help='The access token for the telegram account')
        c.argument('is_validated', action='store_true', help='Has the user name been validated')
    
    with self.argument_context('bot sms create') as c:
        c.argument('is_disabled', options_list=['--add-disabled'], arg_type=get_three_state_flag(), help='add the channel in a disabled state')
        c.argument('account_sid', help='The account sid for the twilio account')
        c.argument('auth_token', help='The token token for the twilio account.')
        c.argument('is_validated', action='store_true', help='Has the user name been validated.')
        c.argument('phone', help='the phone number for the twilio account.')
    
    with self.argument_context('bot slack create') as c:
        c.argument('is_disabled', options_list=['--add-disabled'], arg_type=get_three_state_flag(), help='add the channel in a disabled state')
        c.argument('client_secret', help='The client secret from slack')
        c.argument('client_id', help='The client id from slack')
        c.argument('verification_token', help='The verification token from slack')
        c.argument('landing_page_url', help='The landing page url to redirect to after login')