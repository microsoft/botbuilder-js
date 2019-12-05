## Description

The library **browser-functional-tests** is a suite of tests running with **Nightwatch** and **Selenium** to check the compatibility of a bot using libraries from BotBuilder-JS with different browsers.

## Run the test locally

_Note: The tests are configured to run in two-terminals, one for the webpack-dev-server which runs the bot, another for running the tests._ 

1. Go to `libraries/browser-functional-tests`, open a terminal and run `npm install`


2. Go to `libraries/browser-functional-tests/browser-echo-bot`, open a terminal and run the following commands:
   * `npm install`
   * `npm run start`
This command will start the browser bot using `webpack-dev-server`.

3. In the `botbuilder-js` root directory, open a new terminal and run the following commands:
   * `npm install`
   * `npm run browser-functional-test browser` where browser is _chrome_ or _firefox_

4. Go to the `.env` file and set the **TestURI** variable with `http://localhost:8080/` value

## Azure Build Pipeline Configuration
The next steps will guide you thought the configuration of a Build pipeline based on YAML file.

### Prerequisites

- Azure DevOps organization. You can find documentation [here](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/create-organization?view=azure-devops).
- Azure subscription. Required to create and delete Azure resources.
    
### Step by step

1. Create a pipeline using the classic editor, this options allows to us select the YAML file to configure the pipeline.
![image](https://user-images.githubusercontent.com/38112957/70251315-07982e80-175e-11ea-8edf-6f49af38922f.png)

2. Configure the repository and branch.
![image](https://user-images.githubusercontent.com/38112957/70251361-1da5ef00-175e-11ea-9c2a-777ab959829a.png)

3. In the section Configuration as code select YAML
![image](https://user-images.githubusercontent.com/38112957/70251402-331b1900-175e-11ea-9cb0-58094984e84f.png)

4. In the section YAML, write the build name, select the build YAML file.
![image](https://user-images.githubusercontent.com/38112957/70251437-4201cb80-175e-11ea-89b9-b1da5f7ab552.png)

5. In the Section Variables, Add a variable to save the azure subscription value.
![image](https://user-images.githubusercontent.com/38112957/70251455-4d54f700-175e-11ea-8ddb-e6f6766f25d7.png)

`Variable: AzureSubscription = "YOUR_AZ_SUBSCRIPTION"`

6. Save and queue.
