/* Cards definitions */

module.exports = {
    activityUpdate: {
        name: "Activity Update",
        card: require('./cards/scenarios/ActivityUpdate.json')
    },
    calendarReminder: { 
        name: "Calendar Reminder",
        card: require('./cards/scenarios/CalendarReminder.json')
    },
    flightItinerary: {
        name: "Flight Itinerary",
        card: require('./cards/scenarios/FlightItinerary.json')
    },
    flightUpdate: {
        name: "Flight Update",
        card: require('./cards/scenarios/FlightUpdate.json')
    },
    foodOrder: {
        name: "Food Order",
        content: require('./cards/scenarios/FoodOrder.json')
    },
    imageGallery: {
        name: "Image Gallery",
        content: require('./cards/scenarios/ImageGallery.json')
    },
    inputForm: {
        name: "Input Form",
        content: require('./cards/scenarios/InputForm.json')
    },
    inputs: {
        name: "Inputs",
        content: require('./cards/scenarios/Inputs.json')
    },
    restaurant: {
        name: "Restaurant",
        content: require('./cards/scenarios/Restaurant.json')
    },
    solitaire: {
        name: "Solitaire",
        content: require('./cards/scenarios/Solitaire.json')
    },
    sportsGameUpdate: {
        name: "Sports Game Update",
        content: require('./cards/scenarios/SportsGameUpdate.json')
    },
    stockUpdate: {
        name: "Stock Update",
        content: require('./cards/scenarios/StockUpdate.json')
    },
    weatherCompact: {
        name: "Weather Compact",
        content: require('./cards/scenarios/WeatherCompact.json')
    },
    weatherLarge: {
        name: "Weather Large",
        content: require('./cards/scenarios/WeatherLarge.json')
    }
}
