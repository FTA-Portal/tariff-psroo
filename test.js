'use strict';

var TariffPSR = require("./index");

var cases = ['A1', // basic
'A2 from 03 except 01', //
'A2 except 02-0303,0404,050505-06060607 condition \'it must be funky\'', 'silent A1 and B1 friendly B \'CCF1\' or B2', //
'B1 condition \'provided the good classified in subheading 2841.90 must be the product of a chemical reaction\'', 'A1 except 01 material \'M01\' extra \'E01\', 02 material \'M02\' extra \'E02\'', 'A2 except 01 material \'M01\' extra \'E01\' - 02 material \'M01\' extra \'E02\'', 'A2 except 01,02,03,04,05'];

var template = [{
  'type': 'category',
  'label': 'Category A',
  'itemIf': 'A'
}, {
  'type': 'category',
  'label': 'Category B',
  'itemIf': 'B'
}, {
  'type': 'question',
  'parentCategory': 'A',
  'label': 'Category A Question 1?',
  'itemIf': 'A1'
}, {
  'type': 'question',
  'parentCategory': 'A',
  'label': 'Category A Question 2?',
  'itemIf': 'A2'
}, {
  'type': 'question',
  'parentCategory': 'B',
  'label': 'Category B Question 1?',
  'itemIf': 'B1'
}, {
  'type': 'question',
  'parentCategory': 'B',
  'label': 'Category B Question 2?',
  'itemIf': 'B2'
}];

var chalk = require('chalk');

cases.forEach(function (case_) {
  console.log(chalk.white.bold('----------'));
  console.log(chalk.white.bold('----------'));
  console.log(chalk.white.bold('INPUT:'), case_);
  var parsed = TariffPSR.parse(case_, template, { hscode: '12345678' });
  console.log(chalk.white.bold('DUMPED:'), parsed.dump());
  // console.log(chalk.white.bold('TREE:'), JSON.stringify(parsed.tree, null, 2));

  console.log();

  parsed.categories.forEach(function (category) {
    console.log(chalk.white.bold('CATEGORY:'), category.itemIf, category.label);
    category.details && console.log('DETAILS:', category.itemIf, category.details);
    category.questions.forEach(function (question) {
      console.log(' ', chalk.white.bold('Question'), question.itemIf);
      console.log(' ', 'label:', question.label);
      question.conditions && console.log(' ', 'conditions:', question.conditions);
      question.details && console.log(' ', 'details:', question.details);
      console.log(' ');
    });
  });
});