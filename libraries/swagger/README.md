# BotFramework Connector

> see https://aka.ms/autorest

Configuration for generating BotFramework Connector SDK.

``` yaml
add-credentials: true
openapi-type: data-plane
```
The current release for the BotFramework Connector is v3.0.

# Releases

## Connector API 3.0

``` yaml
input-file: ConnectorAPI.json
```

### Connector API 3.0 - NodeJS Settings
These settings apply only when `--nodejs` is specified on the command line.
``` yaml $(nodejs)
nodejs:
  override-client-name: ConnectorClient
  package-name: connector
  license-header: MICROSOFT_MIT_NO_VERSION
  azure-arm: false
  use-internal-constructors: true
  clear-output-folder: true
  output-folder: ./generated
```