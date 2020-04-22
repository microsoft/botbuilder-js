parser grammar LGFileParser;

options { tokenVocab=LGFileLexer; }

file
    : paragraph+? EOF
    ;

paragraph
    : templateDefinition
    | importDefinition
    | optionDefinition
    | errorDefinition
    | commentDefinition
    | NEWLINE
    | EOF
    ;

commentDefinition
    : COMMENT NEWLINE?
    ;

importDefinition
    : IMPORT NEWLINE?
    ;

optionDefinition
    : OPTION NEWLINE?
    ;

errorDefinition
    : INVALID_LINE NEWLINE?
    ;

templateDefinition
    : templateNameLine templateBody
    ;

templateNameLine
    : TEMPLATE_NAME_LINE NEWLINE?
    ;

templateBody
    : templateBodyLine*
    ;

templateBodyLine
    : (TEMPLATE_BODY_LINE NEWLINE?) | NEWLINE
    ;