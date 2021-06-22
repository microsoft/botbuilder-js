lexer grammar LGTemplateLexer;

@lexer::members {
  ignoreWS = true; // usually we ignore whitespace, but inside template, whitespace is significant
  beginOfTemplateBody = true; // whether we are at the begining of template body
  inMultiline = false; // whether we are in multiline
  beginOfTemplateLine = false;// weather we are at the begining of template string
  inStructuredValue = false; // weather we are in the structure value
  beginOfStructureProperty = false; // weather we are at the begining of structure property
}

@header {/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */}

// fragments
fragment A: 'a' | 'A';
fragment C: 'c' | 'C';
fragment D: 'd' | 'D';
fragment E: 'e' | 'E';
fragment F: 'f' | 'F';
fragment H: 'h' | 'H';
fragment I: 'i' | 'I';
fragment L: 'l' | 'L';
fragment S: 's' | 'S';
fragment T: 't' | 'T';
fragment U: 'u' | 'U';
fragment W: 'w' | 'W';

fragment LETTER: 'a'..'z' | 'A'..'Z';

fragment NUMBER: '0'..'9';

fragment WHITESPACE : ' '|'\t'|'\ufeff'|'\u00a0';

fragment STRING_LITERAL : ('\'' (('\\'('\''|'\\'))|(~'\''))*? '\'') | ('"' (('\\'('"'|'\\'))|(~'"'))*? '"');

fragment STRING_INTERPOLATION : '`' (('\\'('`'|'\\'))|(~'`'))*? '`';

fragment ESCAPE_CHARACTER_FRAGMENT : '\\' ~[\r\n]?;

fragment IDENTIFIER : (LETTER | NUMBER | '_') (LETTER | NUMBER | '_')*;

fragment OBJECT_DEFINITION
  : '{' (OBJECT_DEFINITION | STRING_LITERAL | STRING_INTERPOLATION | ~[}'"`])* '}'
  ;

fragment EXPRESSION_FRAGMENT
  : '$' '{' (STRING_LITERAL | STRING_INTERPOLATION | OBJECT_DEFINITION | ~[}'"`])+ '}'?
  ;

fragment NEWLINE_FRAGMENT
  : '\r'? '\n'
  ;

WS
  : WHITESPACE+ -> skip
  ;

NEWLINE
  : NEWLINE_FRAGMENT -> skip
  ;

COMMENTS
  : '>' ~[\r\n]* -> skip
  ;

DASH
  : '-' { this.beginOfTemplateLine = true; this.beginOfTemplateBody = false; } -> pushMode(NORMAL_TEMPLATE_BODY_MODE)
  ;

LEFT_SQUARE_BRACKET
  : '[' { this.beginOfTemplateBody }? {this.beginOfTemplateBody = false;} -> pushMode(STRUCTURE_NAME_MODE)
  ;

INVALID_TOKEN
  : . { this.beginOfTemplateBody = false; }
  ;

mode NORMAL_TEMPLATE_BODY_MODE;

WS_IN_BODY
  : WHITESPACE {this.ignoreWS}? WHITESPACE* -> skip
  ;

MULTILINE_PREFIX
  : '```' { !this.inMultiline  && this.beginOfTemplateLine }? { this.inMultiline = true; this.beginOfTemplateLine = false;}-> pushMode(MULTILINE_MODE)
  ;

NEWLINE_IN_BODY
  : NEWLINE_FRAGMENT { this.ignoreWS = true;} -> skip, popMode
  ;

IF
  : I F WHITESPACE* ':'  {this.beginOfTemplateLine}? { this.ignoreWS = true; this.beginOfTemplateLine = false;}
  ;

ELSEIF
  : E L S E WHITESPACE* I F WHITESPACE* ':' {this.beginOfTemplateLine}? { this.ignoreWS = true; this.beginOfTemplateLine = false;}
  ;

ELSE
  : E L S E WHITESPACE* ':' {this.beginOfTemplateLine}? { this.ignoreWS = true; this.beginOfTemplateLine = false;}
  ;

SWITCH
  : S W I T C H WHITESPACE* ':' {this.beginOfTemplateLine}? { this.ignoreWS = true; this.beginOfTemplateLine = false;}
  ;

CASE
  : C A S E WHITESPACE* ':' {this.beginOfTemplateLine}? { this.ignoreWS = true; this.beginOfTemplateLine = false;}
  ;

DEFAULT
  : D E F A U L T WHITESPACE* ':' {this.beginOfTemplateLine}? { this.ignoreWS = true; this.beginOfTemplateLine = false;}
  ;

ESCAPE_CHARACTER
  : ESCAPE_CHARACTER_FRAGMENT  { this.ignoreWS = false; this.beginOfTemplateLine = false;}
  ;

EXPRESSION
  : EXPRESSION_FRAGMENT  { this.ignoreWS = false; this.beginOfTemplateLine = false;}
  ;

TEXT
  : ~[\r\n]+?  { this.ignoreWS = false; this.beginOfTemplateLine = false;}
  ;

mode MULTILINE_MODE;

MULTILINE_SUFFIX
  : '```' { this.inMultiline = false; } -> popMode
  ;

MULTILINE_ESCAPE_CHARACTER
  : ESCAPE_CHARACTER_FRAGMENT -> type(ESCAPE_CHARACTER)
  ;

MULTILINE_EXPRESSION
  : EXPRESSION_FRAGMENT -> type(EXPRESSION)
  ;

MULTILINE_TEXT
  : (NEWLINE_FRAGMENT | ~[\r\n])+? -> type(TEXT)
  ;

mode STRUCTURE_NAME_MODE;

WS_IN_STRUCTURE_NAME
  : WHITESPACE+ -> skip
  ;

NEWLINE_IN_STRUCTURE_NAME
  : NEWLINE_FRAGMENT { this.ignoreWS = true;} {this.beginOfStructureProperty = true;}-> skip, pushMode(STRUCTURE_BODY_MODE)
  ;

STRUCTURE_NAME
  : (LETTER | NUMBER | '_') (LETTER | NUMBER | '-' | '_' | '.')*
  ;

TEXT_IN_STRUCTURE_NAME
  : ~[\r\n]+?
  ;

mode STRUCTURE_BODY_MODE;

STRUCTURED_COMMENTS
  : '>' ~[\r\n]* NEWLINE_FRAGMENT { !this.inStructuredValue && this.beginOfStructureProperty}? -> skip
  ;

WS_IN_STRUCTURE_BODY
  : WHITESPACE {this.ignoreWS}? WHITESPACE* -> skip
  ;

STRUCTURED_NEWLINE
  : NEWLINE_FRAGMENT { this.ignoreWS = true; this.inStructuredValue = false; this.beginOfStructureProperty = true;}
  ;

STRUCTURED_BODY_END
  : ']' {!this.inStructuredValue}? -> popMode, popMode
  ;

STRUCTURE_IDENTIFIER
  : (LETTER | NUMBER | '_') (LETTER | NUMBER | '-' | '_' | '.')* { !this.inStructuredValue && this.beginOfStructureProperty}? {this.beginOfStructureProperty = false;}
  ;

STRUCTURE_EQUALS
  : '=' {!this.inStructuredValue}? {this.inStructuredValue = true;}
  ;

STRUCTURE_OR_MARK
  : '|' { this.ignoreWS = true; }
  ;

ESCAPE_CHARACTER_IN_STRUCTURE_BODY
  : ESCAPE_CHARACTER_FRAGMENT { this.ignoreWS = false; }
  ;

EXPRESSION_IN_STRUCTURE_BODY
  : EXPRESSION_FRAGMENT { this.ignoreWS = false; }
  ;

TEXT_IN_STRUCTURE_BODY
  : ~[\r\n]+?  { this.ignoreWS = false; this.beginOfStructureProperty = false;}
  ;

