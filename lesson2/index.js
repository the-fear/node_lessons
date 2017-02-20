/*
 * Игра орел-решка
 */
'use strict';

const readline = require('readline');
const util = require('util');
const colors = require('colors');

const rl = readline.Interface({
    input: process.stdin,
    output: process.stdout
});

const good_bye = 'Good bye!'.bold.yellow;


const game = () => {
    let is_started = false;
    return function game() {
        if (!is_started) {
            console.log('\nHello, my fellow player! Let\'s begin the game! \nI\'ll flip a coin, you\'ll need to guess the result.'.blue.bold);
            console.log('When you get bored of this wanderful game, just hit Ctrl+C or type \'bored\'\n'.yellow);
        }
        is_started = true;
        rl.question('Heads or tails? (h/t/bored) ', answer => {
            if (!answer) {
                console.log('Do you really think that the coin cannot touch the ground? It really can. Type the answer or I\'ll multipy the world by zero!'.red.bold);
                game();
                return;
            }
            if (answer.toLowerCase() === 'bored') {
                console.log(good_bye);
                rl.close();
                return;
            }
            answer = answer[0].toLowerCase();
            if (answer !== 'h' && answer !== 't') {
                console.log('You probably think that the coin has more than two faces. You are wrong.\n'.red.bold);
                game();
                return;
            }
            let coin = Math.floor(Math.random() * 2) ? 'h' : 't';
            if (coin === answer) {
                console.log('You win this time!\n'.bold.green);
            } else {
                console.log('You lose! Ha-ha!\n'.bold.green);
            }
            game();
        });
    };
};
game()();
rl.on('line', game());

rl.on('SIGINT', () => {
    console.log(good_bye);
    rl.close();
});

module.exports = game;
