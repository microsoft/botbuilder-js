lexer grammar LGFileLexer;

// From a multiple-lanague perpective, it's not recommended to use members, predicates and actions to 
// put target-language-specific code in lexer rules 

// the reason we use it here is that
// 1. it greatly simplify the lexer rules, can avoid unnecessary lexer modes 
// 2. it helps us to output token more precisely
//    (for example, 'CASE:' not followed right after '-' will not be treated as a CASE token)
// 3. we only use very basic boolen variables, and basic predidates
//    so it would be very little effort to translate to other languages

@lexer::members {
  ignoreWS = true;             // usually we ignore whitespace, but inside template, whitespace is significant
  expectKeywords = false;        // whether we are expecting IF/ELSEIF/ELSE or Switch/Case/Default keywords
}

fragment LETTER: 'a'..'z' | 'A'..'Z';
fragment NUMBER: '0'..'9';

fragment WHITESPACE
  : ' '|'\t'|'\ufeff'|'\u00a0'
  ;

COMMENTS
  : ('>'|'$') ~('\r'|'\n')+ -> skip
  ;

WS
  : WHITESPACE+ -> skip
  ;

NEWLINE
  : '\r'? '\n' -> skip
  ;

HASH
  : '#' -> pushMode(TEMPLATE_NAME_MODE)
  ;

DASH
  : '-' {this.expectKeywords = true;} -> pushMode(TEMPLATE_BODY_MODE)
  ;

INVALID_TOKEN_DEFAULT_MODE
  : .
  ;

mode TEMPLATE_NAME_MODE;

WS_IN_NAME
  : WHITESPACE+ -> skip
  ;

NEWLINE_IN_NAME
  : '\r'? '\n' -> type(NEWLINE), popMode
  ;

IDENTIFIER
  : (LETTER | NUMBER | '_') (LETTER | NUMBER | '-' | '_')*
  ;

DOT
  : '.'
  ;

OPEN_PARENTHESIS
  : '('
  ;

CLOSE_PARENTHESIS
  : ')'
  ;

COMMA
  : ','
  ;

INVALID_SEPERATE_CHAR
  : [;]
  ;

mode TEMPLATE_BODY_MODE;

// a little tedious on the rules, a big improvement on portability
WS_IN_BODY_IGNORED
  : WHITESPACE+  {this.ignoreWS}? -> skip
  ;

WS_IN_BODY
  : WHITESPACE+  -> type(WS)
  ;

NEWLINE_IN_BODY
  : '\r'? '\n' {this.ignoreWS = true;} -> type(NEWLINE), popMode
  ;

IF
  : ('if'|'IF') WHITESPACE* ':'  {this.expectKeywords}? { this.ignoreWS = true;}
  ;

ELSEIF
  : ('elseif'|'ELSEIF') WHITESPACE* ':' {this.expectKeywords}? { this.ignoreWS = true;}
  ;

ELSE
  : ('else'|'ELSE') WHITESPACE* ':' {this.expectKeywords}? { this.ignoreWS = true;}
  ;

SWITCH
  : ('switch'|'SWITCH') WHITESPACE* ':' {this.expectKeywords}? {this.ignoreWS = true;}
  ;

CASE
  : ('case'|'CASE') WHITESPACE* ':' {this.expectKeywords}? {this.ignoreWS = true;}
  ;

DEFAULT
  : ('default'|'DEFAULT') WHITESPACE* ':' {this.expectKeywords}? {this.ignoreWS = true;}
  ;

MULTI_LINE_TEXT
  : '```' .*? '```' { this.ignoreWS = false; this.expectKeywords = false;}
  ;

ESCAPE_CHARACTER
  : '\\{' | '\\[' | '\\\\' | '\\'[rtn\]}]  { this.ignoreWS = false; this.expectKeywords = false;}
  ;

INVALID_ESCAPE
  : '\\'~[\r\n]?
  ;

EXPRESSION
  : '@'? '{' ~[\r\n{}]* '}'  { this.ignoreWS = false; this.expectKeywords = false;}
  ;

TEMPLATE_REF
  : '[' (~[\r\n\]] | TEMPLATE_REF)* ']'  { this.ignoreWS = false; this.expectKeywords = false;}
  ;

TEXT_SEPARATOR
  : [ \t\r\n{}[\]()]  { this.ignoreWS = false; this.expectKeywords = false;}
  ;

TEXT
  : ~[ \\\t\r\n{}[\]()]+  { this.ignoreWS = false; this.expectKeywords = false;}
  ;

