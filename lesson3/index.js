const url = require('url');
const request = require('request');
const cheerio = require('cheerio');
const mailer = require('nodemailer');

const yandexAPIAuthKey = 'trnsl.1.1.20170301T113929Z.3f26774d7ba88706.d3faf698ef7ddc3ae29fc07a2fff8294cbbc7417';

/**
 * @param {String} action Which action you'd like to run
 * @param {Object} mail   A mail data object, containing such fields as from, to, subject etc.
 * @param {Object} transport  An object to be used as a settings object when creating a mail transporter
 * @param {String} text A string to be translated
 */
module.exports = function ({
    action: action,
    mail: mail,
    transport: transport,
    text: text,
    lang: lang
}) {

    const webRoot = 'http://localhost:8080';

    /** Chooses which action to take, depending on the given... action... ahem... */
    switch (action) {
    case 'news':
        news()
            .then(parseNews)
            .then(showNews);
        break;

    case 'mail':
        sendMail()
            .then(response => console.log(response))
            .catch(reject => console.log(reject));
        break;
    case 'translate':
        translate()
            .then(showTranslate)
            .catch(reject => console.log(reject));
        break;

    default:
        throw Error(`${action} is not supported by this sctipt`);
    }

    function showTranslate(translate) {
        console.log(`${text} => ${translate.text.join('')}`);
    }
    function translate() {
        text = typeof text === 'string' ? text : text.toString();

        const options = Object.assign(new url.Url, {
            protocol: 'https:',
            host: 'translate.yandex.net',
            pathname: '/api/v1.5/tr.json/translate',
            query: {
                key: yandexAPIAuthKey,
                lang: lang,
                format: 'text',
                text: text
            }
        });
        let urlString = options.format();

        return new Promise((resolve, reject) => {
            request({ url: urlString, json: true }, (err, resp, body) => {
                if (err) {
                    reject(err);
                }
                if (resp.statusCode !== 200) {
                    reject(new Error(`${resp.statusMessage}: ${resp.statusCode};\n${urlString}`));
                }
                resolve(body);
            });
        });
    }

    /**
     * Tries to send a given message using given settings
     */
    function sendMail() {

        const requirementsMail = ['from', 'to'];
        const requirementsTransport = ['auth', 'service'];

        checkObj(mail, requirementsMail);
        checkObj(transport, requirementsTransport);

        return mailer.createTransport(transport)
            .sendMail(mail);

        /**
         * Checks if the given object satisfies certian requirements
         * @prop {Object} obj
         * @prop {String[]} pattern Array of strings corresponding to the given object's fields
         */
        function checkObj(obj, pattern) {
            const objKeys = Object.keys(obj);
            Array.prototype.forEach.call(pattern, v => {
                if (!~objKeys.indexOf(v)) {
                    throw new Error('Input mail object does not contain all the required fields');
                }
            });
        }
    }

    /**
     * Requests the front page of gazeta.ru
     * @returns {Promise}
     */
    function news() {
        return new Promise((resolve, reject) => {
            request(webRoot, function (err, resp, body) {
                if (!err && resp.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(err);
                }
            });
        });
    }

    /**
     *  Looks for the specific code blocks in the input code and extracts data from them
     *  @param {String} body
     *  @returns {Object[]}
     */
    function parseNews(body) {
        const $ = cheerio.load(body);
        let articles = [];
        $('#news_lenta .sausage-list-item.news_title').each((index, elem) => {
            let news = {};
            news.title = $(elem).first().find('[itemprop=headline]').text().replace(/\n/g, '');
            news.time = $(elem).first().find('time').text().trim();
            news.href = $(elem).first().find('a').attr('href');
            articles.push(news);
        });
        return articles;
    }

    /**
     *  Show news' time, titles and links in terminal
     *  @param {Object[]} arr
     */
    function showNews(arr) {
        arr.forEach((v) => {
            console.log(`${v.time}: ${v.title}.\n${webRoot}${v.href}`);
        });
    }
};

// module.exports({
//     action: 'news'
// });

// module.exports({
//     action: 'mail',
//     mail: {
//         from: '********************',
//         to: '*********************',
//         // subject: 'Test message',
//         // text: 'Just a text message'
//     },
//     transport: {
//         service: 'Yandex',
//         auth: {
//             user: '************',
//             pass: '************'
//         }
//     }
// });

// module.exports({
//     action: 'translate',
//     text: 'Hello, world!!!',
//     lang: 'en-ru'
// });