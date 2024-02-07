const mongoose = require("mongoose");
const Transaction = require("../../models/Transaction/TransactionHistory");

function transactionWatcher() {
  const watcherPipeline = [
    {
      $match: {
        operationType: "update",
        "updateDescription.updatedFields.status": { $exists: true },
      },
    },
    {
      $project: {
        _id: 1,
        status: "$updateDescription.updatedFields.status",
        sender_id: 1,
        receiver_id: 1,
      },
    },
  ];

  const transactionChangeStreamWatcher = Transaction.watch(watcherPipeline);

  transactionChangeStreamWatcher.on("change", (change) => {
    console.log(change);
    const { _id, status, sender_id, receiver_id } = change.fullDocument;
    console.log(`Status changed to ${status} for Transaction record ${_id}.`);
    console.log(
      `Sender User ${sender_id} successfully Transaffered crypto to Receiver User ${receiver_id}`
    );
    console.log(
      `Events about Transaction should be Emitted to both Parties involved.`
    );

    const { userSockets } = require("../../../SocketConfig");

    const senderSocket = userSockets.get(sender_id);
    if (senderSocket !== undefined) {
      if (status == "success") {
        senderSocket.emit("TransactionSuccess", _id);
      } else if (status == "failed") {
        senderSocket.emit("TransactionFailed", _id);
      }
    }

    const receiverSocket = userSockets.get(receiver_id);
    if (receiverSocket !== undefined) {
      if (status == "success") {
        senderSocket.emit("TokenReceivedFromSender", _id);
      }
    }
  });

  transactionChangeStreamWatcher.on("error", (error) => {
    console.log(`There was some error in Transaction Watcher.`);
    console.log(error);
  });
}

module.exports = { transactionWatcher };


