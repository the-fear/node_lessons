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
Object.defineProperties(minimist, {
    length: {
        get: function () {
            return Object.keys(this).length + this['_'].length;
        },
        enumerable: false
    },
    '_': {
        enumerable: false
    }
});

const settings = {
    packs: 1,
    bank: 100,
    logFile: ''
};
let moduleToInvoke;

/*
 * Returns true if the entire input value is a valid number or float.
 */
function isNumber(num) {
    return !isNaN(num) && isFinite(num);
}

if (minimist.help || !minimist.length) {
    help();
    process.exit(0);
}

if (minimist['view-log']) {
    let log = minimist['view-log'];
    switch (log) {
        case true:
            console.log('Log file is not specified. Aborted.');
            process.exit(1);
            break;
        default:
            try {
                let buff = fs.readFileSync(log);
                console.log(buff.toString());
                process.exit(0);
            } catch (e) {
                console.log(`No such file or directory: ${log}. Aborted.`);
                process.exit(1);
            }
    }
}

if (minimist.log) {
    switch (minimist.log) {
        case true:
            console.log('Log file is not specified. Aborterd.');
            process.exit(1);
            break;

        default:
            settings.logFile = minimist.log;
            delete (minimist.log);
    }
}

if (minimist.lesson) {
    let lesson = minimist.lesson, str;
    if (lesson === true) {
        console.log('You need to specify the lesson number');
        help();
        process.exit(1);
    }
    str = './lesson' + lesson;
    try {
        moduleToInvoke = require(str);
        console.log(typeof moduleToInvoke, moduleToInvoke);
    } catch (e) {
        console.log('There is no such a module. Did you mistype?');
        process.exit(1);
    }
    delete (minimist.lesson);
} else if (minimist.game) {
    let gameName = (typeof minimist.game === 'string') ? minimist.game.toLowerCase() : moduleToInvoke;
    switch (gameName) {
        case 'coin':
            moduleToInvoke = require('./lesson2');
            break;
        case 'blackjack':
            if (minimist.packs) {
                let packs = minimist.packs;
                packs = isNumber(packs) ? parseInt(packs) : 1;
                settings.packs = packs;
            }
            if (minimist.bank && minimist.bank !== true) {
                let bank = minimist.bank;
                bank = (isNumber(bank) && Boolean.i) ? parseInt(bank) : 100;
                settings.bank = bank;
            }
            moduleToInvoke = require('./blackjack/');
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
    delete (minimist.game);
}

if (minimist.length) {
    console.log('\nUnknown arguments');
    help();
    process.exit(1);
} else if (!moduleToInvoke) {
    console.log(minimist);
    throw Error('Something weird has happened...');
    process.exit(2);
}

moduleToInvoke(settings);

