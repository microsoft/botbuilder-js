function func(context) {
    var fromCity = context.local.compositeEntities[0].children.filter(child => child.type === "city::fromCity")[0];
    var toCity = context.local.compositeEntities[0].children.filter(child => child.type === "city::toCity")[0];
    
    context.local.fromCity = fromCity.value;
    context.local.toCity = toCity.value;

    context.global.fromCity = fromCity.value;
    context.global.toCity=  toCity.value;
    context.global.compositeEntities = context.local.compositeEntities;
}

module.exports = {
	func : func
};
