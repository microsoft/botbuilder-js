## Published Packages:

|Name|Stable, Preview or Deprecated Status|
|----|------------------------------------|
|adaptive-expressions|Stable|
|adaptive-expressions-ie11|Stable|
|botbuilder-ai|Stable|
|botbuilder-ai-orchestrator|Preview|
|botbuilder-applicationinsights|Stable|
|botbuilder-azure|Stable|
|botbuilder-azure-blobs|Preview|
|botbuilder-core|Stable|
|botbuilder-dialogs|Stable|
|botbuilder-dialogs-adaptive|Preview|
|botbuilder-dialogs-adaptive-testing|Preview|
|botbuilder-dialogs-declarative|Preview|
|botbuilder-lg|Stable|
|botbuilder-testing|Stable|
|botframework-config|Deprecated|
|botframework-connector|Stable|
|botframework-schema|Stable|
|botframework-streaming|Stable|

___

## Private/Internal Packages

The following packages are for internal flows such as testing and generating SDK components via Swagger. These packages (or folders) are not published to NPM and should have `"private": true,` in their package.json(s).

|Name|Purpose|CI|
|----|-------|--|
|bot-integration-tests|ChannelServiceHandler tests|Yes|
|browser-functional-tests|botbuilder-core integration test in the chrome|Yes|
|functional-tests|Echo Bot tests|Yes|
|streaming-e2e-tests|BF-DLJS + Web Chat + DL-ASE test|Yes|
|swagger|For generating `schema` & `connector` packages|No|
|teams-scenarios|Collection of test bots for Teams-specific flows|No|
|testbot|Manual CoreBot test project|No|
|testskills|Manual test project|No|