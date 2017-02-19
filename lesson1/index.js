'use strict';
const fs = require('fs');
const chalk = require('chalk');

const regexpHell = () => {
    const promise = new Promise((resolve, reject) => {

        fs.readFile('package.json', function (err, buff) {
            if (err) {
                reject(err);
            }
            /** @var {string} str */
            var str = buff.toString(),
                    res = str.replace(/^\s*"[\w\d-]+":/gmi, chalk.blue('$&'));
            res = res.replace(/[{}]+/gm, chalk.yellow('$&'));
            res = res.replace(/^\s*"[\w\d]+"/gmi, chalk.cyan('$&'));
            res = res.replace(/[\]\[](?!\d)/gm, chalk.yellow('$&'));
            /*
             * Ниже безуспешные попытки справиться с регулярками. Дошло, что управляющие
             * последовательности ASCII сильно смахивают на символ юникода с "хвостиком"
             * но развить "успех" не успел.
             */
//    res = res.replace(/([\d\w]m\s)!([:\s]*)(".*")$/gmi, '$1' + chalk.yellow('$2'));
//    res = res.replace(/(\[\d+m)(\s*".*?")(,?)$/gmi, '$1' + chalk.yellow('$2') + '$3');
//    reg = /(".*")\n/gmi;
//    console.log(reg.exec(res));
            resolve(res);
        });
    });
    return promise;
};
regexpHell().then(result => {
//    console.log(result);
    module.exports = {result: result};
    console.log(module);
}, () => {
    module.exports = 'Error opening the file';
});