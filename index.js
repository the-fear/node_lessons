'use strict';
const minimist = require('minimist')(process.argv.slice(2));
const fs = require('fs');

const help = () => {
    console.log(`
General usage:
    
    node index.js --game coin
    node index.js --game coin --log coin.log
    node index.js --game blackjack --bank=100 --log coin.log
    node index.js --view-log coin.log
    
    Options:
--help          this help
--log           file for storing game logs. If the file does not exist, then it will be created. Logging is turned off if this option is not present.
--game          choose game: BlackJack or Coin.
--bank=VALUE    for BlackJack only. Startup capital. If not specified, VALUE=100.
--packs=VALUE   for BlackJack only. Number of packs of cards. Default value 1.
--view-log      log file to view
`);
};
minimist.length = function () {
    let result = 0;
    for (let key in this){
        if (!this.hasOwnProperty(key) || key === 'length'){
            continue;
        }
        result += 1;
    }
    return result;
};
/**
 * Returns true if the entire input value is a valid number or float.
 * @example 
 * isNumber('123') // true <br>
 * isNumber('123foo') // false <br>
 * isNumber('123.45') // true <br>
 * @param {*} num Any type
 * @returns {Boolean} Remember, the function returns true if input is both '123' or 123
 */
function isNumber(num){
    return !isNaN(num) && isFinite(num);
}

const blackJackSettings = {
    packs: 1,
    bank: 100
}
let logFile = '', game;

if (minimist.help) {
    help();
    process.exit(0);
}
if (minimist['view-log'] && minimist['view-log'] !== true){
    let buff = fs.readFileSync(minimist['view-log']);
    console.log(buff.toString());
    process.exit(0);
} else if (minimist['view-log'] === true) {
    console.log('Log file is not specified.');
    process.exit(1);
}
if (minimist.log && minimist.log !== true) {
    logFile = minimist.log;
}
if (minimist.packs && minimist.packs !== true){
    if (isNumber(minimist.packs)){
        blackJackSettings.packs = parseInt(minimist.packs);
    }
}
if (minimist.bank && minimist.bank !== true){
    if (isNumber(minimist.bank)){
        blackJackSettings.bank = parseInt(minimist.bank);
    }
}

if (minimist.game && minimist.game !== true) {
    switch (minimist.game.toLowerCase()) {
        case 'coin':
            game = require('./lesson2');
            game(logFile);
            break;
        case 'blackjack':
            game = require('./blackjack/');
            game(blackJackSettings);
//            console.log('This game is not implemented yet\n');
//            process.exit(1);
            break;
        default:
            console.log('Unknown game. Did you mean Coin?\n');
            process.exit(1);
            break;
    }
} else if (minimist.game === true) {
    console.log('Game to load is not specified.');
    process.exit(1);
}

if (minimist.length() === 1){
    help();
} else if (!game) {
    throw Error('Something weird has happened...');
}

//game(filename, bank);
