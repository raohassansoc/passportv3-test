const validationService = require("../../services/validation.service");
const walletService = require("../../services/wallet.services");
const crudServices = require("../../services/mongo.crud.services");
const TransactionHistory = require("../../models/Transaction/TransactionHistory");
const { TransactionHistorySchema } = require("../../schemas/TransactionSchema");
const { ObjectId } = require("mongodb");
const currency = require("../../models/Master/Currency");
const User = require("../../models/Pay/User");
const axios = require("axios");
const awsHelper = require("../../helper/awsHelper");
const Investors = require("../../models/IEO/Investors");
const Transaction = require("../../models/IEO/Transaction");
const Currency = require("../../models/Master/Currency");
const Merchant = require("../../models/Merchant/Merchant");
const QR = require("../../models/QR/QR");
const { resolveSoa } = require("dns");
const Users = require("../../models/Pay/User");
const apiUrl = "https://api.coingecko.com/api/v3/simple/price";
require("dotenv").config();
const Web3 = require("web3");
const providerUrl = process.env.PROVIDER_URL; // Replace with your Ethereum node URL or Infura API key
const web3 = new Web3(providerUrl);

const WalletTransactionApi = () => {
  const transferToken = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, TransactionHistorySchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            response = await crudServices.update(
              TransactionHistory,
              { _id: reqData._id },
              reqData
            );
          } else {
            let whereClauseUser = {};
            whereClauseUser.is_deleted = false;
            if (reqData.sender_id) {
              whereClauseUser._id = ObjectId(reqData.sender_id);
              const executing_parameters_sender = {
                where: whereClauseUser,
                projection: {
                  public_key: 1,
                },
              };
              const sender = await crudServices.get(
                User,
                executing_parameters_sender
              );
              if (!sender.data.length > 0) {
                return res.status(401).json({
                  code: 401,
                  success: false,
                  message: "Unrecognized Sender.",
                });
              }
              reqData.sender_public_key = sender.data[0].public_key;
            } else {
              reqData.sender_public_key = reqData.sender_public_key;
            }
            if (reqData.receiver_id || reqData.receiver_public_key) {
              let whereClauseUser = {};
              whereClauseUser.is_deleted = false;
              if (reqData.receiver_id) {
                whereClauseUser._id = ObjectId(reqData.receiver_id);
              }
              if (reqData.receiver_public_key) {
                whereClauseUser.public_key = reqData.receiver_public_key;
              }

              const executing_parameters_receiver = {
                where: whereClauseUser,
                projection: {
                  public_key: 1,
                },
              };
              const receiver = await crudServices.get(
                User,
                executing_parameters_receiver
              );
              if (!receiver.data.length > 0) {
                reqData.receiver_public_key = reqData.receiver_public_key;
              } else {
                reqData.receiver_public_key = receiver.data[0].public_key;
                reqData.receiver_id = receiver.data[0]._id;
              }
            }

            let whereClauseCurrency = {};
            whereClauseCurrency.is_deleted = false;
            whereClauseCurrency._id = ObjectId(reqData.sender_currency_id);
            const executing_parameters_sender_currency = {
              where: whereClauseCurrency,
              projection: {
                _id: 1,
                currency_code: 1,
                currency_address: 1,
                currency_category_id: 1,
                currency_abi: 1,
              },
            };
            const sender_currency = await crudServices.get(
              Currency,
              executing_parameters_sender_currency
            );
            if (!sender_currency.data.length > 0) {
              return res.status(401).json({
                code: 401,
                success: false,
                message: "Unrecognized Currency 1.",
              });
            }

            const secretName = `${reqData.sender_id}_private`;
            const senderPrivateKey = await awsHelper.retrieveSecret(secretName);
            reqData.cashback = 0;
            console.log(senderPrivateKey, "nandaniya");
            reqData.status = "pending";
            response = await crudServices.insert(TransactionHistory, reqData);

            try {
              let abiJsonData = [
                {
                  constant: false,
                  inputs: [
                    {
                      name: "_to",
                      type: "address",
                    },
                    {
                      name: "_value",
                      type: "uint256",
                    },
                  ],
                  name: "transfer",
                  outputs: [
                    {
                      name: "success",
                      type: "bool",
                    },
                  ],
                  payable: false,
                  stateMutability: "nonpayable",
                  type: "function",
                },
              ];
              const myTokenContract = new web3.eth.Contract(
                abiJsonData,
                sender_currency.data[0].currency_address
              );
              const gasLimit = 300000;
              const amountToMint = web3.utils.toWei(
                reqData.sender_currency_qty.toString(),
                "ether"
              );
              let txObject;
              if (sender_currency.data[0].currency_code == "ETH") {
                txObject = {
                  to: reqData.receiver_public_key,
                  value: amountToMint,
                  gas: gasLimit,
                  from: reqData.sender_public_key,
                };
              } else {
                const data = await myTokenContract.methods
                  .transfer(reqData.receiver_public_key, amountToMint)
                  .encodeABI();

                txObject = {
                  to: sender_currency.data[0].currency_address,
                  data: data,
                  gas: gasLimit,
                  from: reqData.sender_public_key,
                };
              }
              await web3.eth.accounts
                .signTransaction(txObject, senderPrivateKey)
                .then((signedTx) => {
                  web3.eth
                    .sendSignedTransaction(signedTx.rawTransaction)
                    .on("transactionHash", async (hash) => {
                      console.log("Transaction hash:", hash);
                      const receipt = await web3.eth.getTransactionReceipt(
                        hash
                      );
                      let status;
                      if (receipt) {
                        if (receipt.status) {
                          status = "succeeded";
                        } else {
                          status = "failed";
                        }
                      }
                      let update = await crudServices.update(
                        TransactionHistory,
                        { _id: response._id },
                        { transaction_hash: hash, status: status }
                      );
                    })
                    .on("receipt", async (receipt) => {
                      console.log("Transaction receipt:", receipt);
                      console.log(receipt.transactionHash);
                      const receiptStatus =
                        await web3.eth.getTransactionReceipt(
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
                      let update = await crudServices.update(
                        TransactionHistory,
                        { _id: response._id },
                        {
                          transaction_hash: receipt.transactionHash,
                          status: status,
                        }
                      );
                    })
                    .on("error", async (error) => {
                      if (error.message.includes("insufficient funds")) {
                        console.log(error);
                        console.error("Insufficient funds for gas");
                        let update = await crudServices.update(
                          TransactionHistory,
                          { _id: response._id },
                          { status: "failed" }
                        );
                      } else {
                        let update = await crudServices.update(
                          TransactionHistory,
                          { _id: response._id },
                          { status: "failed" }
                        );
                        console.error("Transaction error:", error);
                      }
                    });
                })
                .catch(async (error) => {
                  let update = await crudServices.update(
                    TransactionHistory,
                    { _id: response._id },
                    { status: "failed" }
                  );
                  console.error("Signing error:", error);
                });
            } catch (error) {
              let update = await crudServices.update(
                TransactionHistory,
                { _id: response._id },
                { status: "failed" }
              );
              console.log(error);
            }
          }

          return res.status(201).json({
            code: 200,
            success: true,
            message: `Token Transfer successfully.`,
            data: response || {},
          });
        } catch (error) {
          console.log(error);
          return res.status(200).json({
            code: 500,
            success: false,
            message: "Internal Server Error",
            error: error,
          });
        }
      })
      .catch((err) => {
        return res.status(200).json({
          code: 500,
          success: false,
          message: "Internal Server Error",
          error: err,
        });
      });
  };
  const merchantPayment = async (req, res) => {
    await validationService.convertIntObj(req.body);
    validationService
      .validate(req.body, TransactionHistorySchema)
      .then(async (reqData) => {
        try {
          let response;
          if (reqData._id) {
            response = await crudServices.update(
              TransactionHistory,
              { _id: reqData._id },
              reqData
            );
          } else {
            let whereClauseUser = {};
            whereClauseUser.is_deleted = false;
            if (reqData.sender_id) {
              whereClauseUser._id = ObjectId(reqData.sender_id);
              const executing_parameters_sender = {
                where: whereClauseUser,
                projection: {
                  public_key: 1,
                },
              };
              const sender = await crudServices.get(
                User,
                executing_parameters_sender
              );
              if (!sender.data.length > 0) {
                return res.status(401).json({
                  code: 401,
                  success: false,
                  message: "Unrecognized Sender.",
                });
              }
              reqData.sender_public_key = sender.data[0].public_key;
            } else {
              reqData.sender_public_key = sender_public_key;
            }
            if (reqData.receiver_id || reqData.receiver_public_key) {
              let whereClauseUser = {};
              whereClauseUser.is_deleted = false;
              if (reqData.receiver_id) {
                whereClauseUser._id = ObjectId(reqData.receiver_id);
              }
              if (reqData.receiver_public_key) {
                whereClauseUser.public_key = reqData.receiver_public_key;
              }

              const executing_parameters_receiver = {
                where: whereClauseUser,
                projection: {
                  public_key: 1,
                },
                populate: [
                  {
                    from: "merchant_referrals",
                    let: { userId: "$_id" },
                    as: "Referrals",
                    pipeline: [
                      {
                        $match: {
                          $expr: { $eq: ["$merchant_id", "$$userId"] },
                        },
                      },
                      {
                        $project: {
                          is_deleted: 0,
                          deleted_at: 0,
                          created_at: 0,
                          updated_at: 0,
                          __v: 0,
                        },
                      },
                    ],
                  },
                ],
              };
              const receiver = await crudServices.get(
                Merchant,
                executing_parameters_receiver
              );
              if (!receiver.data.length > 0) {
                reqData.receiver_public_key = reqData.receiver_public_key;
              } else {
                reqData.receiver_public_key = receiver.data[0].public_key;
                reqData.receiver_id = receiver.data[0]._id;
                if (receiver.data[0].Referrals.length > 0) {
                  reqData.cashback =
                    (receiver.data[0].Referrals[0].value *
                      reqData.sender_currency_qty) /
                    100;
                }
              }
            }

            let whereClauseCurrency = {};
            whereClauseCurrency.is_deleted = false;
            whereClauseCurrency._id = ObjectId(reqData.sender_currency_id);
            const executing_parameters_sender_currency = {
              where: whereClauseCurrency,
              projection: {
                _id: 1,
                currency_code: 1,
                currency_address: 1,
                currency_category_id: 1,
                currency_abi: 1,
              },
            };
            const sender_currency = await crudServices.get(
              Currency,
              executing_parameters_sender_currency
            );
            if (!sender_currency.data.length > 0) {
              return res.status(401).json({
                code: 401,
                success: false,
                message: "Unrecognized Currency 1.",
              });
            }
            const secretName = `${reqData.sender_id}_private`;
            const senderPrivateKey = await awsHelper.retrieveSecret(secretName);

            let data = await walletService.transferTokens(
              senderPrivateKey,
              reqData,
              sender_currency.data[0]
            );
            reqData.merchant_id = reqData.receiver_id;
            delete reqData.receiver_id;
            reqData.is_settled = false;
            reqData.transaction_hash = data.receipt.transactionHash;
            response = await crudServices.insert(TransactionHistory, reqData);
          }

          return res.status(201).json({
            code: 200,
            success: true,
            message: `Token Transfer successfully.`,
            data: response || {},
          });
        } catch (error) {
          console.log(error);
          return res.status(501).json(error);
        }
      })
      .catch((err) => {
        return res.status(500).json({
          code: 500,
          success: false,
          message: "Internal Server Error",
          error: err,
        });
      });
  };

  const user_payment_to_merchant = async (req, res) => {
    if (
      req.body.qr_id == undefined ||
      req.body.qr_id == "" ||
      req.body.sender_id == undefined ||
      req.body.sender_id == "" ||
      req.body.sender_public_key == undefined ||
      req.body.sender_public_key == ""
    )
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Missing Required Details for Transaction.",
      });

    try {
      let whereClause_qr = {};
      whereClause_qr.is_deleted = false;
      whereClause_qr._id = ObjectId(req.body.qr_id);

      let populate = [
        {
          from: "merchants",
          let: { merchantId: "$merchant_id" },
          as: "Merchant",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$merchantId"] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
            {
              $project: {
                is_deleted: 0,
                created_at: 0,
                deleted_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "currencies",
          let: { currencyId: "$currency_id" },
          as: "Currency",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$currencyId"] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
            {
              $project: {
                is_deleted: 0,
                created_at: 0,
                deleted_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
      ];

      const executing_parameters = {
        where: whereClause_qr,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
          __v: 0,
        },
        populate: populate,
      };

      let qr = await crudServices.get(QR, executing_parameters);
      if (qr.data[0] == undefined)
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Transaction Link Does not exists or expired.",
        });

      let milliseconds_until_expiry =
        601000 -
        new Date().getTime() +
        qr.data[0].qr_generation_timestamp.getTime();

      if (milliseconds_until_expiry <= 0)
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Transaction Link expired.",
        });

      if (qr.data[0].Merchant[0] == undefined)
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Merchant Does not exists.",
        });

      if (qr.data[0].Currency[0] == undefined)
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Currency does not exist.",
        });

      let whereClause_sender = {};
      whereClause_sender.is_deleted = false;
      whereClause_sender._id = ObjectId(req.body.sender_id);

      let executing_parameters_sender = {
        where: whereClause_sender,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
          __v: 0,
        },
      };

      let sender = await crudServices.get(Users, executing_parameters_sender);
      if (sender.data[0] == undefined)
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Sender Does not exists.",
        });

      if (sender.data[0].public_key != req.body.sender_public_key)
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Inconsistent database this error should never occur.",
        });

      const secretName = `${req.body.sender_id}_private`;
      const senderPrivateKey = await awsHelper.retrieveSecret(secretName);

      let reqData = {};
      reqData.sender_currency_qty = parseFloat(qr.data[0].currency_qty);
      reqData.sender_public_key = req.body.sender_public_key;
      reqData.receiver_public_key = qr.data[0].Merchant[0].public_key;

      let sender_currency = {};
      sender_currency.currency_address =
        qr.data[0].Currency[0].currency_address;
      sender_currency.currency_code = qr.data[0].Currency[0].currency_code;

      let transaction_data;
      try {
        transaction_data = await walletService.transferTokens(
          senderPrivateKey,
          reqData,
          sender_currency
        );
      } catch (error) {
        console.log(error);
        let transaction_reqData = {};
        transaction_reqData.sender_id = ObjectId("000000000000000000000000");
        transaction_reqData.sender_public_key = "000000000000000000000000";
        transaction_reqData.merchant_id = ObjectId(qr.data[0].Merchant[0]._id);
        transaction_reqData.sender_currency_id = ObjectId(
          qr.data[0].Currency[0]._id
        );
        transaction_reqData.receiver_currency_id = ObjectId(
          qr.data[0].Currency[0]._id
        );
        transaction_reqData.sender_currency_qty = parseFloat(
          qr.data[0].currency_qty
        );
        transaction_reqData.status_id = ObjectId("651e891bce8c4f45f6ba9d57"); // prod: 6540dd7f780dd7f21947c8e8, dev: 651e891bce8c4f45f6ba9d57
        transaction_reqData.qr_id = ObjectId(req.body.qr_id);

        let transaction_instance = await crudServices.insert(
          TransactionHistory,
          transaction_reqData
        );

        await crudServices.destroy(QR, { _id: ObjectId(req.body.qr_id) });

        return res.status(401).json({
          code: 401,
          success: false,
          message: "Transaction Failed.",
          data: transaction_instance,
        });
      }

      let transaction_hash = transaction_data.receipt.transactionHash;

      let transaction_reqData = {};
      transaction_reqData.sender_id = ObjectId(req.body.sender_id);
      transaction_reqData.sender_public_key = req.body.sender_public_key;
      transaction_reqData.merchant_id = ObjectId(qr.data[0].Merchant[0]._id);
      transaction_reqData.sender_currency_id = ObjectId(
        qr.data[0].Currency[0]._id
      );
      transaction_reqData.receiver_currency_id = ObjectId(
        qr.data[0].Currency[0]._id
      );
      transaction_reqData.sender_currency_qty = parseFloat(
        qr.data[0].currency_qty
      );
      transaction_reqData.transaction_hash = transaction_hash;
      transaction_reqData.status_id = ObjectId("651e8926ce8c4f45f6ba9d59"); // prod: 6540dd78780dd7f21947c8e6, dev: 651e8926ce8c4f45f6ba9d59
      transaction_reqData.qr_id = ObjectId(req.body.qr_id);

      let transaction_instance = await crudServices.insert(
        TransactionHistory,
        transaction_reqData
      );

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Transaction Success.",
        data: transaction_instance,
      });
    } catch (error) {
      console.log(error);
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Internal Server Error",
        error: error,
      });
    }
  };

  const on_merchant_payment_qr_cancellation_proccess = async (req, res) => {
    if (req.body.qr_id == undefined || req.body.qr_id == "")
      return res.status(401).json({
        code: 401,
        success: false,
        message:
          "Please Provide QR code Reference to mark the Trasaction as cancelled.",
      });

    try {
      let whereClause_qr = {};
      whereClause_qr.is_deleted = false;
      whereClause_qr._id = ObjectId(req.body.qr_id);

      let populate = [
        {
          from: "merchants",
          let: { merchantId: "$merchant_id" },
          as: "Merchant",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$merchantId"] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
            {
              $project: {
                is_deleted: 0,
                created_at: 0,
                deleted_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "currencies",
          let: { currencyId: "$currency_id" },
          as: "Currency",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$currencyId"] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
            {
              $project: {
                is_deleted: 0,
                created_at: 0,
                deleted_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
      ];

      const executing_parameters = {
        where: whereClause_qr,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
          __v: 0,
        },
        populate: populate,
      };

      let qr = await crudServices.get(QR, executing_parameters);
      if (qr.data[0] == undefined)
        return res.status(401).json({
          code: 401,
          success: false,
          message:
            "Transaction Link does not exists to Cancel the Transaction.",
        });

      let milliseconds_until_expiry =
        601000 -
        new Date().getTime() +
        qr.data[0].qr_generation_timestamp.getTime();

      if (milliseconds_until_expiry <= 0)
        return res.status(401).json({
          code: 401,
          success: false,
          message:
            "Transaction Link already expired. It can not be marked as Cancelled Transaction.",
        });

      let transaction_reqData = {};
      transaction_reqData.sender_id = ObjectId("000000000000000000000000");
      transaction_reqData.sender_public_key = ObjectId(
        "000000000000000000000000"
      );
      transaction_reqData.merchant_id = ObjectId(qr.data[0].Merchant[0]._id);
      transaction_reqData.sender_currency_id = ObjectId(
        qr.data[0].Currency[0]._id
      );
      transaction_reqData.receiver_currency_id = ObjectId(
        qr.data[0].Currency[0]._id
      );
      transaction_reqData.sender_currency_qty = parseFloat(
        qr.data[0].currency_qty
      );
      transaction_reqData.transaction_hash =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      transaction_reqData.status_id = ObjectId("651e891bce8c4f45f6ba9d57"); // prod: 6540dd7f780dd7f21947c8e8, dev: 651e891bce8c4f45f6ba9d57

      transaction_reqData.qr_id = ObjectId(req.body.qr_id);

      let transaction_instance = await crudServices.insert(
        TransactionHistory,
        transaction_reqData
      );

      await crudServices.destroy(QR, { _id: ObjectId(req.body.qr_id) });

      return res.status(201).json({
        code: 201,
        success: false,
        message: "Transaction Cancelled.",
        data: transaction_instance,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        code: 501,
        success: false,
        message: "Internal Server Error",
        error: error,
      });
    }
  };

  const on_qr_expiry_process = async (req, res) => {
    if (req.body.qr_id == undefined || req.body.qr_id == "")
      return res.status(401).json({
        code: 401,
        success: false,
        message:
          "Please Provide Expired QR code Reference to mark the Trasaction as failed due to QR expiry.",
      });

    try {
      let whereClause_qr = {};
      whereClause_qr.is_deleted = false;
      whereClause_qr._id = ObjectId(req.body.qr_id);

      let populate = [
        {
          from: "merchants",
          let: { merchantId: "$merchant_id" },
          as: "Merchant",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$merchantId"] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
            {
              $project: {
                is_deleted: 0,
                created_at: 0,
                deleted_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "currencies",
          let: { currencyId: "$currency_id" },
          as: "Currency",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$currencyId"] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
            {
              $project: {
                is_deleted: 0,
                created_at: 0,
                deleted_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
      ];

      const executing_parameters = {
        where: whereClause_qr,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          created_at: 0,
          updated_at: 0,
          __v: 0,
        },
        populate: populate,
      };

      let qr = await crudServices.get(QR, executing_parameters);
      if (qr.data[0] == undefined)
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Transaction Link Does not exists or expired.",
        });

      if (qr.data[0].Merchant[0] == undefined)
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Merchant Does not exists.",
        });

      if (qr.data[0].Currency[0] == undefined)
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Currency does not exist.",
        });

      let transaction_reqData = {};
      transaction_reqData.sender_id = ObjectId("000000000000000000000000");
      transaction_reqData.sender_public_key = ObjectId(
        "000000000000000000000000"
      );
      transaction_reqData.merchant_id = ObjectId(qr.data[0].Merchant[0]._id);
      transaction_reqData.sender_currency_id = ObjectId(
        qr.data[0].Currency[0]._id
      );
      transaction_reqData.receiver_currency_id = ObjectId(
        qr.data[0].Currency[0]._id
      );
      transaction_reqData.sender_currency_qty = parseFloat(
        qr.data[0].currency_qty
      );
      transaction_reqData.transaction_hash =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      transaction_reqData.status_id = ObjectId("651e891bce8c4f45f6ba9d57"); // prod: 6540dd7f780dd7f21947c8e8, dev: 651e891bce8c4f45f6ba9d57

      transaction_reqData.qr_id = ObjectId(req.body.qr_id);

      let transaction_instance = await crudServices.insert(
        TransactionHistory,
        transaction_reqData
      );

      await crudServices.destroy(QR, { _id: ObjectId(req.body.qr_id) });

      return res.status(201).json({
        code: 201,
        success: true,
        message: "QR Expired. Transaction Failed.",
        data: transaction_instance,
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

  const mintToken = async (req, res) => {
    await validationService.convertIntObj(req.body);
    try {
      let response;
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause.currency_code = { $regex: new RegExp("PASS", "i") };
      const executing_parameters = {
        where: whereClause,
        projection: {
          _id: 1,
          currency_code: 1,
        },
      };

      let responseCurrency = await crudServices.get(
        Currency,
        executing_parameters
      );

      if (req.body.email_id) {
        let whereClause = {};
        whereClause.is_deleted = false;
        if (req.body.email_id) {
          whereClause.email_id = req.body.email_id;
        }
        let responseData = await crudServices.get(User, {
          where: whereClause,
          projection: {
            _id: 1,
            email_id: 1,
            public_key: 1,
          },
        });
        whereClause.is_minted = false;
        let responseUser = await crudServices.get(Investors, {
          where: whereClause,
          projection: {
            _id: 1,
            email_id: 1,
            public_key: 1,
          },
        });
        if (responseUser.data.length > 0) {
          let whereClause = {};
          whereClause.is_deleted = false;
          if (responseUser.data[0]._id) {
            whereClause.user_id = ObjectId(responseUser.data[0]._id);
          }
          const token = await Transaction.aggregate([
            {
              $match: whereClause,
            },
            {
              $group: {
                _id: null,
                totalToken: { $sum: "$token_value" },
              },
            },
          ]);

          if (token.length > 0) {
            const totalTokenValue = token[0].totalToken.toString();
            if (totalTokenValue > 0) {
              let data = await walletService.mintTokens(
                responseData.data[0].public_key,
                totalTokenValue
              );
              let final_data = {
                sender_id: "64e32ae7385abb70138edc0c", // prod : no value : need Passport user in both dev and prod
                sender_currency_qty: totalTokenValue,
                receiver_id: responseData.data[0]._id,
                receiver_public_key: responseData.data[0].public_key,
                transaction_hash: data.receipt.transactionHash,
                sender_currency_id: responseCurrency.data[0]._id,
                receiver_currency_id: responseCurrency.data[0]._id,
                cashback: 0,
              };
              response = await crudServices.insert(
                TransactionHistory,
                final_data
              );
            }
          }
          return res.status(200).json({
            code: 200,
            success: true,
            message: `Token Mint successfully`,
            data: response || {},
          });
        } else {
          return res.status(200).json({
            code: 200,
            success: true,
            message: `User is not investor`,
          });
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  const get = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query._id) {
        whereClause._id = ObjectId(req.query._id);
      }
      if (req.query.sender_id || req.query.receiver_id) {
        whereClause.$or = [];

        if (req.query.sender_id) {
          whereClause.$or.push({ sender_id: ObjectId(req.query.sender_id) });
        }

        if (req.query.receiver_id) {
          whereClause.$or.push({
            receiver_id: ObjectId(req.query.receiver_id),
          });
        }
      } else if (req.query.sender_id) {
        whereClause.sender_id = ObjectId(req.query.sender_id);
      } else if (req.query.receiver_id) {
        whereClause.receiver_id = ObjectId(req.query.receiver_id);
      }
      if (req.query.sender_currency_id) {
        whereClause.sender_currency_id = ObjectId(req.query.sender_currency_id);
      }
      if (req.query.receiver_currency_id) {
        whereClause.receiver_currency_id = ObjectId(
          req.query.receiver_currency_id
        );
      }
      if (req.query.transaction_hash) {
        whereClause.transaction_hash = req.query.transaction_hash;
      }

      const {
        query: { current_page, page_size },
      } = req;
      let skip;
      let limit;
      if (current_page && page_size) {
        skip =
          parseInt(current_page) > 0
            ? (parseInt(current_page) - 1) * parseInt(page_size)
            : 0;
        limit = parseInt(page_size);
      }

      let populate = [
        {
          from: "users",
          let: { userId: "$sender_id" },
          as: "Sender",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userId"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "merchants",
          let: { userId: "$merchant_id" },
          as: "Receiver",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userId"] },
              },
            },
            {
              $project: {
                email_id: 1,
                first_name: 1,
                last_name: 1,
                public_key: 1,
              },
            },
          ],
        },
        {
          from: "users",
          let: { userId: "$receiver_id" },
          as: "Receiver",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userId"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "currencies",
          let: { senderCurrencyId: "$sender_currency_id" },
          as: "SenderCurrency",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$senderCurrencyId"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "currencies",
          let: { receiverCurrencyId: "$receiver_currency_id" },
          as: "ReceiverCurrency",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$receiverCurrencyId"] },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
      ];

      const executing_parameters = {
        where: whereClause,
        skip: skip,
        limit: limit,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          updated_at: 0,
          __v: 0,
        },
        populate: populate,
        sortField: "_id",
      };

      let response = await crudServices.get(
        TransactionHistory,
        executing_parameters
      );

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;

      for (let i = 0; i < response.data.length; i++) {
        const transaction = response.data[i];
        if (!transaction.status) {
          if (transaction.transaction_hash) {
            const receipt = await web3.eth.getTransactionReceipt(
              transaction.transaction_hash
            );

            if (receipt) {
              if (receipt.status) {
                transaction.status = "succeeded";
              } else {
                transaction.status = "failed";
              }
            } else {
              transaction.status = "pending";
            }
          } else {
            transaction.status = "pending";
          }
        }
        if (req.query.sender_id && req.query.receiver_id) {
          if (
            transaction.sender_id &&
            transaction.sender_id.equals(ObjectId(req.query.sender_id))
          ) {
            response.data[i].transaction_type = "Out";
            if (response.data[i].Receiver.length === 0) {
              if (
                response.data[i].is_merchant_payment != undefined &&
                response.data[i].is_merchant_payment == true
              ) {
                response.data[i].Receiver = [
                  {
                    first_name: "Merchant",
                    last_name: "Pay",
                  },
                ];
              } else {
                response.data[i].Receiver = [
                  {
                    first_name: "Web3",
                    last_name: "Wallet",
                  },
                ];
              }
            }
            if (response.data[i].Sender.length === 0) {
              response.data[i].Sender = [
                {
                  first_name: "Web3",
                  last_name: "Wallet",
                },
              ];
            }
          } else if (
            transaction.receiver_id &&
            transaction.receiver_id.equals(ObjectId(req.query.receiver_id))
          ) {
            if (response.data[i].Sender.length == 0) {
              response.data[i].Sender = [
                {
                  first_name: "Web3",
                  last_name: "Wallet",
                },
              ];
            }
            if (response.data[i].Receiver.length === 0) {
              response.data[i].Receiver = [
                {
                  first_name: "Web3",
                  last_name: "Wallet",
                },
              ];
            }
            response.data[i].transaction_type = "In";
          } else {
            transaction.transaction_type = "unknown";
          }
        }
      }

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Transaction History fetched successfully.",
        data: response.data,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  const getWalletBalance = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query._id) whereClause._id = ObjectId(req.query._id);
      whereClause.currency_category_id = ObjectId("651e7979ce8c4f45f6ba9b09"); // prod: 653f9fb43f3ec4574fbb62ab, dev: 651e7979ce8c4f45f6ba9b09
      if (req.query.network) whereClause.network = req.query.network;
      if (req.query.keyword)
        whereClause.$or = [
          {
            currency_code: { $regex: new RegExp("^" + req.query.keyword, "i") },
          },
          {
            currency_address: {
              $regex: new RegExp("^" + req.query.keyword, "i"),
            },
          },
        ];
      if (req.query.currency_code)
        whereClause.currency_code = req.query.currency_code;
      if (req.query.currency_address)
        whereClause.currency_address = req.query.currency_address;

      const {
        query: { current_page, page_size },
      } = req;
      let skip;
      let limit;
      if (current_page && page_size) {
        skip =
          parseInt(current_page) > 0
            ? (parseInt(current_page) - 1) * parseInt(page_size)
            : 0;
        limit = parseInt(page_size);
      }

      const executing_parameters = {
        where: whereClause,
        skip: skip,
        limit: limit,
        projection: {
          _id: 1,
          currency_code: 1,
          currency_address: 1,
          currency_name: 1,
          currency_icon: 1,
          currency_abi: 1,
        },
      };

      let response = await crudServices.get(Currency, executing_parameters);

      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;
      const params = {
        ids: "ethereum",
        vs_currencies: "usd",
      };
      let ETH;
      axios
        .get(apiUrl, { params })
        .then((response) => {
          ETH = response.data.ethereum.usd;
        })
        .catch((error) => {
          console.error("API Error:", error);
        });
      let totalBalance = 0;

      for (let i = 0; i < response.data.length; i++) {
        let data = await walletService.getTokenBalance(
          response.data[i].currency_code,
          response.data[i].currency_address,
          req.query.user_public_key,
          response.data[i].currency_abi
        );
        if (data) {
          if (response.data[i].currency_code == "ETH") {
            response.data[i].balance = data.balanceInTokens;
            response.data[i].balance_usd = data.balanceInTokens * ETH;
            totalBalance += response.data[i].balance_usd;
          } else if (response.data[i].currency_code == "PASS") {
            response.data[i].balance = data.balanceInTokens;
            response.data[i].balance_usd = data.balanceInTokens * 1;
            totalBalance += response.data[i].balance_usd;
          } else if (response.data[i].currency_code == "USDC") {
            response.data[i].balance = data.balanceInTokens;
            response.data[i].balance_usd = data.balanceInTokens * 1;
            totalBalance += response.data[i].balance_usd;
          } else if (response.data[i].currency_code == "USDT") {
            response.data[i].balance = data.balanceInTokens;
            response.data[i].balance_usd = data.balanceInTokens * 1;
            totalBalance += response.data[i].balance_usd;
          }
        }
      }

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Currency get successfully.",
        data: response.data,
        totalBalance: totalBalance,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  const destroy = async (req, res) => {
    try {
      if (req.body.record_id) {
        await crudServices.destroy(TransactionHistory, {
          _id: req.body.record_id,
        });
        return res.status(200).json({
          code: 200,
          success: true,
          message: `Transaction History deleted successfully.`,
          data: {},
        });
      } else {
        return res.status(207).json({
          code: 207,
          success: false,
          message: `Invalid Url Parameters`,
          data: {},
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  const getCustomerRewardsTotal = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query._id) {
        whereClause._id = ObjectId(req.query._id);
      }
      if (req.query.sender_id || req.query.receiver_id) {
        whereClause.$or = [];

        if (req.query.sender_id) {
          whereClause.$or.push({ sender_id: ObjectId(req.query.sender_id) });
        }

        if (req.query.receiver_id) {
          whereClause.$or.push({
            receiver_id: ObjectId(req.query.receiver_id),
          });
        }
      } else if (req.query.sender_id) {
        whereClause.sender_id = ObjectId(req.query.sender_id);
      } else if (req.query.receiver_id) {
        whereClause.receiver_id = ObjectId(req.query.receiver_id);
      }
      if (req.query.user_id) {
        whereClause.user_id = ObjectId(req.query.user_id);
      }
      if (req.query.public_key) {
        whereClause._id = req.query.public_key;
      }
      const token = await TransactionHistory.aggregate([
        {
          $match: whereClause,
        },
        {
          $group: {
            _id: null,
            totalCashBack: { $sum: "$cashback" },
          },
        },
      ]);

      return res.status(200).json({
        code: 200,
        success: true,
        message: `Transaction get successfully.`,
        cashback: token[0] || [],
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  const getMerchantRewardsTotal = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query._id) {
        whereClause._id = ObjectId(req.query._id);
      }
      if (req.query.sender_id || req.query.receiver_id) {
        whereClause.$or = [];

        if (req.query.sender_id) {
          whereClause.$or.push({ sender_id: ObjectId(req.query.sender_id) });
        }

        if (req.query.receiver_id) {
          whereClause.$or.push({
            receiver_id: ObjectId(req.query.receiver_id),
          });
        }
      } else if (req.query.sender_id) {
        whereClause.sender_id = ObjectId(req.query.sender_id);
      } else if (req.query.receiver_id) {
        whereClause.receiver_id = ObjectId(req.query.receiver_id);
      }
      if (req.query.merchant_id) {
        whereClause.merchant_id = ObjectId(req.query.merchant_id);
      }
      if (req.query.public_key) {
        whereClause._id = req.query.public_key;
      }
      const token = await TransactionHistory.aggregate([
        {
          $match: whereClause,
        },
        {
          $group: {
            _id: null,
            totalCashBack: { $sum: "$cashback" },
          },
        },
      ]);

      return res.status(200).json({
        code: 200,
        success: true,
        message: `Transaction get successfully.`,
        cashback: token[0] || [],
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  const get_transaction_history_merchant = async (req, res) => {
    if (req.query.merchant_id == undefined || req.query.merchant_id == "")
      return res.status(401).json({
        code: 401,
        success: false,
        message: "Please Provide Merchant Id to get Transaction History.",
      });

    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause.merchant_id = ObjectId(req.query.merchant_id);

      const {
        query: { current_page, page_size },
      } = req;
      let skip;
      let limit;
      if (current_page && page_size) {
        skip =
          parseInt(current_page) > 0
            ? (parseInt(current_page) - 1) * parseInt(page_size)
            : 0;
        limit = parseInt(page_size);
      }

      let populate = [
        {
          from: "users",
          let: { userId: "$sender_id" },
          as: "Sender",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$userId"] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "merchants",
          let: { merchantId: "$merchant_id" },
          as: "Merchant",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$merchantId"] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "currencies",
          let: { currencyId: "$sender_currency_id" },
          as: "SenderCurrency",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$currencyId"] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "currencies",
          let: { currencyId: "$receiver_currency_id" },
          as: "ReceiverCurrency",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$currencyId"] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
        {
          from: "transaction_statuses",
          let: { statusId: "$status_id" },
          as: "TransactionStatus",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$statusId"] },
                    { $eq: ["$is_deleted", false] },
                  ],
                },
              },
            },
            {
              $project: {
                is_deleted: 0,
                deleted_at: 0,
                created_at: 0,
                updated_at: 0,
                __v: 0,
              },
            },
          ],
        },
      ];

      let executing_parameters = {
        where: whereClause,
        skip: skip,
        limit: limit,
        projection: {
          is_deleted: 0,
          deleted_at: 0,
          updated_at: 0,
          __v: 0,
        },
        populate: populate,
        sortField: "_id",
      };

      let transaction_list = await crudServices.get(
        TransactionHistory,
        executing_parameters
      );

      for (let i = 0; i < transaction_list.data.length; ++i) {
        transaction_list.data[i].transaction_type = "In";
      }

      let page_info = {};
      page_info.total_items = transaction_list.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(
        transaction_list.totalCount / page_size
      );
      page_info.page_size = transaction_list.data.length;

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Transaction history list fetched successfully for Merchant.",
        data: transaction_list.data,
        page_info: page_info,
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
    transferToken,
    merchantPayment,
    get,
    destroy,
    mintToken,
    getWalletBalance,
    getCustomerRewardsTotal,
    getMerchantRewardsTotal,
    user_payment_to_merchant,
    on_merchant_payment_qr_cancellation_proccess,
    on_qr_expiry_process,
    get_transaction_history_merchant,
  };
};

module.exports = WalletTransactionApi;
