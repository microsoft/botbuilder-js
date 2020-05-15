lexer grammar LGFileLexer;

@lexer::members {
  startTemplate = false;
}

@header {/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */}

fragment WHITESPACE : ' '|'\t'|'\ufeff'|'\u00a0';

NEWLINE : '\r'? '\n';

OPTION : WHITESPACE* '>' WHITESPACE* '!#' ~('\r'|'\n')+ { !this.startTemplate }?;

COMMENT : WHITESPACE* '>' ~('\r'|'\n')* { !this.startTemplate }?;

IMPORT : WHITESPACE* '[' ~[\r\n[\]]*? ']' '(' ~[\r\n()]*? ')' WHITESPACE* { !this.startTemplate }?;

TEMPLATE_NAME_LINE : WHITESPACE* '#' ~('\r'|'\n')* { this.startTemplate = true; };

TEMPLATE_BODY_LINE : ~('\r'|'\n')+ { this.startTemplate }?;

INVALID_LINE :  ~('\r'|'\n')+ { !this.startTemplate }?;
