const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

//creating a class for Transactions
class Transaction{
    constructor(fromAddy, toAddy, amount){
        this.fromAddy = fromAddy;
        this.toAddy = toAddy;
        this.amount = amount;
    }

    //This hash is used to sign the private key
    calculateHash(){
        return SHA256(this.fromAddy + this.toAddy + this.amount).toString();
    }

    //method to receive a signing key
    signTransaction(signingKey){
        //check if public key = the from Addy
        if(signingKey.getPublic('hex') != this.fromAddy){
            throw new Error('You cannot sign transactions for another wallet');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    //verify if transaction has been signed
    isValid(){
        if(this.fromAddy == null) return true;
        
        if(!this.signature || this.signature.length == 0){
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddy, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

//initializing the block and its properties
class Block{ 
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(){
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty){ //proof of work method
        while(this.hash.substring(0, difficulty) != Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined: " + this.hash);
    }

    //verify all transactions in the block
    hasValidTransaction(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }

        return true;
    }
}


class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 3; //determines the amount of work needed to be done to produce a new block
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock(){ //method to create the first block of the chain
        return new Block(Date.parse("2022-10-03"), [], "0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    //mining method
    minePendingTransactions(miningRewardAddress){
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions);//not possible for something like Bitcoin because of the massive amounts of pending transactions
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)//reward is only given when the next block is mined
        ];
    }

    addTransaction(transaction){

        //check fromAddy and toAddy is filled in
        if(!transaction.fromAddy || !transaction.toAddy){
            throw new Error('Transaction must include from and to address');
        }

        //verify transaction being added is valid
        if(!transaction.isValid()){
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddy == address){
                    balance -= trans.amount;
                }

                if(trans.toAddy == address){
                    balance += trans.amount
                }
            }
        }

        return balance;
    }

    /*
    addBlock(newBlock){ //method that allows the creation of a new block on the chain
        newBlock.previousHash = this.getLatestBlock().hash;
         newBlock.hash = newBlock.calculateHash();
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }*/

    //method to check if hashes are correct and each block links to the previous block and all transactions in current block are valid
    isChainValid(){ 
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(!currentBlock.hasValidTransaction()){
                return false;
            }

            if(currentBlock.hash != currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previousHash != previousBlock.calculateHash){
                return false;
            }
        }
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;