# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

def get_botservice_management_client(cli_ctx, *_):
    from azure.cli.core.commands.client_factory import get_mgmt_service_client
    from azext_bot.botservice import  AzureBotService
    return get_mgmt_service_client(cli_ctx, AzureBotService)

def get_botOperations_client(cli_ctx, *_):
    return get_botservice_management_client(cli_ctx).bots

def get_botServices_client(cli_ctx, *_):
    return get_botservice_management_client(cli_ctx).bot_services

def get_botChannels_client(cli_ctx, *_):
    return get_botservice_management_client(cli_ctx).channels

def get_operations_client(cli_ctx, *_):
    return get_botservice_management_client(cli_ctx).operations

