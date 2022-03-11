//IMPORTING BLOCKCHAIN AND TRANSACTION MODULES
const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

//initialize key
const myKey = ec.keyFromPrivate('375fc90d6d8e9558596f270f084b8bf6f22e639708ce09a7955a98bd48fb4f8d');
const myWalletAddy = myKey.getPublic('hex');

//TEST CODE
let dragonCoin = new Blockchain();

//add transaction
/*in reality "public key goes here" would be an address receiving the tokens*/
const tx1 = new Transaction(myWalletAddy, 'public key goes here', 12);
tx1.signTransaction(myKey);
dragonCoin.addTransaction(tx1);

//start miner to actually create a block for transactions otherwise they remain pending
console.log('\n Starting the miner');
dragonCoin.minePendingTransactions(myWalletAddy);

//check balance
console.log('\nBalance of User =', dragonCoin.getBalanceOfAddress(myWalletAddy));

console.log('Is chain valid?', dragonCoin.isChainValid());

//cause chain to be invalid
dragonCoin.chain[1].transactions[0].amount = 1;

/*
TEST CODE
adding blocks to the chain
console.log("Mining block first block...");
dragonCoin.addBlock(new Block(1, "10/05/2022", {amount : 4}));

console.log("Mining block second block...");
dragonCoin.addBlock(new Block(2, "12/05/2022", {amount : 12}));

console.log("Mining block third block...");
dragonCoin.addBlock(new Block(3, "09/05/2022", {amount : 100}));

console.log('Is blockchain valid? ' + dragonCoin.isChainValid()); //running method to validate chain

attempting to tamper with blocks on the chain
dragonCoin.chain[1].data = {amount : 100};
dragonCoin.chain[1].hash = dragonCoin.chain[1].calculateHash();

console.log('Is blockchain valid? ' + dragonCoin.isChainValid()); //running method to validate chain 

displaying the blocks in the chain
console.log(JSON.stringify(dragonCoin, null, 4));
*/