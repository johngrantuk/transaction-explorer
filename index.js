const Web3 = require('web3');
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

async function checkTxs() {

  let web3 = new Web3('https://dai.poa.network/');
  let lastBlockChecked = 0;
  let currentBlockNo;
  let transactions = [];

  console.log('Connecting to db...')
  const client = await pool.connect()
  console.log('Ok')

  // INSERT INTO accounts (account) SELECT 'testingAccount' WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE account='testingAccount') RETURNING *;
  const text = 'INSERT INTO accounts (account) SELECT $1 WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE account=$1) RETURNING *;'

  /*
  let txTest = await web3.eth.getTransaction('0x9fff66e0487f665cb380bebca35ce344ca7e5bb7955205f690ce9414dedd7616');
  // console.log(txTest)

  console.log(web3.utils.fromWei("" + txTest.gas, "Gwei"));
  console.log(web3.utils.fromWei("" + txTest.gasPrice, "Gwei"));


  if(web3.utils.fromWei("" + txTest.gasPrice, "Gwei") == 1.1){
    console.log("!!!!!!!!!!!!!!!!! burner ???????????????");
    try {
      const res = await pool.query(text, [txTest.from]);
      console.log(res.rows[0])
      // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
    } catch(err) {
      console.log(err.stack)
    }
  }
  */


  while(true){

    try{
      currentBlockNo = await web3.eth.getBlockNumber();
      // console.log('Current block no: ' + currentBlockNo);

      if(lastBlockChecked != currentBlockNo){
        console.log('Checking block...');
        let block = await web3.eth.getBlock(currentBlockNo);
        let transactions = block.transactions;
        let updatedTxs = false;

        if(transactions.length > 0){
          console.log("transactions");
          console.log(transactions);
          for(let t in transactions){
            console.log("Transaction: " + transactions[t]);
            let tx = await web3.eth.getTransaction(transactions[t]);
            if(tx.to && tx.from){
              let smallerTx = {
                hash: tx.hash,
                to: tx.to.toLowerCase(),
                from: tx.from.toLowerCase(),
                value: web3.utils.fromWei("" + tx.value, "ether"),
                blockNumber: tx.blockNumber,
                gas: web3.utils.fromWei("" + tx.gas, "Gwei"),
                gasPrice: web3.utils.fromWei("" + tx.gasPrice, "Gwei"),
              }

              console.log(tx.gasPrice);
              console.log(smallerTx);

              if(smallerTx.gasPrice == 1.1){
                console.log("??????? burner account ???????????????");
                try {
                  const res = await pool.query(text, [smallerTx.from]);
                  console.log(res.rows[0])
                  // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
                } catch(err) {
                  console.log('!!!!!!!!!!!!!! DB ERROR !!!!!!!!!!!!!!!!!!!!!!!');
                  console.log(err.stack);
                  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                }
              }
            }
          }
        }

        lastBlockChecked = currentBlockNo;
      // return {recentTxs,updatedTxs}

      }else{
        // console.log('Not updating block.')
      }

    }
    catch(err) {
      console.log('!!!!!!!!!!!!!! MAIN LOOP ERROR !!!!!!!!!!!!!!!!!!!!!!!');
      console.log(err.stack);
      console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    }
  }
}

console.log('Starting...');

var info = checkTxs();
