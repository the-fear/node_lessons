'use strict';
const fs = require('fs');
const chalk = require('chalk');
const path = require('path')
const util = require('util')

const regexpHell = () => {
  const promise = new Promise((resolve, reject) => {
  return fs.readFile(path.resolve(__dirname, '../package.json'), (err, buff) => {
      if (err) {
        reject(err);
      }
      // console.error(args)
      let res = buff.toString();
      resolve(res);
    })
  });
  return promise;
};

// console.log(regexpHell())

module.exports = regexpHell()






            /*
вставить после 17 строки
             * Ниже безуспешные попытки справиться с регулярками. Дошло, что управляющие
             * последовательности ASCII сильно смахивают на символ юникода с "хвостиком"
             * но развить "успех" не успел.
             */
//    res = res.replace(/([\d\w]m\s)!([:\s]*)(".*")$/gmi, '$1' + chalk.yellow('$2'));
//    res = res.replace(/(\[\d+m)(\s*".*?")(,?)$/gmi, '$1' + chalk.yellow('$2') + '$3');
//    reg = /(".*")\n/gmi;
//    console.log(reg.exec(res));