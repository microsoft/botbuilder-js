# Translate command
Often times you might want to target a multi-lingual bot. You can of course use Machine Translation as an integral part of your bot like documented [here](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-translation?view=azure-bot-service-4.0&tabs=cs). 

In other cases, you might want to manage the translation and localization for the language understanding content for your bot independently. 

Translate command in the ludown CLI takes advantage of the [Microsoft text translation API](https://docs.microsoft.com/en-us/azure/cognitive-services/translator/) to automatically machine translate .lu files to one or more than [60+ languages](https://aka.ms/translate-langs) supported by the Microsoft text translation cognitive service.

You can learn more about language x locale support for [LUIS.ai](https://www.luis.ai/) [here](https://docs.microsoft.com/en-us/azure/cognitive-services/LUIS/luis-supported-languages) and [qnamaker.ai](https://www.qnamaker.ai/) [here](https://docs.microsoft.com/en-us/azure/cognitive-services/qnamaker/overview/languages-supported)

## What is translated? 
With the ludown translate command you can translate: 
- An .lu file and optionally translate
    - Comments in the lu file
    - LU and QnA refrence link texts
- List of .lu files under a specific path.

When translating .lu file, 
- [Intents](docs/lu-file-format.md#intent) are not translated
- [Entity](docs/lu-file-format.md#entity) names are not translated

```
>ludown translate

  Usage: ludown translate -k <translate_key> --in <luFile> | -k <translate_key> --lu_folder <inputFolder> [-s]

  Translate .lu files from one language to another. Uses the Microsoft translator text API.

  Options:

    --in <luFile>                    .lu file to parse
    -t, --to_lang <tgtLang>          Target language to translate to. See https://aka.ms/translate-langs for list of supported langauges and codes.
    -k, --translate_key <trKey>      Your translation key. See https://aka.ms/translate-key to get your key
    -l, --lu_folder <inputFolder>    [Optional] Folder that has the .lu file. By default ludown will only look at the current folder. To look at all subfolders, include -s
    -o, --out_folder <outputFolder>  [Optional] Output folder for all files the tool will generate
    -f, --src_lang                   [Optional] Source language. When omitted, source language is automatically detected. See https://aka.ms/translate-langs for list of supported languages and codes
    -s, --subfolder                  [Optional] Include sub-folders as well when looking for .lu files
    -n, --lu_File <LU_File>          [Optional] Output .lu file name
    -c, --transate_comments          [Optional] Translate comments in .lu files
    -u, --translate_link_text        [Optional] Translate URL or .lu file reference link text
    --verbose                        [Optional] Get verbose messages from parser
    -h, --help                       output usage information
```

## Getting keys
Ludown translate expects a Machine tranlsation subscription key. You can obtain one [here](https://aka.ms/translate-key)

## Generating LUIS models from translated lu files
You can follow instructions [here](https://aka.ms/translate-langs) to create LUIS models from lu files using ludown translate command. 

**Note**: You need to explicitly provide the correct [LUIS lang code](https://docs.microsoft.com/en-us/azure/cognitive-services/LUIS/luis-supported-languages) to the ludown parse toluis command and this lang-code is different from the one you provide to the ludown translate command.

```
>ludown parse toluis -c de-DE --in c:\test\de\1.lu -o c:\test -n myLUISApp_de-DE
```

**Note**: ludown translate command does not verify validity of the lu file. You might want to try to parse the .lu file(s) before translating to address validity issues in the source language before translating. 