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

fragment STRING_LITERAL : ('\'' (~['\r\n])* '\'') | ('"' (~["\r\n])* '"');

COMMENTS
  : ('>'|'$') ~('\r'|'\n')+ -> skip
  ;

WS
  : WHITESPACE+ -> skip
  ;

NEWLINE
  : '\r'? '\n'
  ;

HASH
  : '#' -> pushMode(TEMPLATE_NAME_MODE)
  ;

DASH
  : '-' {this.expectKeywords = true;} -> pushMode(TEMPLATE_BODY_MODE)
  ;

LEFT_SQUARE_BRACKET
  : '[' -> pushMode(STRUCTURED_TEMPLATE_BODY_MODE)
  ;
RIGHT_SQUARE_BRACKET
  : ']'
  ;

IMPORT_DESC
  : '[' ~[\r\n]*? ']'
  ;

IMPORT_PATH
  : '(' ~[\r\n]*? ')'
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

TEXT_IN_NAME
  : ~[\r\n]+?
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
  : I F WHITESPACE* ':'  {this.expectKeywords}? { this.ignoreWS = true;}
  ;

ELSEIF
  : E L S E I F WHITESPACE* ':' {this.expectKeywords}? { this.ignoreWS = true;}
  ;

ELSE
  : E L S E WHITESPACE* ':' {this.expectKeywords}? { this.ignoreWS = true;}
  ;

SWITCH
  : S W I T C H WHITESPACE* ':' {this.expectKeywords}? {this.ignoreWS = true;}
  ;

CASE
  : C A S E WHITESPACE* ':' {this.expectKeywords}? {this.ignoreWS = true;}
  ;

DEFAULT
  : D E F A U L T WHITESPACE* ':' {this.expectKeywords}? {this.ignoreWS = true;}
  ;

MULTI_LINE_TEXT
  : '```' .*? '```' { this.ignoreWS = false; this.expectKeywords = false;}
  ;

ESCAPE_CHARACTER
  : '\\{' | '\\[' | '\\\\' | '\\'[rtn\]}]  { this.ignoreWS = false; this.expectKeywords = false;}
  ;

EXPRESSION
  : '@'? '{' (~[\r\n{}] | STRING_LITERAL)*?  '}'  { this.ignoreWS = false; this.expectKeywords = false;}
  ;

TEMPLATE_REF
  : '[' (~[\r\n\]] | TEMPLATE_REF)* ']'  { this.ignoreWS = false; this.expectKeywords = false;}
  ;

TEXT_SEPARATOR
  : [\t\r\n{}[\]()]  { this.ignoreWS = false; this.expectKeywords = false;}
  ;

TEXT
  : ~[\t\r\n{}[\]()]+?  { this.ignoreWS = false; this.expectKeywords = false;}
  ;

mode STRUCTURED_TEMPLATE_BODY_MODE;

STRUCTURED_COMMENTS
  : ('>'|'$') ~[\r\n]* '\r'?'\n' -> skip
  ;

STRUCTURED_NEWLINE
  : '\r'? '\n'
  ;

STRUCTURED_TEMPLATE_BODY_END
  : RIGHT_SQUARE_BRACKET -> popMode
  ;
  
STRUCTURED_CONTENT
  : ~[\t\r\n[\]]+
  ;