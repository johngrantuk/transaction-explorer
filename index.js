const Web3 = require('web3');
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://xbaydndxonqipl:8fea1f19de56e5a935cab7b6d9244289fee37f709d1321f68b4ffa6b6efbac6c@ec2-23-21-86-22.compute-1.amazonaws.com:5432/dmt5n9tsrugnj',
  ssl: true
});

async function checkTxs() {

  console.log('StartUp...')
  let web3 = new Web3('https://dai.poa.network/');
  let lastBlockChecked = 0;
  let currentBlockNo;
  let transactions = [];

  console.log('Connecting to db...')
  const client = await pool.connect()
  console.log('Ok')

  //const text = 'INSERT INTO accounts(account) VALUES($1) RETURNING *';
  // https://stackoverflow.com/questions/1109061/insert-on-duplicate-update-in-postgresql
  // const text = 'INSERT INTO accounts(account) VALUES($1) ON CONFLICT (account) DO UPDATE SET account = excluded.account RETURNING *';
  const text = 'INSERT INTO accounts (account) SELECT $1 WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE account=$1) RETURNING *;'

  let txTest = await web3.eth.getTransaction('0x9fff66e0487f665cb380bebca35ce344ca7e5bb7955205f690ce9414dedd7616');
  // console.log(txTest)
  /*
  console.log(web3.utils.fromWei("" + txTest.gas, "Gwei"));
  console.log(web3.utils.fromWei("" + txTest.gasPrice, "Gwei"));
  */

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

  while(true){

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
              console.log("!!!!!!!!!!!!!!!!! burner ???????????????");
              try {
                const res = await pool.query(text, [smallerTx.from]);
                console.log(res.rows[0])
                // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
              } catch(err) {
                console.log(err.stack)
              }
            }
            /*
            if(smallerTx.from == this.state.account || smallerTx.to==this.state.account){
              let found = false
              for(let r in recentTxs){
                if(recentTxs[r].hash==smallerTx.hash){
                  found=true
                  break
                }
              }
              if(!found){
                console.log("+TX",smallerTx)
                //console.log("recentTxs length is ",recentTxs.length)
                recentTxs.push(smallerTx)
                updatedTxs=true
              }
            }
            */
          }
        }
      }

      lastBlockChecked = currentBlockNo;
      // return {recentTxs,updatedTxs}

    }else{
      // console.log('Not updating block.')
    }

  }
}

async function startUp () {
  console.log('StartUp...')
  let web3 = new Web3('https://dai.poa.network/');
  let blockNumber = await web3.eth.getBlockNumber();
  console.log('block done')
  console.log(blockNumber);
  return {
    web3: web3,
    blockNumber: blockNumber
  };
}


console.log('Starting...');

let currentTransactions = [];

var info = checkTxs();
