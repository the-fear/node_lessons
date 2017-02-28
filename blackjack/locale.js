/* 
* I know that this module is unnecessery here. 
* Moreover, stuff that is done by this module should be somewhere else.
* But... I feel lazy to force myself to fix this.
* So I've decided to leave it as is.
* But I solemnly swear I won't do this in production!
*/
require('colors');

/* game state, nothing else */
let gameState;

/**
 * @param {object} state Game state object to make this module be able to use game locale settings 
 * @returns {object} The localisation object, containing all the messages in the gabe (except errors)
 */
module.exports = state => {

    if (typeof state !== 'object'){
        throw Error('Type of variable state is not an object: ' + typeof state);
    }
    gameState = state;

    return {

        /** Available locales */
        locales: [
            'en',
            'ru'
        ],

        /** Checks if the given locale is supported by the game */
        supports(locale) {
            if (this.locales.includes(locale)) {
                return true;
            }
            return false;
        },

        /**
         * Combines the message string with the given string delimiters,
         * or values that can be parsed as a string,
         * that are inserted between message pieces.
         * @param {String} messageName
         * @param {String[]} args
         */
        combine(messageName, args) {
            if (!messageName || !args) {
                throw Error('All the two parameters must be specified. And they mustn\'t be == false');
            }
            if (typeof messageName !== 'string') {
                throw Error('Input message is not a type of string: ' + typeof messageName);
            }
            if (!(args instanceof Array)) {
                throw Error('The second parameter must be an array');
            }
            return this[messageName][gameState.locale].map((value, index) => {
                if (typeof value !== 'string' && !value.toString) {
                    throw Error('Parameter cannot be transformed into a string');
                }
                return value + (args[index] ? args[index] : '');
            }).join('');
        },

        /* The following properties contain messages, that are used in the game */
        emptyBank: {
            en: 'You need to specify your startup capital to play this game. Aborted.'.bold.red,
            ru: 'Для начала игры нужно указать размер банка игрока. Завершено.'.bold.red
        },
        greeting: {
            en: 'Hello, fellow player! We\'re glad to see you here. Got some money? So let\'s begin!'.blue.bold,
            ru: 'Здравструй, дорогой игрок! Рад видеть тебя здесь. Раздобыл немного деньжат? Ну тогда давай сыграем!'.blue.bold
        },
        askForDeal: {
            en: 'Do you want me to deal? (Y/n) ',
            ru: 'Еще карту? (Y/n) '
        },
        blackjack: {
            en: 'BlackJack!!!',
            ru: 'Блэкджек!!!'
        },
        getPrizeNow: {
            en: `Are you ready to get your prize 1:1 now or, if you aren't, wait to win 3:2! (g/W) `,
            ru: `Заберешь выигрыш сейчас 1:1 или подождешь и выиграешь 3:2? (g - забрать/ Enter - ждать)`
        },
        dontUnerstand: {
            en: `I didn't get you. Type correctly.`.bold.red,
            ru: `Я тебя не понял. Повтори.`.bold.red
        },
        wrongMoney: {
            en: 'The answer is not a valid amount of money: '.bold.red,
            ru: 'Какая-то неправильная сумма: '.bold.red
        },
        notEnoughMoney: {
            en: `You've got not enough money to place this bet.`.bold.red,
            ru: `Недостаточно денег для такой ставки.`.bold.red
        },
        emptyBet: {
            en: 'You cannot play without placing bets.'.bold.red,
            ru: 'Ты не можешь играть без ставок!'.bold.red
        },
        bankrupt: {
            en: 'You are a bankrupt. Welcome back when you get enough money to play this game.'.bold.red,
            ru: 'Ты банкрот. Возвращайся, когда подкопишь еще деньжат. С тобой приятно иметь дело'.bold.red
        },
        push: {
            en: [
                'Push! your bet has been returned. Your bank: $'
            ],
            ru: [
                'Пуш! Твоя ставка возвращена в банк. Твой банк теперь: $'
            ]
        },
        playerWins: {
            en: [
                'You win! Your prize: $',
                '. Bank: $'
            ],
            ru: [
                'Ты победил! Твой выигрыш составил $',
                '. Банк: '
            ]
        },
        dealerWins: {
            en: [
                '',
                ' wins! You bank: $'
            ],
            ru: [
                '',
                ' выиграл! Твой банк теперь: $'
            ]
        },
        dealerCards: {
            en: [
                'Dealer\'s cards: ',
                ', score: ',
                ';'
            ],
            ru: [
                'Карты дилера: ',
                ', очки: ',
                ';'
            ]
        },
        playerCards: {
            en: [
                'Player\'s cards: ',
                ', score: ',
                ';'
            ],
            ru: [
                'Твои карты: ',
                ', очки: ',
                ';'
            ]
        },
        askLastBet: {
            en: [
                'Your last bet is $',
                '. Would you like to place the same bet this time? (Enter/123) '
            ],
            ru: [
                'Твоя последняя ставка $',
                '. Хочешь оставить ее? (да - Enter/ нет - сумма) '
            ]
        },
        askBet: {
            en: [
                'You\'ve got $',
                '. Place your bets. (sum) '
            ],
            ru: [
                'У тебя $',
                '. Делай ставку. (сумма) '
            ]
        },
        goodbye: {
            en: 'Good bye! See you soon!',
            ru: 'Всего хорошего! Деньги будут, заходи!'
        }
    };
};