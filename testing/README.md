## Testing Packages

The following packages are for internal flows such as testing and generating SDK components via Swagger. These packages (or folders) are not published to NPM and should have `"private": true,` in their package.json(s).

|Name|Purpose|CI|
|----|-------|--|
|bot-integration|ChannelServiceHandler tests|Yes|
|browser-functional|botbuilder-core integration test in the chrome|Yes|
|functional|Echo Bot tests|Yes|
|streaming-e2e|BF-DLJS + Web Chat + DL-ASE test|Yes|
|swagger|For generating `schema` & `connector` packages|No|
|testbot|Manual CoreBot test project|No|
|skills|Manual test project|No|
