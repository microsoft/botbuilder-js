# Dispatch

Dispatch is a tool to create LUIS model used to dispatch intent across multiple bot components such as LUIS model(s), QnA and others
## Installation
```bash
npm i -g dispatch
```
## Arguments

| Argument                                  | Description                                                  |
| :---------------------------------------- | ------------------------------------------------------------ |
| --in <path> [optional]                    | The path of the markdown file to be parsed. If omitted, stdin will be used|
| --out <path> [optional]                   | The path of the transcript to be written. If omitted, stdout will be used|
| --help                                    | Output the help to the console
| no args                                   | If no arguments are provided, stdin is used as input and stdout is used as output |
```