# Tariffs PSR

## TL;DR

A utility library for formalising and working with product specific rules of
origin. To use:

    const psr = TariffPSR.parse('...', agreement.rulesOfOrigin, {hscode: '0101a01'});
    console.log(formula.official);
    console.log(formula.categories);
    console.log(formula.dump());
    console.log(formula.friendly(category));
    console.log(formula.evaluate(...));
    console.log(formula.iterate(...));

## What

This is an example JavaScript library for working with product specific rules
of origin of trade products. This is used in examples in combination with
the DFAT Free Trade Agreement Portal Data.

This grammar and example module solves the problem of boolean algebra
representation and
evaluation of product specific rules of origin by machine in a consistent manner.
The grammar is intended to be context-free and described in later section.

## Who

This is intended for engineers who want to duplicate the FTA Portal RoO
functionality.

## Why

In international trade agreements, countries set up special
product specific rules (PSRs) to determine whether certain products can be traded
under said agreement. For example, certain products could be imported
from one country, get combined or processed etc, and then
exported to another country. PSR governs specifics of the rules and restrictions
to determine if a product can be considered to be originating
from a country.

These rules can be quite complex. Sometimes some rules can apply to all products.
Sometimes, multiple rules need to apply at the same time in complex boolean
relationships. This are mostly expressed in natural language.

This begs the question as to how to represent and reason about this
data by machine. This grammar was designed to solve that problem.

In terms of applicability, existence and conformance is more important
than specifics of the representation.

## When

This particular example implementation will facilitate javascript and
Nodejs users. This is developed to support the examples and use cases
we had to implement to support our services.

Practitioners using other technologies and platforms are encouraged to
treat this as one example implementation and develop their own implementations
as necessary.

## License

The MIT License (MIT)

Copyright (c) 2015-2016
National ICT Australia

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## How to Use

### npm

    npm install tariff-formula

### html

Browserified code is checked into the repository as
[psr.js](https://github.com/AusFTAs/tariff-psroo/blob/master/psr.js)

## Grammar

### Alphabet

Use ASCII characters.

### Tokens

  - [A-Z0-9_]+ is a CODE
  - ['][^']+['] is a TEXT
  - ","
  - "-"
  - "silent"
  - "parameter"
  - "text"
  - "except"
  - "condition"
  - "label"
  - "details"
  - "material"
  - "extra"
  - "("
  - ")"
  - "and"
  - "or"

### Rules

    e
        : '(' e ')'
        | e 'and' e
        | e 'or' e
        | 'silent' e
        | CODE
        | e 'parameter' TEXT
        | e 'text' TEXT
        | e 'condition' TEXT
        | e 'label' TEXT
        | e 'except' exc
        | e 'details' TEXT

    exc
        : exc ',' exc
        | CODE '-' CODE
        | CODE
        | exc material TEXT
        | exc extra TEXT


### Start

e

### Notes

All whitespace characters between terminals are ignored.

Jison is used for implementation. See src/grammar.jison for
more details.

PSR logic is simulated with boolean algebra.

'silent' fields are for incorporating implicit logic. e.g. hidden de minimis
rules.


'text' is for custom text representation that does not follow standard pattern.

'except' is for documenting a list of exceptions the code does not apply for

'condition' for documenting conditions


### Examples

  - WO
  - CC or silent CTH and RVC parameter '50'
  - WO except 01
  - WO except 01-02
  - WO except 01 material 'mammals' - 02, 03 extra 'alive only' 

## Modification

### Dependencies

    sudo npm install -g babel-cli
    sudo npm install -g browserify
    sudo npm install -g jison
    sudo npm install -g nodemon


### Sources

In src folder.

Run

    npm run grammar

to compile jison grammar file into js. I.e. grammar.js


Run

    npm run workDev

 to automatically compile files in src folder into es6 commonjs
 modules in root folder. I.e. index.js and test.js

Run

    npm run browserify

to prepare commonjs files for browser. I.e. psr.js

