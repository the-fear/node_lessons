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
--lesson=NUMBER is used instead of --game to load the lesson module you need 
`);
};

/**
 * Adds method 'length' to the minimist object to be able to calculate its length
 */
Object.defineProperty(minimist, 'length', {
    value: function () {
        return Object.keys(this).length;
    },
    enumerable: false
});

const blackJackSettings = {
    packs: 1,
    bank: 100
};
let logFile = '', game;

/**
 * Returns true if the entire input value is a valid number or float.
 */
function isNumber(num) {
    return !isNaN(num) && isFinite(num);
}

if (minimist.help) {
    help();
    process.exit(0);
}

if (minimist['view-log']) {
    let log = minimist['view-log'];
    switch (log) {
        case true:
            console.log('Log file is not specified.');
            process.exit(1);
            break;
        default :
        try {
            let buff = fs.readFileSync(log);
            console.log(buff.toString());
            process.exit(0);
        } catch (e) {
            console.log(`No such file or directory: ${log}`);
            process.exit(1);
        }
    }
}
if (minimist.log) {
    switch (log) {
        case true:
            console.log('Log file is not specified. Aborterd.\n')
            process.exit(1);
            break;

        default:
            logFile = minimist.log;
    }
}
if (minimist.packs) {
    let packs = minimist.packs;
    packs = isNumber(packs) ? parseInt(packs) : 1;
    blackJackSettings.packs = packs;
}
if (minimist.bank && minimist.bank !== true) {
    let bank = minimist.bank;
    bank = isNumber(bank) ? parseInt(bank) : 100;
    blackJackSettings.bank = bank;
}

if (minimist.game) {
    let gameName = (typeof minimist.game === 'string') ? minimist.game.toLowerCase() : game;
    switch (gameName) {
        case 'coin':
            game = require('./lesson2');
            game(logFile);
            break;
        case 'blackjack':
            game = require('./blackjack/');
            game(blackJackSettings);
            break;
        case true:
            console.log('Game to load is not specified.');
            process.exit(1);
            break;
        default:
            console.log('Unknown game\n');
            process.exit(1);
            break;
    }
}

if (minimist.length() === 1) {
    help();
} else if (!game) {
    throw Error('Something weird has happened...');
}

//game(filename, bank);
