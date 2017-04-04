const fs = require('fs');
const path = require('path')

const regexpHell = () => {
  const promise = new Promise((resolve, reject) => {
  return fs.readFile(path.resolve(__dirname, '../package.json'), (err, buff) => {
      if (err) {
        reject(err);
      }
      let res = buff.toString();
      resolve(res);
    })
  });
  return promise;
};

module.exports = regexpHell()
