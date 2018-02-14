export class AlarmRenderer {

    contextCreated(context, next) {
        context.templateManager.register(this);
        return next();
    }

    renderTemplate(context, language, templateId, value) {
        return {type: 'event', id: templateId, value};
    }
}