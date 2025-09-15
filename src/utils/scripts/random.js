/* 
    script to generate random strings and show it in standard output

    command: node ./src/utils/scripts/random.js
*/
const Crypto = require('crypto');

console.log(Crypto.randomBytes(16).toString('base64'));
