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
  ignoreWS = true; // usually we ignore whitespace, but inside template, whitespace is significant
  inTemplate = false; // whether we are in the template
  beginOfTemplateBody = false; // whether we are at the begining of template body
  inMultiline = false; // whether we are in multiline
  beginOfTemplateLine = false;// weather we are at the begining of template string
  inStructuredValue = false; // weather we are in the structure value
  beginOfStructureProperty = false; // weather we are at the begining of structure property
}

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

fragment EMPTY_OBJECT: '{' WHITESPACE* '}';

fragment STRING_LITERAL : ('\'' (~['\r\n])* '\'') | ('"' (~["\r\n])* '"');

fragment STRING_INTERPOLATION : '`' ('\\`' | ~'`')* '`';

fragment EXPRESSION_FRAGMENT : '$' '{' (STRING_LITERAL | STRING_INTERPOLATION | EMPTY_OBJECT | ~[\r\n{}'"`] )+ '}'?;

fragment ESCAPE_CHARACTER_FRAGMENT : '\\' ~[\r\n]?;


// top level elements
OPTIONS
  : '>' WHITESPACE* '!#' ~('\r'|'\n')+
  ;

COMMENTS
  : '>' ~('\r'|'\n')* -> skip
  ;

WS
  : WHITESPACE+ -> skip
  ;

NEWLINE
  : '\r'? '\n' -> skip
  ;

HASH
  : '#' { this.inTemplate = true; this.beginOfTemplateBody = false; } -> pushMode(TEMPLATE_NAME_MODE)
  ;

DASH
  : '-' { this.inTemplate }? { this.beginOfTemplateLine = true; this.beginOfTemplateBody = false; } -> pushMode(TEMPLATE_BODY_MODE)
  ;

LEFT_SQUARE_BRACKET
  : '[' { this.inTemplate && this.beginOfTemplateBody }? -> pushMode(STRUCTURE_NAME_MODE)
  ;

IMPORT
  : '[' ~[\r\n[\]]*? ']' '(' ~[\r\n()]*? ')' { this.inTemplate = false;}
  ;

INVALID_TOKEN
  : . { this.inTemplate = false; this.beginOfTemplateBody = false; }
  ;

mode TEMPLATE_NAME_MODE;

WS_IN_NAME
  : WHITESPACE+ -> skip
  ;

NEWLINE_IN_NAME
  : '\r'? '\n' { this.beginOfTemplateBody = true;}-> skip, popMode
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

WS_IN_BODY
  : WHITESPACE+  {this.ignoreWS}? -> skip
  ;

MULTILINE_PREFIX
  : '```' { !this.inMultiline  && this.beginOfTemplateLine }? { this.inMultiline = true; this.beginOfTemplateLine = false;}-> pushMode(MULTILINE_MODE)
  ;

NEWLINE_IN_BODY
  : '\r'? '\n' { this.ignoreWS = true;} -> skip, popMode
  ;

IF
  : I F WHITESPACE* ':'  { this.beginOfTemplateLine}? { this.ignoreWS = true; this.beginOfTemplateLine = false;}
  ;

ELSEIF
  : E L S E WHITESPACE* I F WHITESPACE* ':' {this.beginOfTemplateLine}? { this.ignoreWS = true; this.beginOfTemplateLine = false;}
  ;

ELSE
  : E L S E WHITESPACE* ':' { this.beginOfTemplateLine }? { this.ignoreWS = true; this.beginOfTemplateLine = false;}
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
  : (('\r'? '\n') | ~[\r\n])+? -> type(TEXT)
  ;

mode STRUCTURE_NAME_MODE;

WS_IN_STRUCTURE_NAME
  : WHITESPACE+ -> skip
  ;

NEWLINE_IN_STRUCTURE_NAME
  : '\r'? '\n' { this.ignoreWS = true;} {this.beginOfStructureProperty = true;}-> skip, pushMode(STRUCTURE_BODY_MODE)
  ;

STRUCTURE_NAME
  : (LETTER | NUMBER | '_') (LETTER | NUMBER | '-' | '_' | '.')*
  ;

TEXT_IN_STRUCTURE_NAME
  : ~[\r\n]+?
  ;

mode STRUCTURE_BODY_MODE;

STRUCTURED_COMMENTS
  : '>' ~[\r\n]* '\r'?'\n' { !this.inStructuredValue && this.beginOfStructureProperty}? -> skip
  ;

WS_IN_STRUCTURE_BODY
  : WHITESPACE+ {this.ignoreWS}? -> skip
  ;

STRUCTURED_NEWLINE
  : '\r'? '\n' { this.ignoreWS = true; this.inStructuredValue = false; this.beginOfStructureProperty = true;}
  ;

STRUCTURED_BODY_END
  : ']' {!this.inStructuredValue}? { this.inTemplate = false; this.beginOfTemplateBody = false;} -> popMode, popMode
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

