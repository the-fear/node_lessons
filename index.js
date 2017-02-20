'use strict';
const minimist = require('minimist')(process.argv.slice(2));
const fs = require('fs');

const help = () => {
    console.log(`
General usage:
    
    node index.js --game coin
    node index.js --game coin --log coin.log
    node index.js --view-log coin.log
    
    Options:
--help          this help
--log           file for storing game logs. If the file does not exist, then it will be created. Logging is turned off if this option is not present.
--game          choose game: BlackJack or Coin (not yet implemented).
--view-log      log file to view
`);
};

let filename = '';
let game;

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
    filename = minimist.log;
}

if (minimist.game && minimist.game !== true) {
    switch (minimist.game.toLowerCase()) {
        case 'coin':
            game = require('./lesson2');
            break;
        case 'blackjack':
//            game = require('./blackjack/');
            console.log('This game is not implemented yet\n');
            process.exit(1);
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

game(filename);
