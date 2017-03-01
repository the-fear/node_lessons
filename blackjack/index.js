/* global Infinity */
require('colors');
const readline = require('readline');
const Emit = require('events');

const rl = readline.Interface({
    input: process.stdin,
    output: process.stdout
});

/* This handles alls non-standard events */
const event = new Emit;

/**
 * Stores global game state
 */
const gameState = {
    started: false,
    turn: false,
    locale: '',
    packNumber: 0
};
const message = require('./locale')(gameState);

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

    /**
     * @param {String} name Player's name
     * @param {Number} bank Player's cache
     */
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

    /**
     * @param {Object} card A card to be added to the player's hand
     */
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
        return result.join(', ');
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
        let result = [], pack = [];
        this._numberOfPacks = this._numberOfPacks > 8 ? 8 : this._numberOfPacks;

        /* Creates a pack of cards depending on the _desk description */
        this._desk.suits.forEach((v, index, array) => {
            Object.keys(this._desk.range).forEach(key => {
                let card = Object.create(Card);
                card.suit = array[index];
                card.score = this._desk.range[key];
                card.card = key;
                pack.push(card);
            });
        });

        for (let i = 0, max = this._numberOfPacks; i < max; i++) {
            result = result.concat(pack);
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
 * The game itself.
 * @param {null|Number} bank Player's bank
 * @param {number} packNumber Packs of cards quantity
 * @returns {undefined}
 */
function game({bank: bank, packs: packNumber, lang: locale}) {   // player's bank, packs number
    let winner, bet, prizeRate = 1;

    if (!locale && !gameState.locale){
        gameState.locale = 'en';
    } else if (gameState.locale) {
        locale = gameState.locale;
    } else if (!gameState.locale && locale && message.supports(locale)) {
        gameState.locale = locale;
    } else {
        throw Error(`Locale ${locale} is not supported by this application, or something else happened. Game state ${gameState}`);
    }

    if (!gameState.packNumber && packNumber){

        if (isNumber(packNumber)){
            gameState.packNumber = parseInt(packNumber);
        } else {
            throw Error('Number of packs must be a valid number');
        }
        
    } else if (!gameState.packNumber && !packNumber){
        gameState.packNumber = 1;
    }

    /**
     * Preparations in the very beginning of the game. A welcome message, initial
     * dealing, asking for making first bets
     */
    (function () {
        if (!gameState.started) {

            if (bank && isNumber(bank)) {
                player.bank = parseInt(bank);
            } else {
                console.log(message.emptyBank[locale]);
                process.exit(3);
                return;
            }

            console.log(message.greeting[locale]);
            gameState.started = true;
            shoe.numberOfPacks = packNumber;
        }
        if (shoe.numberOfPacks === 1) {
            shoe.refresh();
        }
        if (!shoe.isValid()) {
            shoe.refresh();
        }

        resetState();
        shoe.init();
        dealPlayer(2);
        dealDealer();

        event.emit('start', placeBets);
    })();
    
    /**
     * Asks the Player for being dealed. I rejected, deals for Dealer and gives
     * control to the endGame module
     */
    function askForDeal() {
        rl.question(message.askForDeal[locale], answer => {
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
            console.log(message.blackjack[locale].green.bold);

            if (dealer.score >= 10) {
                const question = message.getPrizeNow[locale];

                rl.question(question, answer => {
                    const error = message.dontUnerstand[locale];
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

        const wrongMoney = message.wrongMoney[locale];
        const notEnoughMoney = message.notEnoughMoney[locale];
        const emptyBet = message.emptyBet[locale];
        let repeat = false, question;

        if (player.lastBet && player.lastBet <= player.bank) {
            question = message.combine('askLastBet', [player.lastBet], locale);
            repeat = true;
        } else {
            question = message.combine('askBet', [player.bank], locale);
        }

        rl.question(question, answer => {
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
                event.emit('error', wrongMoney + answer, placeBets);
                return;
            }

            answer = parseFloat(answer);
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
            console.log(message.bankrupt[locale]);
            return true;
        }
        return false;
    }

    /**
     * shows players' status in console
     */
    function showStatus() {
        console.log(message.combine('playerCards', [
            player.cardsAsString,
            player.score
        ], locale));
        console.log(message.combine('dealerCards', [
            dealer.cardsAsString,
            dealer.score
        ], locale));
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

        /* Stop the game if the player cannot pay any longer */
        if (isBankrupt()) {
            return;
        }

        event.emit('start', game, {
            bank: null
        });

        return;

        /**
         * Tells user about the winner, distributes game currency
         * @returns {undefined}
         */
        function win() {
            if (!winner) {
                player.bank += bet;
                console.log(message.combine('push', [player.bank], locale).bold);
                showStatus();
                return;
            }
            let prize = bet * prizeRate;
            winner.bank += (prize + bet);
            showStatus();
            if (winner === player) {
                console.log(message.combine('playerWins', [
                    prize,
                    player.bank
                ], locale).green.bold);
            } else {
                console.log(message.combine('dealerWins', [
                    dealer.name,
                    player.bank
                ], locale).yellow.bold);
            }
        }
    }
}

/**
 * It's easy to guess what this event is inteded for
 * @param {String} error
 * @param {Function} callback
 * @param {*} args
 */
event.on('error', (error, callback, args) => {
    console.log(error);
    callback(args);
});

/**
 * Tis event is intended for starting something asynchronously
 */
event.on('start', (callback, args) => {
    callback(args);
});

/** End game on SIGINT (or Ctrl+C) */
rl.on('SIGINT', () => {
    console.log('\n' + message.goodbye[gameState.locale].yellow.bold);
    process.exit(0);
});
module.exports = game;
