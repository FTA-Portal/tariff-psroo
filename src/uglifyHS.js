/**
 * @file Helper function
 * 
 * @author Nahid Akbar
 * @year 2015
 * @copyright National ICT Australia (NICTA). All rights reserved.
 */

"use strict";

function uglifyHS(code)
{
  switch (code.length)
  {
  case 0:
    return '';
  case 1:
  case 2:
    return 'chapter ' + code;
  case 3:
  case 4:
    return 'heading ' + code;
  case 5:
  case 6:
    return 'subheading ' + code.substr(0, 4) + '.' + code.substr(4);
  default:
    return 'HS' + code.substr(0, 4) + '.' + code.substr(4, 2) + '.' + code.substr(6);
  }
}

module.exports = uglifyHS;
