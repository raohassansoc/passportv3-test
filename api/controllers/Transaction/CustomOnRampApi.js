const crudServices = require("../../services/mongo.crud.services");
const walletService = require("../../services/wallet.services");
const awsHelper = require("../../helper/awsHelper");
const Users = require("../../models/Pay/User");
const { ObjectId } = require("mongodb");
const Transaction = require("../../models/Transaction/TransactionHistory");
const TransactionHistory = require("../../models/Transaction/TransactionHistory");
const FiatTransaction = require("../../models/FiatTransaction/FiatTransaction");
const Currency = require("../../models/Master/Currency");
require("dotenv").config();
const Web3 = require("web3");
const providerUrl = process.env.PROVIDER_URL; // Replace with your Ethereum node URL or Infura API key
const web3 = new Web3(providerUrl);
const axios = require("axios");

const stripe = require("stripe")(process.env.STRIPE_API_KEY_TEST);

const CustomOnRampApi = () => {
  async function LiveFiatToCryptoRate(fiatCurrency, cryptoCurrency) {
    try {
      const fiatTocryptoRate = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoCurrency}&vs_currencies=${fiatCurrency}`
      );
      return fiatTocryptoRate;
    } catch (error) {
      console.log(error);
      throw new Error("Something Went Wrong.");
    }
  }
  async function calculateAmountToMint(amount, decimalPlaces) {
    // Ensure the input amount is a number
    if (isNaN(amount)) {
      throw new Error("Amount must be a number.");
    }

    // Ensure the decimalPlaces is a positive integer
    if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0) {
      throw new Error("Decimal places must be a non-negative integer.");
    }

    // Calculate the amount to mint
    const amountToMint = amount * 10 ** decimalPlaces;

    return amountToMint;
  }

  const CustomOnRampTransactionInitiation = async (req, res) => {
    let {
      user_id,
      fiat_amount,
      fiat_currency,
      token_id,
      crypto_currency,
      description,
    } = req.body;
    if (
      !user_id ||
      !fiat_amount ||
      !fiat_currency ||
      !token_id ||
      !crypto_currency ||
      !description
    )
      return res.status(401).json({
        code: 401,
        success: false,
        message:
          "Please Provide sufficient information to purchase the Crypto.",
      });

    try {
      // get live exchange rate
      let fTocer;
      try {
        fTocer = await LiveFiatToCryptoRate(fiat_currency, crypto_currency);
        console.log(50, fTocer.data);
      } catch (error) {
        console.log(error);
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Error While Fetching the Crypto to Fiat Exchange rate.",
          error: error,
        });
      }

      // check if sufficient crypto currency is available in the passport wallet
      let whereClause = {};
      whereClause.is_deleted = false;
      whereClause.currency_code = "USDT";

      const executing_parameters = {
        where: whereClause,
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

      let usdt_data = await walletService.getTokenBalance(
        response.data[0].currency_code,
        response.data[0].currency_address,
        process.env.PASS_PUBLIC_KEY,
        response.data[0].currency_abi
      );

      console.log(
        usdt_data.balanceInTokens,
        parseFloat(1.0 * (fiat_amount / fTocer.data.tether.usd))
      );

      if (
        usdt_data.balanceInTokens <
        parseFloat(1.0 * (fiat_amount / fTocer.data.tether.usd))
      )
        return res.status(401).json({
          code: 401,
          success: false,
          message: "Internal Server Error : NSO",
        });

      // initiate stripe payment
      // if fail send appropriate custom error message

      let address = {};
      address.line1 = "default";
      address.city = "Dubai";
      address.state = "Dubai";
      address.country = "US";
      address.postal_code = 0;

      let whereClause_user = {};
      whereClause_user.is_deleted = false;
      whereClause_user._id = ObjectId(user_id);

      let executing_parameters_user = {
        where: whereClause_user,
      };

      let User = await crudServices.get(Users, executing_parameters_user);
      console.log("147 line");
      const customer = await stripe.customers.create({
        email: User.data[0].email_id,
        source: token_id,
        name: `${User.data[0].first_name} ${User.data[0].last_name}`,
        address: address,
      });

      let charge_id;
      try {
        const payment = await stripe.charges.create({
          amount: parseInt(1.0 * fiat_amount) * 100,
          currency: fiat_currency,
          description: description,
          customer: customer.id,
        });
        charge_id = payment.id;
      } catch (error) {
        console.log(error);
        return res.status(501).json({
          code: 501,
          success: false,
          message: "Stripe Payment Failed",
          error: error.raw.message,
        });
      }

      // initiate crypto transfer of crypto_currency of token : fiat_currency/fTocer from Passprot wallet to User.data[0].public_key
      // if fail send appropriate custom error message to user and initiate stripe refund

      let reqData = {
        sender_currency_qty: parseFloat(
          1.0 * (fiat_amount / fTocer.data.tether.usd)
        ),
        sender_public_key: process.env.PASS_PUBLIC_KEY,
        receiver_public_key: User.data[0].public_key,
      };

      let sender_currency = {
        currency_address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        currency_code: "USDT",
      };

      console.log(sender_currency, "currecnyyyy");

      let transaction_reqData_p = {};
      transaction_reqData_p.sender_public_key = process.env.PASS_PUBLIC_KEY;
      transaction_reqData_p.sender_currency_id = ObjectId(
        "6538df6cedfbcd79caff35ad"
      ); // prod: 653fa1633f3ec4574fbb62b5, dev: 6538df6cedfbcd79caff35ad
      transaction_reqData_p.receiver_currency_id = ObjectId(
        "6538df6cedfbcd79caff35ad"
      ); // prod: 653fa1633f3ec4574fbb62b5, dev: 6538df6cedfbcd79caff35ad
      transaction_reqData_p.sender_currency_qty = parseFloat(
        parseFloat(1.0 * (fiat_amount / fTocer.data.tether.usd))
      );
      transaction_reqData_p.status_id = ObjectId("65449ed0188791016882b5f8"); // prod: 6540dd8f780dd7f21947c8ec, dev: 65449ed0188791016882b5f8
      transaction_reqData_p.status = "pending";
      console.log("204 line");
      let transaction_instance_p = await crudServices.insert(
        Transaction,
        transaction_reqData_p
      );
      console.log("209", transaction_instance_p, reqData);
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
        console.log("602");
        const myTokenContract = new web3.eth.Contract(
          abiJsonData,
          sender_currency.currency_address
        );
        console.log(myTokenContract);
        const gasLimit = 50000;
        const amountToMint = web3.utils.toWei(
          reqData.sender_currency_qty.toString(),
          "ether"
        );
        console.log("613");
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
          console.log(" 639hiral");
          // Example usage:
          const decimalPlaces = 6; // Replace with the actual number of decimal places for your token
          // The amount you want to send in USDT
          let amount = await calculateAmountToMint(
            reqData.sender_currency_qty,
            decimalPlaces
          );
          console.log(`Amount to mint: ${amount}`);
          const data = await myTokenContract.methods
            .transfer(reqData.receiver_public_key, amount)
            .encodeABI();

          txObject = {
            to: sender_currency.currency_address,
            data: data,
            gas: gasLimit,
            from: reqData.sender_public_key,
          };
        }

        let transaction_error = false;
        console.log(process.env.PASS_PRIVATE_KEY, "private key");

        await web3.eth.accounts
          .signTransaction(txObject, process.env.PASS_PRIVATE_KEY)
          .then((signedTx) => {
            web3.eth
              .sendSignedTransaction(signedTx.rawTransaction)
              .on("transactionHash", async (hash) => {
                console.log("Transaction hash:", hash);
                const receipt = await web3.eth.getTransactionReceipt(hash);
                console.log(receipt, "674");
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
                await crudServices.update(
                  Transaction,
                  { _id: transaction_instance_p._id },
                  { transaction_hash: hash, status: status }
                );
              })
              .on("receipt", async (receipt) => {
                console.log("Transaction receipt:", receipt);
                console.log(receipt.transactionHash);
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
                  console.error("Insufficient funds for gas");
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
              });
          })
          .catch(async (error) => {
            console.log(error, "hhh");
            transaction_error = true;
            await crudServices.update(
              Transaction,
              { _id: transaction_instance_p._id },
              { status: "failed" }
            );
            console.error("Signing error:", error);
          });

        if (transaction_error) {
          await stripe.refunds.create({
            charge: charge_id,
          });

          return res.status(500).json({
            code: 500,
            success: false,
            message:
              "There was an error while transfering the Crypto Currency to Your wallet address, Amount you have paid was initiated for Refund.",
          });
        }
      } catch (error) {
        console.log(error, "757");
        await crudServices.update(
          TransactionHistory,
          { _id: transaction_instance_p._id },
          { status: "failed" }
        );

        await stripe.refunds.create({
          charge: charge_id,
        });

        return res.status(500).json({
          code: 500,
          success: false,
          message:
            "There was an error while transfering the Crypto Currency to Your wallet address, Amount you have paid was initiated for Refund.",
        });
      }

      let fiat_transaction_reqData = {};
      fiat_transaction_reqData.user_id = ObjectId(reqData.user_id);
      fiat_transaction_reqData.fiat_transaction_type_id = ObjectId(
        "6540f941a0a03d122bcd78c4"
      ); // prod: 65410776e7e49eca803f3cc0, dev: 6540f941a0a03d122bcd78c4
      fiat_transaction_reqData.transffered_currency_name = "usd";
      fiat_transaction_reqData.transffered_currency_id = ObjectId(
        "6540fb9883ad6424485009db"
      ); // prod: 654107c1b2d0bdceccf1be4b, dev: 6540fb9883ad6424485009db
      fiat_transaction_reqData.transffered_currency_qty = fiat_amount;
      fiat_transaction_reqData.stripe_charge_id = charge_id;
      fiat_transaction_reqData.received_currency_id = ObjectId(
        "6538df6cedfbcd79caff35ad"
      ); // prod: 653fa1633f3ec4574fbb62b5, dev: 6538df6cedfbcd79caff35ad
      fiat_transaction_reqData.received_currency_qty = parseFloat(
        1.0 * (fiat_amount / fTocer.data.tether.usd)
      );

      await crudServices.insert(FiatTransaction, fiat_transaction_reqData);

      return res.status(201).json({
        code: 201,
        success: false,
        message: "Transaction Complete.",
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
    CustomOnRampTransactionInitiation,
  };
};

module.exports = CustomOnRampApi;
