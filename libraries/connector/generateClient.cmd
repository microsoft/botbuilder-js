rd /s /q lib
autorest --input-file=swagger\ConnectorAPI.json --output-folder=lib --add-credentials --package-name=connector --nodejs --override-client-name=ConnectorClient