parser grammar LGFileParser;

options { tokenVocab=LGFileLexer; }

@header {/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */}

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
    : ((TEMPLATE_BODY | INLINE_MULTILINE | (MULTILINE_PREFIX (MULTILINE_TEXT|ESCAPE_CHARACTER)* MULTILINE_SUFFIX?)) NEWLINE?) | NEWLINE
    ;