require("dotenv").config();
const Web3 = require("web3");
const token = require("../../Pass.json");
const Transaction = require("../models/Transaction/TransactionHistory");
const Users = require("../models/Pay/User");
const { ObjectId } = require("mongodb");
const { Alchemy, Network, AlchemySubscription } = require("alchemy-sdk");

const contractABI = token.abi; // Replace with your contract ABI
const contractAddress = "0x627Bd849E69880bCB26FC03888F77BFED1C24093"; // Replace with your contract address
let crudServices = require("./mongo.crud.services");
const Merchant = require("../models/Merchant/Merchant");

const providerUrl = "wss://sepolia.infura.io/ws/v3/4ca7f7208ad84483b2eb48ef1c1d8de9";
const web3 = new Web3(providerUrl);
// Create a contract instance
const myContract = new web3.eth.Contract(contractABI, contractAddress);

myContract.events
    .allEvents()
    .on("data", async (event) => {
        console.log(event);
        console.log(event.transactionHash);
        console.log(event.returnValues.from);
        console.log(event.returnValues.to);

        try {
            let whereClause_th = {};
            whereClause_th.is_deleted = false;
            whereClause_th.transaction_hash = { $regex: event.transactionHash };

            let executing_parameters_th = {
                where: whereClause_th,
            };

            let whereClause_from = {};
            whereClause_from.is_deleted = false;
            whereClause_from.public_key = { $regex: event.returnValues.from };

            let executing_parameters_from = {
                where: whereClause_from,
            };

            let from_user_data = await crudServices.get(
                Users,
                executing_parameters_from
            );
            let from_merchant_data = await crudServices.get(
                Merchant,
                executing_parameters_from
            );

            let senderId, senderPublicKey, merchantId, receiverId, receiverPublicKey;

            if (from_user_data.data[0] != undefined) {
                senderId = from_user_data.data[0]._id;
                senderPublicKey = from_user_data.data[0].public_key;
                merchantId = null;
            } else if (from_merchant_data.data[0] != undefined) {
                merchantId = from_merchant_data.data[0]._id;
                senderPublicKey = from_merchant_data.data[0].public_key;
                senderId = null;
            } else {
                senderId = null;
                merchantId = null;
                senderPublicKey = event.returnValues.from;
            }

            if (senderId == null && merchantId == null) {
                let whereClause_to = {};
                whereClause_to.is_deleted = false;
                whereClause_to.public_key = { $regex: event.returnValues.to };

                let executing_parameters_to = {
                    where: whereClause_to,
                };

                let to_user_data = await crudServices.get(
                    Users,
                    executing_parameters_to
                );
                let to_merchant_data = await crudServices.get(
                    Merchant,
                    executing_parameters_to
                );

                if (to_user_data.data[0] != undefined) {
                    receiverId = to_user_data.data[0]._id;
                    receiverPublicKey = to_user_data.data[0].public_key;
                } else if (to_merchant_data.data[0] != undefined) {
                    if (merchantId != null) merchantId = to_merchant_data.data[0]._id;
                    receiverPublicKey = to_merchant_data.data[0].public_key;
                    receiverId = null;
                } else {
                    receiverId = null;
                    receiverPublicKey = event.returnValues.from;
                }


                let transferd_currency_qty = web3.utils.fromWei(
                    event.returnValues.value,
                    "ether"
                );

                let transaction_data = await crudServices.get(
                    Transaction,
                    executing_parameters_th
                );

                if (transaction_data.data[0] == undefined) {
                    let transaction_receipt = await web3.eth.getTransactionReceipt(
                        event.transactionHash
                    );
                    let transaction_status = transaction_receipt.status
                        ? "succeeded"
                        : "falied";

                    let transaction_details = await crudServices.insert(Transaction, {
                        sender_id: senderId,
                        merchant_id: merchantId,
                        sender_public_key: senderPublicKey,
                        sender_currency_id: ObjectId("651e7a60ce8c4f45f6ba9b1c"),
                        sender_currency_qty: transferd_currency_qty,
                        receiver_id: receiverId,
                        receiver_public_key: receiverPublicKey,
                        receiver_currency_id: ObjectId("651e7a60ce8c4f45f6ba9b1c"),
                        transaction_hash: event.transactionHash,
                        status: transaction_status,
                        is_settled: true,
                    });
                } else {
                    console.log(
                        "Transaction Record already exists in db.",
                        event.transactionHash
                    );
                }
            }
        } catch (error) {
            console.log(error);
        }
    })
    .on("error", (error) => {
        console.error("Error:", error);
    });

const settings = {
    apiKey: "9R4DA3kpbrafIsVXZv9G1YK9Ib9LkGFQ", // Replace with your Alchemy API Key
    apiKey: "W-qMA3Ay-3qX-bX6bZ74okKU6TLRAyvr", // Replace with your Alchemy API Key
    network: Network.ETH_MAINNET, // Replace with your network
};

const alchemy = new Alchemy(settings);
const getAllDistinctPublicKeys = async () => {
    try {
        const userList = await Users.aggregate([
            {
                $match: {
                    is_deleted: false,
                },
            },
            {
                $group: {
                    _id: null, // Group all documents into a single group
                    publicKeys: { $addToSet: "$public_key" }, // Use $addToSet to get distinct public keys
                },
            },
            {
                $project: {
                    _id: 0, // Exclude the _id field
                    publicKeys: 1,
                },
            },
        ]);

        if (userList.length > 0) {
            return userList[0].publicKeys; // The public keys are in the "publicKeys" field of the first document
        }

        return [];
    } catch (error) {
        console.error("Error fetching distinct public keys:", error);
        throw error;
    }
};

// Usage example
getAllDistinctPublicKeys()
    .then(async (distinctPublicKeys) => {
        alchemy.ws.on(
            {
                method: AlchemySubscription.PENDING_TRANSACTIONS,
                toAddress: distinctPublicKeys, // Replace with address to send  pending transactions to this address
            },
            async (tx) => {
                try {
                    console.log(tx);

                    let whereClause_th = {};
                    whereClause_th.is_deleted = false;
                    whereClause_th.transaction_hash = { $regex: tx.hash };

                    let executing_parameters_th = {
                        where: whereClause_th,
                    };

                    let whereClause_from = {};
                    whereClause_from.is_deleted = false;
                    console.log(tx.from);
                    whereClause_from.public_key = { $regex: tx.from, $options: "i" };

                    let executing_parameters_from = {
                        where: whereClause_from,
                    };

                    let from_user_data = await crudServices.get(
                        Users,
                        executing_parameters_from
                    );
                    let from_merchant_data = await crudServices.get(
                        Merchant,
                        executing_parameters_from
                    );

                    console.log(70, "from identity", from_user_data, from_merchant_data);

                    let senderId,
                        senderPublicKey,
                        merchantId,
                        receiverId,
                        receiverPublicKey;

                    if (from_user_data.data[0] != undefined) {
                        senderId = from_user_data.data[0]._id;
                        senderPublicKey = from_user_data.data[0].public_key;
                        merchantId = null;
                    } else if (from_merchant_data.data[0] != undefined) {
                        merchantId = from_merchant_data.data[0]._id;
                        senderPublicKey = from_merchant_data.data[0].public_key;
                        senderId = null;
                    } else {
                        senderId = null;
                        merchantId = null;
                        senderPublicKey = tx.from;
                    }

                    console.log(
                        93,
                        "sender identity set",
                        senderId,
                        merchantId,
                        senderPublicKey
                    );

                    if (senderId == null && merchantId == null) {
                        console.log(JSON.stringify(tx.to));
                        console.log(tx.to);
                        let whereClause_to = {};
                        whereClause_to.is_deleted = false;
                        whereClause_to.public_key = { $regex: tx.to, $options: "i" };

                        let executing_parameters_to = {
                            where: whereClause_to,
                        };

                        let to_user_data = await crudServices.get(
                            Users,
                            executing_parameters_to
                        );
                        let to_merchant_data = await crudServices.get(
                            Merchant,
                            executing_parameters_to
                        );

                        console.log(117, "to identity", to_user_data, to_merchant_data);

                        if (to_user_data.data[0] != undefined) {
                            receiverId = to_user_data.data[0]._id;
                            receiverPublicKey = to_user_data.data[0].public_key;
                        } else if (to_merchant_data.data[0] != undefined) {
                            if (merchantId != null) merchantId = to_merchant_data.data[0]._id;
                            receiverPublicKey = to_merchant_data.data[0].public_key;
                            receiverId = null;
                        } else {
                            receiverId = null;
                            receiverPublicKey = tx.to;
                        }

                        console.log(
                            132,
                            "to identity set",
                            receiverId,
                            merchantId,
                            receiverPublicKey
                        );

                        let transferd_currency_qty = web3.utils.fromWei(tx.value, "ether");

                        let transaction_data = await crudServices.get(
                            Transaction,
                            executing_parameters_th
                        );
                        console.log(transaction_data);

                        if (transaction_data.data[0] == undefined) {
                            let transaction_details = await crudServices.insert(Transaction, {
                                sender_id: senderId,
                                merchant_id: merchantId,
                                sender_public_key: senderPublicKey,
                                sender_currency_id: ObjectId("651e7ac6ce8c4f45f6ba9b1e"),
                                sender_currency_qty: transferd_currency_qty,
                                receiver_id: receiverId,
                                receiver_public_key: receiverPublicKey,
                                receiver_currency_id: ObjectId("651e7ac6ce8c4f45f6ba9b1e"),
                                transaction_hash: tx.hash,
                                status: "succeeded",
                                is_settled: true,
                            });
                            console.log(168, transaction_details);
                        } else {
                            console.log("Transaction Record already exists in db.", tx.hash);
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        );
    })
    .catch((error) => {
        // Handle any errors from the getAllDistinctPublicKeys function
    });




myContract.events
    .allEvents()
    .on("data", async (event) => {
        console.log(event);
        console.log(event.transactionHash);
        console.log(event.returnValues.from);
        console.log(event.returnValues.to);

        try {
            let whereClause_th = {};
            whereClause_th.is_deleted = false;
            whereClause_th.transaction_hash = { $regex: event.transactionHash };

            let executing_parameters_th = {
                where: whereClause_th,
            };

            let whereClause_from = {};
            whereClause_from.is_deleted = false;
            whereClause_from.public_key = { $regex: event.returnValues.from };

            let executing_parameters_from = {
                where: whereClause_from,
            };

            let from_user_data = await crudServices.get(
                Users,
                executing_parameters_from
            );
            let from_merchant_data = await crudServices.get(
                Merchant,
                executing_parameters_from
            );

            let senderId, senderPublicKey, merchantId, receiverId, receiverPublicKey;

            if (from_user_data.data[0] != undefined) {
                senderId = from_user_data.data[0]._id;
                senderPublicKey = from_user_data.data[0].public_key;
                merchantId = null;
            } else if (from_merchant_data.data[0] != undefined) {
                merchantId = from_merchant_data.data[0]._id;
                senderPublicKey = from_merchant_data.data[0].public_key;
                senderId = null;
            } else {
                senderId = null;
                merchantId = null;
                senderPublicKey = event.returnValues.from;
            }

            if (senderId == null && merchantId == null) {
                let whereClause_to = {};
                whereClause_to.is_deleted = false;
                whereClause_to.public_key = { $regex: event.returnValues.to };

                let executing_parameters_to = {
                    where: whereClause_to,
                };

                let to_user_data = await crudServices.get(
                    Users,
                    executing_parameters_to
                );
                let to_merchant_data = await crudServices.get(
                    Merchant,
                    executing_parameters_to
                );

                if (to_user_data.data[0] != undefined) {
                    receiverId = to_user_data.data[0]._id;
                    receiverPublicKey = to_user_data.data[0].public_key;
                } else if (to_merchant_data.data[0] != undefined) {
                    if (merchantId != null) merchantId = to_merchant_data.data[0]._id;
                    receiverPublicKey = to_merchant_data.data[0].public_key;
                    receiverId = null;
                } else {
                    receiverId = null;
                    receiverPublicKey = event.returnValues.from;
                }



                let transferd_currency_qty = web3.utils.fromWei(
                    event.returnValues.value,
                    "ether"
                );

                let transaction_data = await crudServices.get(
                    Transaction,
                    executing_parameters_th
                );

                if (transaction_data.data[0] == undefined) {
                    let transaction_receipt = await web3.eth.getTransactionReceipt(
                        event.transactionHash
                    );
                    let transaction_status = transaction_receipt.status
                        ? "succeeded"
                        : "falied";
                    let transaction_details = await crudServices.insert(Transaction, {
                        sender_id: senderId,
                        merchant_id: merchantId,
                        sender_public_key: senderPublicKey,
                        sender_currency_id: ObjectId("651e7a60ce8c4f45f6ba9b1c"),
                        sender_currency_qty: transferd_currency_qty,
                        receiver_id: receiverId,
                        receiver_public_key: receiverPublicKey,
                        receiver_currency_id: ObjectId("651e7a60ce8c4f45f6ba9b1c"),
                        transaction_hash: event.transactionHash,
                        status: transaction_status,
                        is_settled: true,
                    });
                } else {
                    console.log(
                        "Transaction Record already exists in db.",
                        event.transactionHash
                    );
                }
            }
        } catch (error) {
            console.log(error);
        }
    })
    .on("error", (error) => {
        console.error("Error:", error);
    });
