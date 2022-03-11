const EC = require('elliptic').ec;
const ec = new EC('secp256k1'); // instance of elliptic

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

//DISPLAY KEYS
console.log();
console.log('Private key: ', privateKey);

console.log();
console.log('Public key: ', publicKey);
