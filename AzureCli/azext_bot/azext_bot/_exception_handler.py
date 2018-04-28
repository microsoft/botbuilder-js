# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

from knack.util import CLIError

def bot_exception_handler(ex):
    from azext_bot.botservice.models import ErrorException
    from msrestazure.azure_exceptions import CloudError
    if isinstance(ex, ErrorException):
        message = 'an error occurred with code:{0} and message:{1}'.format(
            ex.error.error.code,
            ex.error.error.message
        )
        raise CLIError(message)
    elif isinstance(ex, CloudError) and ex.status_code == 404:
        return None
    else:
        import sys
        from six import reraise
        reraise(*sys.exc_info())