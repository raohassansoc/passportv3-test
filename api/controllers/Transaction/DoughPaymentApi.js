const Currency = require("../../models/Master/Currency");
const awsHelper = require("../../helper/awsHelper");
const crudServices = require("../../services/mongo.crud.services");
const Transaction = require("../../models/Transaction/TransactionHistory");
const { ObjectId } = require("mongodb");
require("dotenv").config();
const Web3 = require("web3");
const providerUrl = process.env.PROVIDER_URL; // Replace with your Ethereum node URL or Infura API key
const web3 = new Web3(providerUrl);

const DoughPaymentApi = () => {
  const DoughPayment = async (req, res) => {
    let {
      user_id,
      user_public_key,
      receiver_public_key,
      currency_address,
      currency_qty,
    } = req.body;

    if (!user_id || !user_public_key || !receiver_public_key || !currency_qty)
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Missing Required Details to Initiate Douge Transaction.",
      });

    if (!currency_address) {
      currency_address = "0xa51614D51e6AC66fB7AA5a4Ff9Ed57aC4431a1D0"; // prod: 0xa51614D51e6AC66fB7AA5a4Ff9Ed57aC4431a1D0, dev: 0xa51614D51e6AC66fB7AA5a4Ff9Ed57aC4431a1D0
    }

    try {
      let whereClause = {};
      whereClause.currency_address = { $regex: currency_address };

      let executing_parameters = {
        where: whereClause,
        projection: {
          _id: 1,
          currency_code: 1,
        },
      };

      let currency = await crudServices.get(Currency, executing_parameters);
      if (currency.data[0] == undefined)
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Currency Reference Invalid.",
        });

      const secretName = `${user_id}_private`;
      const senderPrivateKey = await awsHelper.retrieveSecret(secretName);

      let reqData = {};
      reqData.sender_currency_qty = parseFloat(currency_qty);
      reqData.sender_public_key = user_public_key;
      reqData.receiver_public_key = receiver_public_key;

      let sender_currency = {};
      sender_currency.currency_address = currency_address;
      sender_currency.currency_code = currency.data[0].currency_code;

      let transaction_reqData_p = {};
      transaction_reqData_p.sender_id = ObjectId(user_id);
      transaction_reqData_p.sender_public_key = user_public_key;
      transaction_reqData_p.receiver_public_key = receiver_public_key;
      transaction_reqData_p.sender_currency_id = ObjectId(currency.data[0]._id);
      transaction_reqData_p.receiver_currency_id = ObjectId(
        currency.data[0]._id
      );

      if (
        currency.data[0].currency_code == "ETH" ||
        currency.data[0].currency_code == "PASS" ||
        currency.data[0].currency_code == "USDC"
      ) {
        currency_qty = parseFloat((1.0 * currency_qty) / parseInt(1e18));
        currency_qty = currency_qty.toFixed(6);
      } else if (currency.data[0].currency_code == "USDT") {
        currency_qty = parseFloat((1.0 * currency_qty) / parseInt(1e8));
        currency_qty = currency_qty.toFixed(6);
      }

      transaction_reqData_p.sender_currency_qty = currency_qty;
      transaction_reqData_p.is_merchant_payment = true;
      transaction_reqData_p.status_id = ObjectId("65449ed0188791016882b5f8"); // prod: 6540dd8f780dd7f21947c8ec, dev: 65449ed0188791016882b5f8
      transaction_reqData_p.status = "pending";
      let transaction_instance_p = await crudServices.insert(
        Transaction,
        transaction_reqData_p
      );

      console.log(77);

      try {
        let abiJsonData = [
          {
            constant: true,
            inputs: [],
            name: "name",
            outputs: [{ name: "", type: "string" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [{ name: "_upgradedAddress", type: "address" }],
            name: "deprecate",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { name: "_spender", type: "address" },
              { name: "_value", type: "uint256" },
            ],
            name: "approve",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "deprecated",
            outputs: [{ name: "", type: "bool" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [{ name: "_evilUser", type: "address" }],
            name: "addBlackList",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "totalSupply",
            outputs: [{ name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { name: "_from", type: "address" },
              { name: "_to", type: "address" },
              { name: "_value", type: "uint256" },
            ],
            name: "transferFrom",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "upgradedAddress",
            outputs: [{ name: "", type: "address" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [{ name: "", type: "address" }],
            name: "balances",
            outputs: [{ name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "decimals",
            outputs: [{ name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "maximumFee",
            outputs: [{ name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "_totalSupply",
            outputs: [{ name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [],
            name: "unpause",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [{ name: "_maker", type: "address" }],
            name: "getBlackListStatus",
            outputs: [{ name: "", type: "bool" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [
              { name: "", type: "address" },
              { name: "", type: "address" },
            ],
            name: "allowed",
            outputs: [{ name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "paused",
            outputs: [{ name: "", type: "bool" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [{ name: "who", type: "address" }],
            name: "balanceOf",
            outputs: [{ name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [],
            name: "pause",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "getOwner",
            outputs: [{ name: "", type: "address" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "owner",
            outputs: [{ name: "", type: "address" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "symbol",
            outputs: [{ name: "", type: "string" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { name: "_to", type: "address" },
              { name: "_value", type: "uint256" },
            ],
            name: "transfer",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: false,
            inputs: [
              { name: "newBasisPoints", type: "uint256" },
              { name: "newMaxFee", type: "uint256" },
            ],
            name: "setParams",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: false,
            inputs: [{ name: "amount", type: "uint256" }],
            name: "issue",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: false,
            inputs: [{ name: "amount", type: "uint256" }],
            name: "redeem",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [
              { name: "_owner", type: "address" },
              { name: "_spender", type: "address" },
            ],
            name: "allowance",
            outputs: [{ name: "remaining", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "basisPointsRate",
            outputs: [{ name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: true,
            inputs: [{ name: "", type: "address" }],
            name: "isBlackListed",
            outputs: [{ name: "", type: "bool" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [{ name: "_clearedUser", type: "address" }],
            name: "removeBlackList",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: true,
            inputs: [],
            name: "MAX_UINT",
            outputs: [{ name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          {
            constant: false,
            inputs: [{ name: "newOwner", type: "address" }],
            name: "transferOwnership",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            constant: false,
            inputs: [{ name: "_blackListedUser", type: "address" }],
            name: "destroyBlackFunds",
            outputs: [],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
          },
          {
            inputs: [
              { name: "_initialSupply", type: "uint256" },
              { name: "_name", type: "string" },
              { name: "_symbol", type: "string" },
              { name: "_decimals", type: "uint256" },
            ],
            payable: false,
            stateMutability: "nonpayable",
            type: "constructor",
          },
          {
            anonymous: false,
            inputs: [{ indexed: false, name: "amount", type: "uint256" }],
            name: "Issue",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [{ indexed: false, name: "amount", type: "uint256" }],
            name: "Redeem",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [{ indexed: false, name: "newAddress", type: "address" }],
            name: "Deprecate",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              { indexed: false, name: "feeBasisPoints", type: "uint256" },
              { indexed: false, name: "maxFee", type: "uint256" },
            ],
            name: "Params",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              { indexed: false, name: "_blackListedUser", type: "address" },
              { indexed: false, name: "_balance", type: "uint256" },
            ],
            name: "DestroyedBlackFunds",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [{ indexed: false, name: "_user", type: "address" }],
            name: "AddedBlackList",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [{ indexed: false, name: "_user", type: "address" }],
            name: "RemovedBlackList",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              { indexed: true, name: "owner", type: "address" },
              { indexed: true, name: "spender", type: "address" },
              { indexed: false, name: "value", type: "uint256" },
            ],
            name: "Approval",
            type: "event",
          },
          {
            anonymous: false,
            inputs: [
              { indexed: true, name: "from", type: "address" },
              { indexed: true, name: "to", type: "address" },
              { indexed: false, name: "value", type: "uint256" },
            ],
            name: "Transfer",
            type: "event",
          },
          { anonymous: false, inputs: [], name: "Pause", type: "event" },
          { anonymous: false, inputs: [], name: "Unpause", type: "event" },
        ];

        const myTokenContract = new web3.eth.Contract(
          abiJsonData,
          sender_currency.currency_address
        );

        const gasLimit = 50000;

        const amountToMint = reqData.sender_currency_qty;

        let txObject;

        if (sender_currency.currency_code == "ETH") {
          txObject = {
            to: reqData.receiver_public_key,
            value: amountToMint,
            gas: gasLimit,
            from: reqData.sender_public_key,
          };
        } else if (sender_currency.currency_code == "PASS") {
          const data = await myTokenContract.methods
            .transfer(reqData.receiver_public_key, amountToMint)
            .encodeABI();

          txObject = {
            to: sender_currency.currency_address,
            data: data,
            gas: gasLimit,
            from: reqData.sender_public_key,
          };
        } else if (
          sender_currency.currency_code == "USDC" ||
          sender_currency.currency_code == "USDT"
        ) {

          const data = await myTokenContract.methods
            .transfer(reqData.receiver_public_key, reqData.sender_currency_qty)
            .encodeABI();

          txObject = {
            to: sender_currency.currency_address,
            data: data,
            gas: gasLimit,
            from: reqData.sender_public_key,
          };
        }

        console.log(532, txObject);

        let transaction_error = false;

        await web3.eth.accounts
          .signTransaction(txObject, senderPrivateKey)
          .then((signedTx) => {
            web3.eth
              .sendSignedTransaction(signedTx.rawTransaction)
              .on("transactionHash", async (hash) => {
                console.log(542, "Transaction hash:", hash);
                const receipt = await web3.eth.getTransactionReceipt(hash);
                console.log(544, receipt);
                let status;
                if (receipt) {
                  if (receipt.status) {
                    status = "succeeded";
                  } else {
                    status = "failed";
                  }
                } else {
                  status = "pending";
                }

                console.log(556, status);

                await crudServices.update(
                  Transaction,
                  { _id: transaction_instance_p._id },
                  { transaction_hash: hash, status: status }
                );
              })
              .on("receipt", async (receipt) => {
                console.log(565, "Transaction receipt:", receipt);
                console.log(566, receipt.transactionHash);
                const receiptStatus = await web3.eth.getTransactionReceipt(
                  receipt.transactionHash
                );
                let status;
                if (receiptStatus) {
                  if (receiptStatus.status) {
                    status = "succeeded";
                  } else {
                    status = "failed";
                  }
                }
                await crudServices.update(
                  Transaction,
                  { _id: transaction_instance_p._id },
                  {
                    transaction_hash: receipt.transactionHash,
                    status: status,
                  }
                );
              })
              .on("error", async (error) => {
                transaction_error = true;
                if (error.message.includes("insufficient funds")) {
                  console.error(590, "Insufficient funds for gas");
                  console.log(error.message);
                  await crudServices.update(
                    Transaction,
                    { _id: transaction_instance_p._id },
                    { status: "failed" }
                  );
                } else {
                  await crudServices.update(
                    Transaction,
                    { _id: transaction_instance_p._id },
                    { status: "failed" }
                  );
                }
                transaction_error = true;
              });
          })
          .catch(async (error) => {
            console.log(608, error);
            transaction_error = true;
            await crudServices.update(
              Transaction,
              { _id: transaction_instance_p._id },
              { status: "failed" }
            );
            console.error("Signing error:", error);
            transaction_error = true;
          });

        if (transaction_error) {
          return res.status(500).json({
            code: 500,
            success: false,
            message: "Transaction Failed.",
          });
        }
      } catch (error) {
        console.log(627, error);
        await crudServices.update(
          Transaction,
          { _id: transaction_instance_p._id },
          { status: "failed" }
        );
        return res.status(500).json({
          code: 500,
          success: false,
          message: "Transaction Failed.",
        });
      }

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Transaction Success.",
        data: transaction_instance_p,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error.",
      });
    }
  };

  return {
    DoughPayment,
  };
};

module.exports = DoughPaymentApi;
