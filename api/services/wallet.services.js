const Web3 = require("web3");
const token = require("../../Pass.json");
const contractABI = token.abi; // Replace with your contract ABI
const contractAddress = process.env.PASS_TOKEN_CONTRACT_ADDRESS; // Replace with your contract address
require("dotenv").config();
const providerUrl = process.env.PROVIDER_URL; // Replace with your Ethereum node URL or Infura API key
const web3 = new Web3(providerUrl);
const myTokenContract = new web3.eth.Contract(contractABI, contractAddress);
const passOwnerPrivateKey = process.env.PASS_PRIVATE_KEY; // Replace with the private key of the contract owner
const passOwnerPublicKey = process.env.PASS_PUBLIC_KEY;
const crypto = require("crypto");
const axios = require("axios");

async function transferTokens(senderPrivateKey, reqData, sender_currency) {
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
    const TokenContract = new web3.eth.Contract(
      abiJsonData,
      sender_currency.currency_address
    );
    const gasLimit = 300000;
    console.log(reqData.sender_currency_qty);
    const amountToMint = web3.utils.toWei(
      reqData.sender_currency_qty.toString(),
      "ether"
    );
    let txObject;
    if (sender_currency.currency_code == "ETH") {
      txObject = {
        to: reqData.receiver_public_key,
        value: amountToMint,
        gas: gasLimit,
        from: reqData.sender_public_key,
      };
    } else {
      const data = await TokenContract.methods
        .transfer(reqData.receiver_public_key, amountToMint)
        .encodeABI();

      txObject = {
        to: sender_currency.currency_address,
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
          .on("transactionHash", (hash) => {
            console.log("Transaction hash:", hash);
          })
          .on("receipt", (receipt) => {
            console.log("Transaction receipt:", receipt);
            return {
              receipt,
            };
          })
          .on("error", (error) => {
            if (error.message.includes("insufficient funds")) {
              console.error("Insufficient funds for gas", error);
              return {
                error,
              };
            } else {
              console.error("Transaction error:", error);
              return {
                error,
              };
            }
          });
      })
      .catch((error) => {
        console.error("Signing error:", error);
      });
    return {
    };
  } catch (error) {
    console.log(error);
    return error;
  }
}
async function getTokenBalance(
  currency_code,
  currency_address,
  user_public_key,
  currency_abi
) {
  try {
    let abiJsonData = [
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "balance",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ];
    const url = currency_abi;
    let jsonData;
    await axios
      .get(url)
      .then((response) => {
        jsonData = response.data;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    let final_currency_address = web3.utils.toChecksumAddress(currency_address);
    const myTokenContract = new web3.eth.Contract(
      abiJsonData,
      final_currency_address
    );
    let balanceInTokens;
    if (currency_code == "ETH") {
      const balanceWei = await web3.eth.getBalance(user_public_key);
      balanceInTokens = web3.utils.fromWei(balanceWei, "ether");
    } else {
      const balanceInWei = await myTokenContract.methods
        .balanceOf(user_public_key)
        .call();
      if (currency_code == "USDT" || currency_code == "USDC") {
        const precision = 6;
        balanceInTokens = balanceInWei / Math.pow(10, precision);
        balanceInTokens = balanceInTokens.toString();
        console.log(balanceInTokens, "hiral");
      }
      else {
        balanceInTokens = web3.utils.fromWei(balanceInWei, "ether");

      }
      console.log(`Token balance of ${balanceInTokens} TOKENS`);
    }
    return {
      balanceInTokens,
    };
  } catch (error) {
    return { balanceInTokens: "0" };
  }
}

async function mintTokens(receiverPublicKey, amountToMint) {
  const gasPrice = await web3.eth.getGasPrice();
  console.log(gasPrice);
  const gasLimit = 300000; // Adjust gas limit based on your contract's complexity
  let amountToMintToken = web3.utils.toWei(amountToMint.toString(), "ether");
  const mintTx = await myTokenContract.methods.mint(
    receiverPublicKey,
    amountToMintToken
  );

  const txObject = {
    to: contractAddress,
    data: mintTx.encodeABI(),
    gas: gasLimit,
    gasPrice: gasPrice,
    from: passOwnerPublicKey,
  };
  console.log("hello");
  try {
    const signedTx = await web3.eth.accounts.signTransaction(
      txObject,
      passOwnerPrivateKey
    );
    console.log("jjjj");
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );

    console.log("Tokens minted successfully. Transaction receipt:", receipt);
    return {
      receipt,
    };
  } catch (error) {
    console.log(error, "finalerror");
  }
}
async function onRampSign(map) {
  class HmacUtil {
    static hmac256(key, msg) {
      const mac = crypto.createHmac("sha256", key);
      const data = mac.update(msg).digest("hex").toLowerCase();
      return data;
    }

    static getStringToSign(params) {
      const treeMap = new Map(Object.entries(params).sort());
      let s2s = "";

      for (const [k, v] of treeMap) {
        if (!k || typeof v === "object") {
          continue;
        }
        if (v !== null && v !== undefined && String(v)) {
          s2s += `${k}=${v}&`;
        }
      }
      return s2s.slice(0, -1);
    }
  }

  const appid = process.env.alchemypay_app_id;
  const alchemypay_secret_key = process.env.alchemypay_secret_key;
  // The actual call needs to update the parameters. This is only an example to demonstrate that the signature verification passed.

  map.appid = appid;
  const sign = HmacUtil.getStringToSign(map);
  const hmac256Sign = HmacUtil.hmac256(alchemypay_secret_key, sign);

  return hmac256Sign;
}

module.exports = {
  transferTokens,
  mintTokens,
  getTokenBalance,
  onRampSign,
};
