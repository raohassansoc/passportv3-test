require("dotenv").config();
const Web3 = require("web3");
const token = require("./Pass.json");
const contractABI = token.abi; // Replace with your contract ABI
const contractAddress = "0x627Bd849E69880bCB26FC03888F77BFED1C24093"; // Replace with your contract address
const { Alchemy, Network, AlchemySubscription } = require("alchemy-sdk");


const providerUrl = "wss://sepolia.infura.io/ws/v3/4ca7f7208ad84483b2eb48ef1c1d8de9"; // Replace with your Ethereum node URL or Infura API key
const web3 = new Web3(providerUrl);
// Create a contract instance
const myContract = new web3.eth.Contract(contractABI, contractAddress);
const settings = {
    apiKey: "W-qMA3Ay-3qX-bX6bZ74okKU6TLRAyvr", // Replace with your Alchemy API Key
    network: Network.ETH_MAINNET, // Replace with your network
};
const alchemy = new Alchemy(settings);
// Create a map to store user WebSocket connections
const userSockets = new Map();
const userMapper = new Map();

function getLiveData(io) {
    console.log("socket testing");
    // Listen for WebSocket connections
    io.on("connection", (socket) => {
        console.log("A client connected");


        socket.on("login", (userId) => {
            userSockets.set(userId, socket);
            console.log(
                `User ${userId} logged in and userSocket for this user is saved in User Map.`
            );
        });


        socket.on("subscribeToBalanceLiveUpdate", ({ userPublicKey, userId }) => {
            console.log(
                `User with Public Key ${userPublicKey} has subscribed to get live notification in case of transaction occur from or to his account.`
            );
            userMapper.set(userPublicKey, userId);
            subscribeToUserBalance(userPublicKey);
        });

        // Handle client disconnect
        socket.on("disconnect", () => {
            console.log("A client disconnected");
            //  removing user information from both the maps logic
        });
    });


    // Subscribe to user-specific balance updates
    function subscribeToUserBalance(userPublicKey) {
        myContract.events
            .allEvents()
            .on("data", (event) => {
                const user_id = userMapper.get(userPublicKey);
                const userSocket = userSockets.get(user_id);
                if (
                    userPublicKey == event.returnValues.from ||
                    userPublicKey == event.returnValues.to
                ) {
                    userSocket.emit("balanceUpdate", event.returnValues);
                }
            })
            .on("error", (error) => {
                console.error("Error:", error);
            });

        // Replace this with the address you want to monitor
        // Set up a filter to watch incoming transactions to your address
        if (userPublicKey) {
            alchemy.ws.on(
                {
                    method: AlchemySubscription.PENDING_TRANSACTIONS,
                    toAddress: userPublicKey, // Replace with address to send  pending transactions to this address
                },
                async (tx) => {
                    console.log(tx);
                    const userSocket = userSockets.get(userId);
                    if (userId == tx.from || userId == tx.to) {
                        userSocket.emit("balanceUpdate", tx.returnValues);

                        // Use setTimeout to delay the execution of the emitBalanceUpdate function
                    }
                }
            );
        }
    }
}

module.exports = { userSockets, userMapper, getLiveData };

