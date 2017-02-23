/* global Infinity */

const readline = require('readline');
const Emit = require('events');
const colors = require('colors');
const rl = readline.Interface({
    input: process.stdin,
    output: process.stdout
});
rl.pause();
const event = new Emit;
/**
 * The father of all cards in this game
 */
const Card = {
    suit: '',
    score: 0,
    card: ''
};
/**
 * @class Player is the core class for the players. Contains everything related to them.
 */
class Player {
    constructor(name, bank) {
        this.name = name;
        this.bank = bank;
        /** @member {Card[]} */
        this._cards = [];
        this.score = 0;
        this.cardsAsString = '';
    }
    get cards() {
        return this._cards;
    }
    set cards(card) {
        if (Card.isPrototypeOf(card)) {
            this._cards.push(card);
            this.cardsAsString = this._cardsToString();
            this.score = this._countScore(this._cards);
        }
    }
    /**
     * Resets player's state between games
     * @returns {undefined}
     */
    resetState() {
        this.score = 0;
        this._cards = [];
        this.cardsAsString = '';
    }
    /**
     * Converts the array of the player's cards into a string.
     * Is used when displaing player's state.
     * @returns {String}
     */
    _cardsToString() {
        let result = [];
        for (let i = 0, max = this.cards.length; i < max; i++) {
            result.push(this.cards[i].card);
        }
        return result.join(', ') + '.';
    }
    /**
     * Calculates current player's score
     * @param {Card[]} arr
     * @returns {Number|Boolean}
     */
    _countScore(arr) {
        let max = arr.length, score = 0, aces = 0;
        for (let i = 0; i < max; i++) {
            if (!Card.isPrototypeOf(arr[i])) {
                return false;
            }
            if (arr[i].card === 'A') {
                aces++;
            }
            score += arr[i].score;
        }
        while (score > 21 && aces) {
            aces--;
            score -= 10;
        }
        return score;
    }
}
const player = new Player('Player', 0);
player.lastBet = 0;
const dealer = new Player('Dealer', Infinity);
/**
 * Shoe. Just a dealer's shoe.
 */
const shoe = {
    _numberOfPacks: 0,
    _cards: [],
    _desk: {
        range: {
            A: 11,
            2: 2,
            3: 3,
            4: 4,
            5: 5,
            6: 6,
            7: 7,
            8: 8,
            9: 9,
            10: 10,
            J: 10,
            Q: 10,
            K: 10
        },
        suits: ['diamonds', 'spades', 'clubs', 'hearts']
    },
    /**
     * gets number of packs of cards
     * @returns {Number}
     */
    get numberOfPacks() {
        return this._numberOfPacks;
    },
    /**
     * sets the number of packs of cards. will be rechecked and might be 
     * corrected on refresh()
     * @param {number} value number of packs of cards
     * @returns {undefined}
     */
    set numberOfPacks(value) {
        if (this._numberOfPacks) {
            return;
        }
        let temp = parseInt(value);
        if (!isNaN(temp)) {
            this._numberOfPacks = temp;
        } else {
            this._numberOfPacks = 1;
        }
    },
    /**
     * Returns a card or false if the shoe is empty
     * @returns {Card|Boolean}
     */
    get card() {
        if (!this._cards.length) {
            console.log(this._cards);
            return false;
        }
        return this._cards.pop();
    },
    /**
     * Checks if the current state of the shoe is acceptable for continuing game
     * @returns {Boolean}
     */
    isValid: function () {
        if (this._cards.length < this._numberOfPacks * 52 / 3 || this._numberOfPacks < 1) {
            return false;
        }
        return true;
    },
    /**
     * Refreshes the shoe. This means that old cards are thrown away, new cards
     * are combined and shuffled. This doesn't controll cards stored on players' hands
     * @returns {undefined}
     */
    refresh: function () {
        this._cards = [];
        let result = [];
        this._numberOfPacks = this._numberOfPacks > 8 ? 8 : this._numberOfPacks;
        for (let i = 0, max = this._desk.suits.length; i < max; i++) {
            for (let j in this._desk.range) {
                let card = Object.create(Card);
                card.suit = this._desk.suits[i];
                card.score = this._desk.range[j];
                card.card = j;
                result.push(card);
            }
        }
        for (let i = 0; i < this._numberOfPacks - 1; i++) {
            result = result.concat(result);
        }
        this._shuffle(result);
        this._cards = result;
    },
    /**
     * Suffles the cards in the shoe
     * @param {Card[]} arr Cards
     * @returns {Card[]} 
     */
    _shuffle: function (arr) {
        if (!(arr instanceof Array)) {
            return false;
        }
        for (let i = arr.length; i; i--) {
            let rand = Math.floor(Math.random() * i);
            [arr[i - 1], arr[rand]] = [arr[rand], arr[i - 1]];
        }
        return arr;
    },
    /**
     * Initiates the shoe.
     * @param {Number|undefined} numberOfPacks
     * @returns {undefined}
     */
    init: function (numberOfPacks = 1) {
        if (this.isValid()) {
            return;
        }
        this._numberOfPacks = numberOfPacks ? numberOfPacks : 1;
        this.refresh();
    }
};
/**
 * Stores global game state
 */
const gameState = {
    started: false,
    turn: false
};

/**
 * The game itself.
 * @param {null|Number} bank Player's bank
 * @param {number} packNumber Packs of cards quantity
 * @returns {undefined}
 */
function game( {bank:bank, packs:packNumber} = {bank: null, packNumber: 1}) {   // player's bank, packs number
    let winner, bet, prizeRate = 1;
    /**
     * Preparations in the very beginning of the game. A welcome message, initial
     * dealing, asking for making first bets
     */
    (function () {
        if (!gameState.started) {
            if (bank && isNumber(bank)) {
                player.bank = parseInt(bank);
            } else {
                console.log('You need to specify your startup capital to play this game. Aborted.'.bold.red);
                rl.close();
                return;
            }
            console.log('Hello, fellow player! We\'re glad to see you here. Got some money? So let\'s begin!'.blue.bold);
            gameState.started = true;
            shoe.numberOfPacks = packNumber;
        }

        if (shoe.numberOfPacks === 1) {
            shoe.refresh();
        }

        if (!shoe.isValid()) {
            shoe.refresh();
        }
        resetState();           // сброс состояния игры
        shoe.init();          // подготовка шуза
        dealPlayer(2);
        dealDealer();
        event.emit('start', placeBets);
    })();
    /**
     * Asks the Player for being dealed. I rejected, deals for Dealer and gives
     * control to the endGame module
     */
    function askForDeal() {
        rl.question('Do you want me to deal? (Y/n) ', answer => {
            rl.pause();

            answer = answer.toLowerCase();
            if (answer[0] === 'y' || answer === '') {
                dealPlayer();
                event.emit('start', deal);
            } else {
                dealDealer(true);
                event.emit('start', endGame);
            }
        });
    }
    /**
     * Main controller block. All the game happenes here. 
     */
    function deal() {
        showStatus();
        if (player.score < 21) {
            askForDeal();
            return;
        } else if (player.score === 21 && player.cards.length === 2) { // check for blackjack
            console.log('BlackJack!!!');
            if (dealer.score >= 10) {
                const message = `Are you ready to get your prize 1:1 now or, if you aren't, wait to win 3:2! (g/W) `;
                rl.question(message, answer => {
                    const error = `I didn't get you. Type correctly.`.bold.red;
                    answer = answer.toLowerCase();
                    if (answer[0] === 'w' || answer === '') {
                        prizeRate = 1.5;
                        dealDealer(true);
                        event.emit('start', endGame);
                    } else if (answer[0] === 'g') {
                        event.emit('start', endGame);
                    } else {
                        event.emit('error', error, deal);
                    }
                });
            } else {
                prizeRate = 1.5;
                event.emit('start', endGame);
            }
            return;
        } else if (player.score === 21) {
            dealDealer(true);
        }
        event.emit('start', endGame);
    }
    /**
     * Deals cards to the player.
     * @param {Number} count Deals as many cards as specified by this parameter
     * @returns {undefined}
     */
    function dealPlayer(count = 1) {
        while (count--) {
            player.cards = shoe.card;
    }
    }
    /**
     * Deals cards to the dealer.
     * @param {Boolean} until17 If true, deals untid dealer's score reaches 17 or more
     * @returns {undefined}
     */
    function dealDealer(until17 = false) {
        if (!until17) {
            dealer.cards = shoe.card;
        } else {
            while (dealer.score < 17) {
                dealer.cards = shoe.card;
            }
    }
    }
    /**
     * Dropt all data to the default state between games, escept Player's bank and the shoe
     */
    function resetState() {
        player.resetState();
        dealer.resetState();
        gameState.turn = false;
        prizeRate = 1;
        bet = 0;
    }
    /**
     * Asks user for placing bets and is placing them.
     */
    function placeBets() {
        const wrongValue = 'The answer is not a valid amount of money: '.bold.red;
        const notEnoughMoney = 'You\'ve got not enough money to place this bet.'.bold.red;
        const emptyBet = 'You cannot play without placing bets.'.bold.red;
        let repeat = false, message;
        if (player.lastBet && player.lastBet <= player.bank) {
            message = `Your last bet is \$${player.lastBet}. Would you like to place the same bet this time? (Enter/123) `;
            repeat = true;
        } else {
            message = `You've got \$${player.bank}. Place your bets. (sum) `;
        }
        rl.question(message, answer => {
            if (repeat) {
                answer = answer.toLowerCase();
                if (answer[0] === 'y' || answer === '') {
                    bet = player.lastBet;
                    player.bank -= bet;
                    event.emit('start', deal);
                    return;
                }
            }
            if (!isNumber(answer)) {
                event.emit('error', wrongValue + answer, placeBets);
                return;
            }
            answer = parseInt(answer);
            if (!answer) {
                event.emit('error', emptyBet, placeBets);
                return;
            }
            if (answer > player.bank) {
                event.emit('error', notEnoughMoney, placeBets);
                return;
            }
            bet = answer;
            player.lastBet = bet;
            player.bank -= bet;
            event.emit('start', deal);
        });
    }
    /**
     * Returns true if the entire input value is a valid number or float.
     * @param {*} num Any type to be checked
     */
    function isNumber(num) {
        return !isNaN(num) && isFinite(num);
    }
    /**
     * Checks Player for being a bankrupt
     * @returns {Boolean}
     */
    function isBankrupt() {
        if (player.bank <= 0) {
            console.log('You are a bankrupt. Welcome back when you get enough money to play this game.'.bold.red);
            return true;
        }
        return false;
    }
    /**
     * shows players' status in console
     */
    function showStatus() {
        console.log(`Player's cards ${player.cardsAsString}, score ${player.score};`);
        console.log(`Dealer's cards ${dealer.cardsAsString}, score ${dealer.score}`);
    }
    /**
     * Finds the winner depending on their scores. Shares functionality with deal() function.
     * Terminates the game when Player becomes a bankrupt.
     * @returns {undefined}
     */
    function endGame() {
        if (player.score > 21 && dealer.score > 21) {
            event.emit('error', '', function () {
                throw Error(`Error: player score: ${player.score}, deales score: ${dealer.score}`);
            });
        }
        if (player.score === dealer.score) {
            winner = null;
        } else if (player.score < dealer.score && dealer.score <= 21) {
            winner = dealer;
        } else if (player.score > dealer.score && player.score <= 21) {
            winner = player;
        } else if (player.score > 21) {
            winner = dealer;
        } else if (dealer.score > 21) {
            winner = player;
        }
        win();
        resetState();
        if (isBankrupt()) {
            return;
        }
        event.emit('start', game);
        return;
        /**
         * Tells user about the winner, distributes game currency
         * @returns {undefined}
         */
        function win() {
            if (!winner) {
                player.bank += bet;
                console.log(`Push! ${player.name}'s bet has been returned. ${player.name}'s bank: \$${player.bank}`.bold);
                showStatus();
                return;
            }
            let prize = bet * prizeRate;
            winner.bank += (prize + bet);
            showStatus();
            if (winner === player) {
                console.log(`${player.name} wins! ${player.name}'s prize: \$${prize}. Bank: \$${player.bank}`.green.bold);
            } else {
                console.log(`${dealer.name} wins! ${player.name}'s bank: \$${player.bank}`.yellow.bold);
            }
        }
}
}
/**
 * @param {String} error 
 * @param {Function} callback 
 * @param {*} args 
 */
event.on('error', (error, callback, args) => {
    console.log(error);
    callback(args);
});
event.on('start', (callback, args) => {
    callback(args);
});

module.exports = game;
