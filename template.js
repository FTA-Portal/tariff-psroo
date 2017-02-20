/**
 * @file Helper function
 * 
 * @author Nahid Akbar
 * @year 2015
 * @copyright National ICT Australia (NICTA). All rights reserved.
 */

"use strict";

var uglifyHS = require('./uglifyHS');

function template(str, vars) {
  var candidates = str.match(/\{\{[^\}]+\}\}/g);
  if (candidates) {
    candidates.forEach(function (candidate) {
      var variable = candidate.substr(2, candidate.length - 4);
      var value = false;
      switch (variable) {
        case 'subheading':
          if (vars.hscode) {
            value = uglifyHS(vars.hscode.replace(/[^0-9]/g, '').substr(0, 6));
          }
          break;
        case 'heading':
          if (vars.hscode) {
            value = uglifyHS(vars.hscode.replace(/[^0-9]/g, '').substr(0, 4));
          }
          break;
        case 'chapter':
          if (vars.hscode) {
            value = uglifyHS(vars.hscode.replace(/[^0-9]/g, '').substr(0, 2));
          }
          break;
        case 'hscode':
          if (vars.hscode) {
            value = uglifyHS(vars.hscode.replace(/[^0-9]/g, ''));
          }
          break;
        default:
          if (typeof vars[variable] === 'string') {
            value = vars[variable];
          }
          break;
      }
      if (value) {
        while (str.indexOf(candidate) !== -1) {
          str = str.replace(candidate, value);
        }
      } else {
        console.error('Variable ' + variable + ' could not be set.', str, vars);
      }
    });
  }
  return str;
}

module.exports = template;