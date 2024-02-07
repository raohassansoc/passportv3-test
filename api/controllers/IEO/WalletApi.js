const Web3 = require("web3");
const token = require("../../../Pass.json");
const validationService = require("../../services/validation.service");
const crudServices = require("../../services/mongo.crud.services");
const { walletSchemas, transferSchemas } = require("../../schemas/IeoSchemas");
const contractABI = token.abi; // Replace with your contract ABI
const contractAddress = "0x2091baB09ABc7Df5662fa756dce26E3Afe51E5f1"; // Replace with your contract address
const providerUrl =
  "https://sepolia.infura.io/v3/4ca7f7208ad84483b2eb48ef1c1d8de9"; // Replace with your Ethereum node URL or Infura API key

const web3 = new Web3(providerUrl);
const myTokenContract = new web3.eth.Contract(contractABI, contractAddress);
const ownerPrivateKey =
  "0x16df2001d07f2830b11b2d9b708efa03e46a9b3d9493e0930f30af90a4f456ba"; // Replace with the private key of the contract owner
const ownerAddress = "0x2fa2A15165a22dDdEE52C15309DD4A996D6A3d85";
const awsHelper = require("../../helper/awsHelper");
const Transaction = require("../../models/IEO/Transaction");
const TransactionHistory = require("../../models/Transaction/TransactionHistory");
const Equity = require("../../models/IEO/Equity");
const { ObjectId } = require("mongodb");
const Users = require("../../models/Pay/User");

const WalletApi = () => {
  const userPayment = async (req, res) => {
    validationService
      .validate(req.body, walletSchemas)
      .then(async (reqData) => {
        try {
          async function mintTokens() {
            const gasPrice = await web3.eth.getGasPrice();
            console.log(gasPrice);
            const gasLimit = 300000; // Adjust gas limit based on your contract's complexity
            const nonOwnerAddress = reqData.user_public_key; // Replace with the address of the non-owner user receiving the tokens

            const amountToMint = web3.utils.toWei(
              JSON.stringify(reqData.amount),
              "ether"
            );

            const mintTx = await myTokenContract.methods.mint(
              nonOwnerAddress,
              amountToMint
            );

            const txObject = {
              to: contractAddress,
              data: mintTx.encodeABI(),
              gas: gasLimit,
              gasPrice: gasPrice,
              from: ownerAddress,
            };
            try {
              const signedTx = await web3.eth.accounts.signTransaction(
                txObject,
                ownerPrivateKey
              );
              const receipt = await web3.eth.sendSignedTransaction(
                signedTx.rawTransaction
              );

              console.log(
                "Tokens minted successfully. Transaction receipt:",
                receipt.transactionHash
              );
              let data = {
                transaction_hash: receipt.transactionHash,
                public_key: reqData.user_public_key,
                user_id: reqData.user_id,
                value: reqData.amount,
                from: ownerAddress,
                to: reqData.user_public_key,
                is_type: true,
              };
              let response = await crudServices.insert(Transaction, data);
              console.log(response);
              let equityData = {
                user_id: reqData.user_id,
                public_key: reqData.user_public_key,
                equity: reqData.equityPercentage,
                bonus_equity: reqData.equityBonus,
              };
              let responseEquity = await crudServices.insert(
                Equity,
                equityData
              );
              console.log(responseEquity);

              return res.status(201).json({
                code: 200,
                success: true,
                message: `Tokens minted successfully.`,
                data: receipt || {},
              });
            } catch (error) {
              return res.status(500).json({
                code: 500,
                success: false,
                message: "Internal Server Error",
                error: error,
              });
            }
          }
          mintTokens();
        } catch (error) {
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

  const getWalletBalance = async (req, res) => {
    validationService
      .validate(req.body, walletSchemas)
      .then(async (reqData) => {
        try {
          const balanceInWei = await myTokenContract.methods
            .balanceOf(reqData.user_public_key)
            .call();
          const balanceInTokens = web3.utils.fromWei(balanceInWei, "ether");
          console.log(
            `Token balance of ${reqData.user_public_key}: ${balanceInTokens} TOKENS`
          );
          return res.status(201).json({
            code: 200,
            success: true,
            message: `Tokens balance get successfully.`,
            data: balanceInTokens || {},
          });
        } catch (error) {
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

  const getTransaction = async (req, res) => {
    try {
      let whereClause = {};
      whereClause.is_deleted = false;
      if (req.query.keyword) {
        whereClause.email_id = { $regex: req.query.keyword, $options: "i" };
      }
      if (req.query._id) {
        whereClause._id = req.query._id;
      }
      if (req.query.public_key) {
        whereClause._id = req.query.public_key;
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
      let response = await crudServices.get(Transaction, {
        where: whereClause,
        projection: {
          _id: 1,
          public_key: 1,
          user_id: 1,
          transaction_hash: 1,
          value: 1,
          from: 1,
          to: 1,
          is_type: 1,
        },
        skip: skip,
        limit: limit,
      });
      let page_info = {};
      page_info.total_items = response.totalCount;
      page_info.current_page = parseInt(current_page);
      page_info.total_pages = Math.ceil(response.totalCount / page_size);
      page_info.page_size = response.data.length;
      return res.status(200).json({
        code: 200,
        success: true,
        message: `Transaction get successfully.`,
        data: response.data,
        page_info: page_info,
      });
    } catch (error) {
      console.log(error);
      return res.status(501).json(error);
    }
  };

  const transferToken = async (req, res) => {
    console.log(req.body);
    validationService
      .validate(req.body, transferSchemas)
      .then(async (reqData) => {
        try {
          const secretName = `${reqData._id}_private`;
          const secretNamePublic = `${reqData._id}_public`;
          const senderPrivateKey = await awsHelper.retrieveSecret(secretName);
          let whereClause = {};
          whereClause.is_deleted = false;
          whereClause._id = ObjectId(req.query._id);
          let exec_params = {
            where: whereClause,
          };
          let sender = await crudServices.get(Users, exec_params);
          const senderPublicKey = sender.data[0].public_key;
          async function transfer() {
            const gasLimit = 300000;
            const amountToMint = web3.utils.toWei(reqData.amount, "ether");
            const data = await myTokenContract.methods
              .transfer(reqData.recipient_public_key, amountToMint)
              .encodeABI();

            const txObject = {
              to: contractAddress,
              data: data,
              gas: gasLimit,
              from: ownerAddress,
            };
            try {
              const signedTx = await web3.eth.accounts.signTransaction(
                txObject,
                senderPrivateKey
              );
              const receipt = await web3.eth.sendSignedTransaction(
                signedTx.rawTransaction
              );

              const receiver = crudServices.get(Users, {
                public_key: reqData.recipient_public_key,
              });
              const transaction_record = {
                sender_id: reqData._id,
                sender_publick_key: senderPublicKey,
                sender_currency_id: ObjectId("64d372d77c586b8c38261930"),
                receiver_id: receiver._id,
                receiver_public_key: reqData.recipient_public_key,
                receiver_currency_id: ObjectId("64d372d77c586b8c38261930"),
                currency_qty: reqData.amount,
                currency_current_valuation: 1,
                transaction_hash: receipt.transactionHash,
              };
              const saved_transaction = crudServices.insert(
                TransactionHistory,
                transaction_record
              );
              return res.status(201).json({
                code: 200,
                success: true,
                message: `Tokens transfered successfully.`,
                data: receipt || {},
              });
            } catch (error) {
              console.log(error);
              return res.status(500).json({
                code: 500,
                success: false,
                message: "Internal Server Error",
                error: error,
              });
            }
          }
          transfer();
        } catch (error) {
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
  }; // <--

  const swapToken = async (req, res) => {
    validationService
      .validate(req.body, transferSchemas)
      .then(async (reqData) => {
        try {
          const { ethers } = require("ethers");
          const dotenv = require("dotenv");
          const { legos } = require("@studydefi/money-legos");
          dotenv.config();
          const WETH = "0xfff9976782d46cc05630d1f6ebab18b2324d6b14";
          const DAI = "0x3e622317f8c93f7328350cf0b56d9ed4c620c5d6";
          const router = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
          console.log("Swapping started");
          const provider = new ethers.providers.JsonRpcProvider(providerUrl);
          const wallet = new ethers.Wallet(ownerPrivateKey, provider);
          const routerContract = new ethers.Contract(
            router,
            [
              "function getAmountsOut(uint256 amountIn, address[] memory path) public view returns(uint[] memory amounts)",
              "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
              "function WETH() external pure returns (address)",
            ],
            wallet
          );
          const wethContract = new ethers.Contract(
            WETH,
            [
              "function approve(address spender, uint256 amount) external returns (bool)",
            ],
            wallet
          );

          const DAIamountIn = ethers.utils.parseUnits("10", 18);
          console.log(
            `DAI amount to swap: ${ethers.utils
              .formatUnits(DAIamountIn, 18)
              .toString()}`
          );

          // Add more logging here to print the path array and other parameters to debug
          console.log("Path:", [DAI, WETH]);
          const WETHamountIn = ethers.utils.parseUnits(".01", 18);
          const amounts = await routerContract.getAmountsOut(WETHamountIn, [
            WETH,
            DAI,
          ]);
          const DAIamountOutMin = amounts[1].sub(amounts[1].div(10));

          console.log(
            `WETH amount to swap: ${ethers.utils
              .formatUnits(WETHamountIn, 18)
              .toString()}`
          );
          console.log(
            `Minimum DAI expected: ${ethers.utils
              .formatUnits(DAIamountOutMin, 18)
              .toString()}`
          );

          // Approve WETH token spending by the router contract
          const approveTx = await wethContract.approve(router, WETHamountIn);

          // Increase the deadline time to allow more time for transaction inclusion
          const deadline = Date.now() + 1000 * 60 * 30; // 30 minutes from the current time

          // Swap WETH for DAI
          const swapTx = await routerContract.swapExactTokensForTokens(
            WETHamountIn,
            DAIamountOutMin,
            [WETH, DAI],
            wallet.address,
            deadline
          );

          // Wait for the transaction to be mined
          const tx = await swapTx.wait();
          console.log("Transaction successful:", tx);
          console.log("Swap Tx Hash:", swapTx.hash);

          return res.status(200).json({
            code: 2000,
            success: true,
            message: `Swap successfully.`,
          });
        } catch (error) {
          console.error("Error:", error);
          return res.status(500).json({
            code: 5000,
            success: false,
            message: "An error occurred during the swap.",
            error: error.message,
          });
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

  return {
    userPayment,
    getWalletBalance,
    transferToken,
    swapToken,
    getTransaction,
  };
};
module.exports = WalletApi;
