This sample demonstrates how to use dialogs in issolation within a middleware plugin. The sample contains a `GoodbyeMiddleware` class which can be added to any bot where it will listen for the user to say "goodbye". Upon being triggered it will prompt the user to confirm they'd like to end any active tasks and upon them saying yes it will reset the users conversation state.

Even though the middleware is using `botbuilder-dialogs` there's no requirement that the rest of the bot be using the same dialog system. This is achieved by having the middleware use it's own private dialog stack stored on the bots conversation state to avoid any potential collisions with the bots logic.

## Running
To run this sample folow the common instructions for running all of the samples found [here](../README.md#running).  This sample can be built using `npm run build-sample` and started using `npm run start`.