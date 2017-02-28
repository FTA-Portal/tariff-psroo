/**
 * @file Product Specific Rules Of Origin Module
 * 
 * @author Nahid Akbar
 * @year 2015
 * @copyright National ICT Australia (NICTA). All rights reserved.
 */

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var grammar = require("./grammar");
var uglifyHS = require('./uglifyHS');
var template = require('./template');

var PSR = function () {
  function PSR(tree, roo, vars) {
    _classCallCheck(this, PSR);

    this.tree = tree;
    this.roo = roo;

    this.official = formatOfficialHelper(this.tree);

    var codes = findAllCodesHelper(this.tree);
    var conditions = findAllConditionsHelper(codes);
    var labels = findAllLabelsHelper(codes);
    var details = findAllDetailsHelper(codes);

    var categoryById = {};
    var questionById = {};

    this.friendlyExpanded = {};
    this.friendlyGroupingException = {};

    this.categories = [];
    this.questions = [];
    this.outcomes = {};

    var that = this;

    roo.forEach(function (item, index) {
      item.item = index;
      switch (item.type) {
        case 'category':
          item.ruleFormattingStr = item.ruleFormattingStr || 'For {{hscode}}, the rule is {{friendlyRules}}.';
          item.conditionsExtraDetailsStr = item.conditionsExtraDetailsStr || 'The addition of "provided that" or "except from" in the rule creates additional parameters that must be followed for the product to qualify under this rule. Please follow closely the wording of the rule in selecting "yes" or "no" for this question.';
          item.details = item.details || '';
          item.questions = [];
          item.questionsById = {};
          that.categories.push(categoryById[item.itemIf] = item);
          break;
        case 'question':
          var included = item.itemIf.split(',').filter(function (itm) {
            return codes[itm] !== undefined;
          }).length > 0;
          if (included) {
            that.questions.push(item);

            var category = categoryById[item.parentCategory];

            category.questions.push(item);
            category.questionsById[item.itemIf] = item;

            if (item.itemIf in labels) {
              item.label = labels[item.itemIf];
            }
            if (item.details) {
              item.details = [item.details];
            } else {
              item.details = [];
            }
            if (item.itemIf in conditions) {
              item.conditions = conditions[item.itemIf];
              item.label = item.label.replace(/\?$/, " in accordance with the following rules?");
              item.details.push(category.conditionsExtraDetailsStr);
            }
            if (item.itemIf in details) {
              item.details.push(details[item.itemIf]);
            }

            var code = codes[item.itemIf];

            vars.parameter = code.parameter || undefined;

            item.label = template(item.label, vars);
            item.details = item.details.join('\n\n');

            item.details = template(item.details.replace(/(^\s*|\s*$)/g, ''), vars);
          }
          if (item.parentCategory) {
            that.friendlyGroupingException[item.itemIf] = item.parentCategory;
          }
          if (item.itemIfText) {
            that.friendlyExpanded[item.itemIf] = item.itemIfText;
          }
          questionById[item.itemIf] = item;
          break;
        case 'outcome':
          that.outcomes[item.itemIf] = item;
          break;
      }
    });

    Object.keys(codes).filter(function (code) {
      return !(code in questionById);
    }).forEach(function (code) {
      throw new Error("Question related to " + code + " does not exist.");
    });

    this.categories.forEach(function (category) {
      vars.friendlyRules = friendlyHelper(that.tree, that.friendlyExpanded, that.friendlyGroupingException, category.itemIf, category, vars).replace(/\s+/g, ' ').replace(/(^[ ]|[ ]$)/g, '').replace(/^(or|and| )*|(or|and| )*$/g, '');
      if (vars.friendlyRules) {
        category.friendlyRules = vars.friendlyRules = template(vars.friendlyRules, vars);
        category.details += (category.details ? '\n\n' : '') + category.ruleFormattingStr;
        category.details = template(category.details, vars);
      }
    });
    this.iterate();
  }

  _createClass(PSR, [{
    key: "dump",
    value: function dump() {
      return dumpHelper(this.tree);
    }
  }, {
    key: "iterate",
    value: function iterate(answers) {
      var answers = answers || {};
      var that = this;

      var blacklist = {};
      var values = {};
      var outcome = 'unclear';
      for (var q = 0; q < this.questions.length && outcome == 'unclear'; q++) {
        this.questions[q].visible = false;
      }
      for (var q = 0; q < this.questions.length && outcome == 'unclear'; q++) {
        var question = this.questions[q];
        if (!(question.itemIf in blacklist)) {
          question.visible = true;
          if (answers[question.itemIf] === true || answers[question.itemIf] === false) {
            values[question.itemIf] = answers[question.itemIf] === true;
            outcome = evaluateHelper(this.tree, values, blacklist);
          } else {
            break;
          }
        }
      }

      Object.keys(that.categories).map(function (cat) {
        return that.categories[cat];
      }).forEach(function (category) {
        category.visible = false;
        category.questions.forEach(function (question) {
          category.visible = category.visible || question.visible;
        });
      });

      return this.outcomes[outcome];
    }
  }], [{
    key: "parse",
    value: function parse(text) {
      var roo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var vars = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      return new PSR(grammar.parse(text), JSON.parse(JSON.stringify(roo)), vars);
    }
  }]);

  return PSR;
}();

function formatOfficialHelper(tree) {
  if (tree.silent) {
    return '';
  }

  if (tree.or) {
    return tree.or.map(formatOfficialHelper).filter(function (i) {
      return i;
    }).join(' or ');
  }
  if (tree.and) {
    return tree.and.map(formatOfficialHelper).filter(function (i) {
      return i;
    }).join(' or ');
  }

  if (tree.text) {
    return tree.text;
  } else {
    var output = '';
    if (tree.code) {
      //if (/^\d+$/.test(tree.code))
      //{
      //  output += ' materials of ' + uglifyHS(tree.code);
      //}
      //else
      //{
      output += tree.code.replace(/_/g, '');
      //}
    }
    if (tree.parameter) {
      output += '(' + tree.parameter + ')';
    }

    if (tree.except) {
      output += hslistToText(tree.except);
    }

    if (tree.condition) {
      output += ' ' + tree.condition;
    }
    return output.replace(/[ ]+/g, ' ').replace(/(^[ ]|[ ]$)/, '');
  }
}

function findAllCodesHelper(tree, output) {
  output = output || {};
  if (tree.or) {
    tree.or.forEach(function (x) {
      return findAllCodesHelper(x, output);
    });
  }
  if (tree.and) {
    tree.and.forEach(function (x) {
      return findAllCodesHelper(x, output);
    });
  }
  if (tree.code) {
    output[tree.code] = tree;
  }
  return output;
}

function findAllLabelsHelper(codes) {
  var output = {};
  Object.keys(codes).map(function (c) {
    return codes[c];
  }).filter(function (tree) {
    return tree.label;
  }).forEach(function (tree) {
    output[tree.code] = tree.label;
  });
  return output;
}

function findAllDetailsHelper(codes) {
  var output = {};

  Object.keys(codes).map(function (c) {
    return codes[c];
  }).filter(function (tree) {
    return tree.details;
  }).forEach(function (tree) {
    output[tree.code] = output[tree.code] || [];
    output[tree.code].push(tree.details);
  });

  return output;
}

function findAllConditionsHelper(codes) {
  var output = {};

  Object.keys(codes).map(function (c) {
    return codes[c];
  }).filter(function (tree) {
    return tree.except || tree.condition || tree.from;
  }).forEach(function (tree) {
    var list = output[tree.code] || (output[tree.code] = []);
    if (tree.from) {
      list.push("provided that it is a change from " + hslistToText(tree.from));
    }
    if (tree.except) {
      var excepts = [tree.except];
      while (excepts.length > 0) {
        var except = excepts.splice(0, 1)[0];
        if (except.list) {
          excepts = excepts.concat(except.list);
        } else {
          list.push("provided that it is not a change from " + hslistToText(except));
        }
      }
    }
    if (tree.condition) {
      tree.condition.forEach(function (cond) {
        return list.push(cond);
      });
    }
  });

  return output;
}

function hslistToText(except, i, l) {
  if (except.range) {
    return except.range.map(hslistToText).join(' through to ');
  }

  if (except.list) {
    return except.list.map(hslistToText).join(', ');
  }

  var printMaterial = true;

  if (i && l && l[i - 1].material === except.material) {
    printMaterial = false;
  }

  return (printMaterial ? (except.material || 'materials') + ' of ' : '') + ("" + uglifyHS(except.code) + (except.extra ? ' ' + except.extra : ''));
}

// ==========================

function hslistToEncoded(except) {
  if (except.range) {
    return except.range.map(hslistToEncoded).join('-');
  }

  if (except.list) {
    return except.list.map(hslistToEncoded).join(',');
  }

  var output = '' + except.code;

  if (except.material) {
    output += " material '" + except.material + "'";
  }

  if (except.extra) {
    output += " extra '" + except.extra + "'";
  }

  return output;
}

var dumpHelper = function dumpHelper(tree) {
  var output = '';

  if (tree.or) {
    output = dumpHelper(tree.or[0]) + " or " + dumpHelper(tree.or[1]);
  }
  if (tree.and) {
    output = dumpHelper(tree.and[0]) + " and " + dumpHelper(tree.and[1]);
  }

  if (tree.code) {
    output += tree.code;
  }

  if (tree.parameter) {
    output += " parameter '" + tree.parameter + "'";
  }

  if (tree.from) {
    output += ' from ' + hslistToEncoded(tree.from);
  }

  if (tree.text) {
    output += " text '" + tree.text + "'";
  }

  if (tree.except) {
    output += ' except ' + hslistToEncoded(tree.except);
  }

  if (tree.condition) {
    tree.condition.forEach(function (condition) {
      return output += " condition '" + condition + "'";
    });
  }

  if (tree.label) {
    output += " label '" + tree.label + "'";
  }

  if (tree.details) {
    output += " details '" + tree.details + "'";
  }

  if (tree.silent) {
    output = "silent (" + output + ")";
  }

  if (tree.friendly) {
    Object.keys(tree.friendly).forEach(function (category) {
      output = "(" + output + ") friendly " + category + " '" + tree.friendly[category] + "'";
    });
  }

  return output;
};

var friendlyHelper = function friendlyHelper(tree, expanded, groups, category, settings, vars) {

  if (tree.friendly && category in tree.friendly) {
    return tree.friendly[category];
  }

  if (tree.silent) {
    return '';
  }

  if (tree.or) {
    return tree.or.map(function (rule) {
      return friendlyHelper(rule, expanded, groups, category, settings, vars);
    }).join(' or ');
  }

  if (tree.and) {
    return tree.and.map(function (rule) {
      return friendlyHelper(rule, expanded, groups, category, settings, vars);
    }).join(' and ');
  }

  if (tree.code && tree.code in groups) {
    if (groups[tree.code] !== category) {
      return '';
    }
  }

  if (tree.parameter) {
    vars.parameter = tree.parameter;
  }

  if (tree.text) {
    return template(tree.text, vars);
  } else if (settings.questionsById[tree.code].friendlyText) {
    return template(settings.questionsById[tree.code].friendlyText, vars);
  } else {
    var output = '';
    if (tree.code) {
      //if (/^\d+$/.test(tree.code))
      //{
      //  output += ' materials of ' + uglifyHS(tree.code);
      //}
      //else
      //{
      output += tree.code;
      //}
    }
    if (tree.parameter) {
      output += '(' + tree.parameter + ')';
    }

    if (tree.from) {
      output += ' from ' + hslistToText(tree.from);
    }

    if (tree.code in expanded) {
      if (tree.parameter) {
        output = expanded[tree.code] + (settings.hideItemCode ? '' : ' - ' + output);
      } else {
        output = expanded[tree.code] + (settings.hideItemCode ? '' : ' (' + output + ')');
      }
    }

    if (tree.except) {
      output += ' except from ' + hslistToText(tree.except);
    }

    if (tree.condition) {
      output += ' ' + tree.condition;
    }
    return template(output, vars);
  }
};

function evaluateHelper(tree, values, blacklist) {
  if (tree.or) {
    var a = evaluateHelper(tree.or[0], values, blacklist);
    var b = evaluateHelper(tree.or[1], values, blacklist);
    if (a === 'applicable' || b === 'applicable') {
      return 'applicable';
    }
    if (a === 'unclear' || b === 'unclear') {
      return 'unclear';
    }
    return 'inapplicable';
  }
  if (tree.and) {
    var a = evaluateHelper(tree.and[0], values, blacklist);
    var b = evaluateHelper(tree.and[1], values, blacklist);
    if (a === 'applicable' && b === 'applicable') {
      return 'applicable';
    }
    if (a === 'inapplicable') {
      Object.keys(findAllCodesHelper(tree.and[1])).forEach(function (code) {
        return blacklist[code] = true;
      });
      return 'inapplicable';
    }
    if (b === 'inapplicable') {
      Object.keys(findAllCodesHelper(tree.and[0])).forEach(function (code) {
        return blacklist[code] = true;
      });
      return 'inapplicable';
    }
    return 'unclear';
  }
  if (values[tree.code] === undefined) {
    return 'unclear';
  } else if (values[tree.code] === true) {
    return 'applicable';
  } else {
    return 'inapplicable';
  }
}

module.exports = PSR;
