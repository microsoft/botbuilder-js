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

IMPORT : WHITESPACE* '[' ~[\r\n[\]]*? ']' '(' ~[\r\n()]*? ')' ~('\r'|'\n')* { !this.startTemplate }?;

TEMPLATE_NAME_LINE : WHITESPACE* '#' ~('\r'|'\n')* { this._tokenStartCharPositionInLine == 0 }? { this.startTemplate = true; };

INLINE_MULTILINE: WHITESPACE* '-' WHITESPACE* '```' ~('\r'|'\n')* '```' WHITESPACE* { this.startTemplate && this._tokenStartCharPositionInLine == 0 }?;

MULTILINE_PREFIX: WHITESPACE* '-' WHITESPACE* '```' ~('\r'|'\n')* { this.startTemplate && this._tokenStartCharPositionInLine == 0 }? -> pushMode(MULTILINE_MODE);

TEMPLATE_BODY : ~('\r'|'\n') { this.startTemplate }? ~('\r'|'\n')*;

INVALID_LINE :  ~('\r'|'\n') { !this.startTemplate }? ~('\r'|'\n')*;


mode MULTILINE_MODE;
MULTILINE_SUFFIX : '```' -> popMode;

ESCAPE_CHARACTER : '\\' ~[\r\n]?;

MULTILINE_TEXT : .+?;
