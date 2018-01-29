# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

# Bot Builder SDK v4

## System Requirements
- Node.js >= 8.6.x
- NPM == 4.6.x (Note: Do not use v5 due to package-lock issues)
- Git >= 2.10.x

## How to build + run this project

### macOS
#### Install project dependencies
- Navigate to the `js` directory in your terminal: `> cd ~/code/BotBuilder-Dev/js/`
- Bootstrap lerna `> npm install -g lerna && lerna bootstrap --hoist`
   
#### Run the examples
- Run a bot example: `> cd examples/echobot; npm start`
   
#### Run the tests
- Run core tests: `> npm run test`

#### Dev - Build all TypeScript packages
- Run: `> npm run build-packages`

#### Dev - Regenerate package documentation
- Run: `> npm run build-docs`

#### Dev - Reinstall local `node_modules` after building packages
- Run: `> npm run update-modules`

