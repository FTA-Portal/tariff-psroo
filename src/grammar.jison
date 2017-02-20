/* lexical grammar */
/* =============== */
%lex
%%
\s+                         /* skip whitespace */
[A-Z][A-Z0-9_]*             return 'CODE';
[0-9]+                      return 'HS';
['][^']+[']                 return 'TEXT';
","                         return ',';
"-"                         return '-';
"silent"                    return 'silent'
"parameter"                 return 'parameter'
"from"                      return 'from'
"text"                      return 'text'
"except"                    return 'except'
"condition"                 return 'condition'
"label"                     return 'label'
"details"                   return 'details'
"material"                  return 'material'
"extra"                     return 'extra'
"friendly"                  return 'friendly'
"("                         return '(';
")"                         return ')';
"<"                         return '<';
">"                         return '>';
"and"                       return 'and';
"or"                        return 'or';
<<EOF>>                     return 'EOF';
/lex
/* operator associations and precedence in increasing order */
/* ==================================== */
%left 'or'
%left 'and'
%left 'details'
%left 'label'
%left 'except'
%left 'from'
%left 'text'
%left 'condition'
%left 'parameter'
%left 'silent'
%left 'friendly'
%left ','
%left '-'
%left 'material'
%left 'extra'
/* language grammar */
/* ================ */
%start expressions
%% 
expressions
    : e EOF
        {return $1;} ;
e
    : '(' e ')'
        {$$ = $2;}
    | e 'and' e
        {$$ = {and: [$1, $3]};}
    | e 'or' e
        {$$ = {or: [$1, $3]};}
    | 'silent' e
        {$$ = $2; $$.silent = true;}
    | e 'friendly' CODE TEXT
        {$$ = $1; $$.friendly = $$.friendly || {}; $$.friendly[$3] = $4.substr(1, $4.length - 2);}
    | CODE
        {$$ = {code: $1};}
    | e 'parameter' TEXT
        {$$ = $1; $$[$2] = $3.substr(1, $3.length - 2);}
    | e 'text' TEXT
        {$$ = $1; $$[$2] = $3.substr(1, $3.length - 2);}
    | e 'condition' TEXT
        {$$ = $1; $$[$2] = $$[$2] || []; $$[$2].push($3.substr(1, $3.length - 2));}
    | e 'label' TEXT
        {$$ = $1; $$[$2] = $3.substr(1, $3.length - 2);}
    | e 'from' hslist
        {$$ = $1; $$[$2] = $3;}
    | e 'except' hslist
        {$$ = $1; $$[$2] = $3;}
    | e 'details' TEXT
        {$$ = $1; $$[$2] = $3.substr(1, $3.length - 2);}
;

hslist
    : hslist ',' hslist
        {$$ = {list: [$1, $3]};}
    | hslist '-' hslist
        {$$ = {range: [$1, $3]};}
    | HS
        {$$ = {code: $1};}
    | hslist 'material' TEXT
        {$$ = $1; $$[$2] = $3.substr(1, $3.length - 2);}
    | hslist 'extra' TEXT
        {$$ = $1; $$[$2] = $3.substr(1, $3.length - 2);}
;   
