# Commands

```
>ludown

  Usage: ludown [options] [command]

  Ludown is a command line tool to bootstrap language understanding models from .lu files

  Options:

    -v, --Version  output the version number
    -h, --help     output usage information

  Commands:

    parse|p        Convert .lu file(s) into LUIS JSON OR QnA Maker JSON files.
    refresh|d      Convert LUIS JSON and/ or QnAMaker JSON file into .lu file
    translate|t    Translate .lu files
    help [cmd]     display help for [cmd]
```

## Parse command

Convert .lu file(s) into LUIS JSON OR QnA Maker JSON files.

```
>ludown parse

  Usage: ludown parse [options] [command]

  Convert .lu file(s) into LUIS JSON, QnA Maker JSON files.

  Options:

    -h, --help     output usage information

  Commands:

    ToLuis|toluis  Convert .lu file(s) into LUIS JSON file.
    ToQna|toqna    Convert .lu file(s) into QnA Maker JSON files.
    help [cmd]     display help for [cmd]
```

### Parse ToLuis command

Convert .lu file(s) into LUIS JSON file. Optionally you can also generate a LUIS Batch test JSON file. 

```
>ludown parse toluis

  Usage: ludown parse ToLuis --in <luFile> | --lu_folder <inputFolder> [-s]

  Convert .lu file(s) into LUIS JSON file. You can optionally also request LUIS batch test input file

  Options:

    --in <luFile>                                    .lu file to parse
    -l, --lu_folder <inputFolder>                    [Optional] Folder that has the .lu file. By default ludown will only look at the current folder. To look at all subfolders, include -s
    -o, --out_folder <outputFolder>                  [Optional] Output folder for all files the tool will generate
    -s, --subfolder                                  [Optional] Include sub-folders as well when looking for .lu files
    -n, --luis_name <luis_appName>                   [Optional] LUIS app name
    -d, --luis_desc <luis_appDesc>                   [Optional] LUIS app description
    -v, --luis_versionId <luis_versionId>            [Optional] LUIS app version (default: 0.1)
    -c, --luis_culture <luis_appCulture>             [Optional] LUIS app culture (default: en-us)
    -t, --write_luis_batch_tests                     [Optional] Write out LUIS batch test json file
    --verbose                                        [Optional] Get verbose messages from parser
    -h, --help                                       output usage information
```

### Parse ToQna command

Convert .lu file(s) into QnA Maker JSON file.

```
>ludown parse toqna

  Usage: ludown parse ToQna --in <luFile> | --lu_folder <inputFolder> [-s]

  Convert .lu file(s) into QnA Maker JSON file

  Options:

    --in <luFile>                    .lu file to parse
    -l, --lu_folder <inputFolder>    [Optional] Folder with .lu file(s). By default ludown will only look at the current folder. -s to include subfolders
    -o, --out_folder <outputFolder>  [Optional] Output folder for all files the tool will generate
    -s, --subfolder                  [Optional] Include sub-folders as well when looking for .lu files
    -m, --qna_name <QnA_KB_Name>     [Optional] QnA KB name
    --verbose                        [Optional] Get verbose messages from parser
    -h, --help                       output usage information
```

## Refresh command
After you have bootstrapped and created your LUIS model and / or QnAMaker knowledge base, you might make subsequent refinements to your models directly from [luis.ai](https://luis.ai/) or [qnamaker.ai](https://qnamaker.ai). You can use the refresh command to re-genrate .lu files from your LUIS JSON and / or QnAMaker JSON files.  

```
>ludown refresh -h

  Usage: ludown refresh -i <LUISJsonFile> | -q <QnAJSONFile>

  Convert LUIS JSON and/ or QnAMaker JSON file into .lu file

  Options:

    -i, --LUIS_File <LUIS_JSON_File>            [Optional] LUIS JSON input file name
    -q, --QNA_FILE <QNA_FILE>                   [Optional] QnA Maker JSON input file name
    -o, --out_folder <outputFolder> [optional]  [Optional] Output folder for all files the tool will generate
    -n, --lu_File <LU_File>                     [Optional] Output .lu file name
    --verbose                                   [Optional] Get verbose messages from parser
    -h, --help                                  output usage information
```

## Machine translate .lu files
To bootstrap translations of the language understanding content for your bot, you can use the translate command. Ludown uses the Microsoft translator text API. See [here](https://aka.ms/translate-key) to get set up with your key.

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