/*
 * Игра орел-решка
 */
'use strict';

const readline = require('readline');
const util = require('util');
const colors = require('colors');
const fs = require('fs');
const EventEmitter = require('events');

const roundEnd = new EventEmitter;

const rl = readline.Interface({
    input: process.stdin,
    output: process.stdout
});

const good_bye = 'Good bye!'.bold.yellow;

const checkFileName = filename => {
    if (typeof filename !== 'string') {
        return false;
    }
    return filename;
};

module.exports = ({logFile:filename} = {filename:''}) => {

    filename = checkFileName(filename);

    fs.open(filename, 'a', (err, fd) => {
        let file;
        if (!err) {
            file = fs.write;
        } else {
            file = () => {
            };
        }
        let is_started = false;
        const game = () => {
            return function game() {
                if (!is_started) {
                    console.log('\nHello, my fellow player! Let\'s begin the game! \nI\'ll flip a coin, you\'ll need to guess the result.'.blue.bold);
                    console.log('When you get bored of this wanderful game, just hit Ctrl+C or type \'bored\'\n'.yellow);
                    file(fd, `\n${Date()} Start the game\n`);
                }
                is_started = true;
                rl.question('Heads or tails? (h/t/bored) ', answer => {
                    let date = '';
                    if (!err) {
                        date = Date();
                    }
                    if (!answer) {
                        console.log('Do you really think that the coin cannot touch the ground? It really can. Type the answer or I\'ll multipy the world by zero!'.red.bold);
                        roundEnd.emit('end');
                        file(fd, date + ' Empty string\n');
                        return;
                    }
                    if (answer.toLowerCase() === 'bored') {
                        console.log(good_bye);
                        rl.close();
                        file(fd, date + ' End of the game (player thinks it\'s boring)\n');
                        return;
                    }
                    answer = answer[0].toLowerCase();
                    if (answer !== 'h' && answer !== 't') {
                        console.log('You probably think that the coin has more than two faces. You are wrong.\n'.red.bold);
                        roundEnd.emit('end');
                        file(fd, date + ' Player mistyped\n');
                        return;
                    }
                    let coin = Math.floor(Math.random() * 2) ? 'h' : 't';
                    if (coin === answer) {
                        console.log('You win this time!\n'.bold.green);
                        file(fd, date + ' Player won (by accident)\n');
                    } else {
                        console.log('You lose! Ha-ha!\n'.bold.yellow);
                        file(fd, date + ' Player lost (as planned)\n');
                    }
                    roundEnd.emit('end');
                });
            };
        };

        roundEnd.on('end', game());

        rl.on('SIGINT', () => {
            console.log(good_bye);
            rl.close();
            file(fd, Date() + ' Closed with SIGINT\n');

        });

        roundEnd.emit('end');
    });
};
