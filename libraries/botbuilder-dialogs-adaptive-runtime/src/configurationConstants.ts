// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export class ConfigurationConstants {
    /**
     * The configuration key mapping to the value representing the application root path.
     */
    static readonly ApplicationRootKey = 'applicationRoot';

    /**
     * The configuration key mapping to the value representing the bot root path.
     */
    static readonly BotKey = 'bot';

    /**
     * The configuration key mapping to the value representing the default resource identifier
     * of the dialog to be used as the root dialog of the bot.
     */
    static readonly RootDialogKey = 'defaultRootDialog';

    /**
     * The configuration key mapping to the value representing the default resource identifier
     * of the LanguageGenerator to be used by the bot.
     */
    static readonly LanguageGeneratorKey = 'defaultLg';

    /**
     * Default configuration location for runtime settings.
     */
    static readonly RuntimeSettingsKey = 'runtimeSettings';

    /**
     * The configuration key mapping to the value representing the default locale.
     */
    static readonly DefaultLocaleKey = 'defaultLocale';
}
