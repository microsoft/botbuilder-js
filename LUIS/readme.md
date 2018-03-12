# LUIS

The Luis cli tool allows communication with the LUIS endpoints via command line. 
Any endpoint listed in the [documentation for the LUIS Programmatic APIs v2.0](https://westus.dev.cognitive.microsoft.com/docs/services/5890b47c39e2bb17b84a55ff/operations/5890b47c39e2bb052c5b9c2f)
is also available using this tool.

## Installing
Make sure you have node >=8.5 and npm installed on your machine. then use:

`npm install -g luis`

## Usage
Basic usage: `luis <api group> <action> [<target> [<subtarget>] [--<args> --<globalArgs>]]]`

Where `<api group>` is one of the following:

| API Group                                 | Description                                                   |
| :---------------------------------------- | --------------------------------------------------------------|
| apps                                      | Adding, listing, exporting, publishing and updating LUIS apps |
| examples                                  | Adding, removing and updating labeled examples to the app     |
| features                                  | Adding, removing, and updating pattern and phraselist feature info |
| models                                    | Interacting with LUIS models                                  |
| permissions                               | Interacting with access lists                                 |
| train                                     | Retrieving training status or training the configured app version|
| versions                                  | Assigning, cloning, deleting, importing and exporting app versions|

Where `<action>` is one of the following:

| Action                                    | Description                                                    
| :-----------------------------------------|-----------------------------------------------------------------|
| get,    g                                 | Retrieves or reads the specified `<target>` or `<subtarget>` where applicable |
| create, c                                 | Creates a new resource at the `<target>` or `<subtarget>` where applicable |
| list,   l                                 | Retrieves a list of `<target>` or `<subtarget>` (`--skip` and `--take` pagination arguments are optional) |
| update, u                                 | Updates an existing resource at `<target>` or `<subtarget>` where applicable |
| patch,  p                                 | Updates a partial resource at `<target>` or `<subtarget>` where applicable |
| delete, d                                 | Deletes a resource at `<target>` or `<subtarget>` where applicable |

| Arguments                                 |                                                                  |
| :-----------------------------------------|------------------------------------------------------------------|
| --appId                                   | Specifies the application id. This can optionally be specified in the .luisrc |
| --versionId                               | Specifies the version id. This can optionally be specified in the .luisrc |
| --in <path>                               | Specifies the input file path. Applicable for create, update and patch actions |
| --skip <integer>                          | Specifies the number of records to skip. Applicable for the list action only |
| --take <integer>                          | Specifies the number of records to take. Applicable for the list action only |

| Global Arguments                          |                                                                  |
| :-----------------------------------------|------------------------------------------------------------------|
| -- help, -h                               | Prints this help file. Use `<api group> [<target>] -h` to see specific details on an `<api group>`
| --!                                       | Dumps absolutely all documented commands to the console with descriptions |
| --init, -i                                | Initializes the .luisrc file with settings specific to your LUIS instance |
| --version, -v                             | Prints the version of this cli tool |