# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

from azure.cli.core import AzCommandsLoader
from azext_bot._help import helps #pylint: disable=unused-import
import pdb
from azext_bot._client_factory import get_botservice_management_client

class BotServiceCommandsLoader(AzCommandsLoader):

    def __init__(self, cli_ctx=None):
        from azure.cli.core.commands import CliCommandType
        custom_type = CliCommandType(
            operations_tmpl='azext_bot.custom#{}',
            client_factory=get_botservice_management_client)
        super(BotServiceCommandsLoader, self).__init__(cli_ctx=cli_ctx,
                                                              custom_command_type=custom_type,
                                                              min_profile='2017-03-10-profile')
    
    def load_command_table(self, args):
        from azext_bot.commands import load_command_table
        load_command_table(self, args)
        return self.command_table

    def load_arguments(self, command):
        from azext_bot._params import load_arguments
        load_arguments(self, command)

COMMAND_LOADER_CLS = BotServiceCommandsLoader