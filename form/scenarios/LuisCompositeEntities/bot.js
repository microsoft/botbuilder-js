export function func(conversationContext) {
    var fromCity = conversationContext.taskEntities.compositeEntities[0].children.filter(child => child.type === "city::fromCity")[0];
    var toCity = conversationContext.taskEntities.compositeEntities[0].children.filter(child => child.type === "city::toCity")[0];
    
    conversationContext.addTaskEntity('fromCity', fromCity.value);
    conversationContext.addTaskEntity('toCity', toCity.value);
    

    conversationContext.addContextEntity('fromCity', fromCity.value);
    conversationContext.addContextEntity('toCity', toCity.value);
    conversationContext.contextEntities.compositeEntities = conversationContext.taskEntities.compositeEntities;
}