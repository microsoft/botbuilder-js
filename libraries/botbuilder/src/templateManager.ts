import { Middleware, Promiseable } from './middleware';
import { Activity, ConversationReference, ActivityTypes, ConversationResourceResponse, applyConversationReference } from './activity';

/**
 * @module botbuilder
 */
/** second comment block */

/** Interface for a template renderer which provides the ability 
 * to create a text reply or activity reply from the language, templateid and data object
 **/
export interface TemplateRenderer {
    /** 
     * renders a template for the language/templateId 
     * 
     * @param language id (such as 'en')
     * @param templateId id of the template to apply
     * @param data Data object to bind to
     **/
    renderTemplate(context: BotContext, language: string, templateId: string, data: any): Promise<Partial<Activity> | string | undefined>;
}

export class TemplateManager implements Middleware {
    private templateRenderers: TemplateRenderer[] = [];
    private languageFallback: string[] = [];

    public contextCreated(context: BotContext, next: () => Promise<void>): Promise<void> {
        context.templateManager = this;
        return next();
    }

    public async postActivity(context: BotContext, activities: Partial<Activity>[], next: (newActivities?: Partial<Activity>[]) => Promise<ConversationResourceResponse[]>): Promise<ConversationResourceResponse[]> {
        // Ensure activities are well formed.
        for (let i = 0; i < activities.length; i++) {
            let activity = activities[i];
            if (activity.type == "template") {
                await this.bindActivityTemplate(context, activity);
            }
        }
        return next();
    }

    /**
     * register template renderer
     * @param renderer 
     */
    public register(renderer: TemplateRenderer): TemplateManager {
        this.templateRenderers.push(renderer);
        return this;
    }

    /**
     * list of registered template renderers
     */
    public list(): TemplateRenderer[] {
        return this.templateRenderers;
    }

    /**
     * SetLanguagePolicy allows you to set the fallback strategy 
     * @param fallback array of languages to try when binding templates
     */
    public setLanguagePolicy(fallback:string[]) :void {
        this.languageFallback = fallback;
    }

    /**
     * Get the current language fallback policy
     */
    public getLanguagePolicy() :string[] {
        return this.languageFallback;
    }

    private async findAndApplyTemplate(context: BotContext, language: string, templateId: string, data: any): Promise<Partial<Activity> | undefined> {
        for (var renderer of this.templateRenderers) {
            let templateOutput = await renderer.renderTemplate(context, language, templateId, data);
            if (templateOutput) {
                if (typeof templateOutput === 'object') {
                    if (!(templateOutput as Activity).type) {
                        templateOutput.type = ActivityTypes.message;
                    }
                    return <Partial<Activity>>templateOutput;
                } else {
                    const activity: Partial<Activity> = {
                        type: ActivityTypes.message,
                        text: templateOutput || '',
                    };
                    return activity;
                }
            }
        }
        return undefined;
    }


    private async bindActivityTemplate(context: BotContext, activity: Partial<Activity>): Promise<void> {
        const fallbackLocales = this.languageFallback.slice(0); // clone fallback
        if (!!context.request.locale)
            fallbackLocales.push(context.request.locale);
        fallbackLocales.push('default');
        
        // Ensure activities are well formed.
        // bind any template activity
        if (activity.type == "template") {
            // try each locale until successful
            for (let locale of fallbackLocales) {
                // apply template
                let boundActivity = await this.findAndApplyTemplate(context, locale, <string>activity.text, activity.value)
                if (boundActivity) {
                    Object.assign(activity, boundActivity);
                    return;
                }
            }
            throw new Error(`Could not resolve template id:${activity.text}`);
        }
    }

}
