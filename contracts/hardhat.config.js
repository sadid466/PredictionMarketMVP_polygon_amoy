require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// We are switching to Ankr, which is much more stable for Windows users
const RPC_URL = "https://rpc.ankr.com/polygon_amoy";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

module.exports = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      // We are adding a higher timeout to prevent the "snap" crash
      timeout: 60000, 
    },
  },
};