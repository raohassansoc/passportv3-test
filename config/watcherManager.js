const {transactionWatcher} = require("../api/watchers/TransactionWatcher/TransactionWatcher")

function initializeWatchers(){
    transactionWatcher();
}

module.exports = initializeWatchers