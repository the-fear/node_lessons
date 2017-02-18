var lesson1 = require('./lesson1/index'),
        fs = require('fs'),
        chalk = require('chalk');
fs.readFile('package.json', function (err, buff) {
    if (err) {
        throw err;
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
    console.log(res);
});

console.log(chalk.blue.bold(lesson1()));

/*
 * Издевательство над строкой, содержащей управляющие последовательности ASCII
 */
//reg = /(\u001b\[\d{2}m)|(\S)/g;
//str = '\u001b[34m  "name":\u001b[39m "node",\n';
//console.log(reg.exec(str));
//console.log(str);
//console.log(str.replace(reg, '_'));