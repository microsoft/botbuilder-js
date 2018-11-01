const { LanguageGenerationResolver } = require('botbuilder-ai');

class LanguageGenerationMiddleware {
    /**
     * Creates a translation middleware.
     * @param {BotStatePropertyAccessor} entitiesStateAccessor Accessor for LG entities property in the user state.
     * @param {LanguageGenerationApplication} languageGenerationApplication Language Generation configuration object.
     */
    constructor(entitiesStateAccessor, languageGenerationApplication) {
        this.entitiesStateAccessor = entitiesStateAccessor;
        this.lgResolver = new LanguageGenerationResolver(languageGenerationApplication);
    }

    async onTurn(turnContext, next) {
        turnContext.onSendActivities(async (context, activities, next) => {
            const entities = await this.entitiesStateAccessor.get(context, {});
            try {
                await Promise.all(
                    activities.map(activity => {
                        activity.locale = activity.locale || context.activity.locale || 'en-US';
                        return this.lgResolver.resolve(activity, entities);
                    })
                );
            } catch (e) {
                console.error('Language generation resolution failed');
                throw e;
            }
            await next();
        });
        await next();
    }
}

module.exports.LanguageGenerationMiddleware = LanguageGenerationMiddleware;
