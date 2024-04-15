import {
  createPublicClient,
  http,
  createWalletClient,
  formatEther,
  toHex,
  Address,
  parseEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import {
  abi as lotteryAbi,
  bytecode as lotteryBytecode,
} from "../artifacts/contracts/Lottery.sol/Lottery.json";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerPrivateKey = process.env.PRIVATE_KEY || "";

const BET_PRICE = "1";
const BET_FEE = "0.2";
const TOKEN_RATIO = 1n;

async function main() {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
  const blockNumber = await publicClient.getBlockNumber();
  console.log("Last block number:", blockNumber);
  const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
  const deployer = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
  console.log("Deployer address:", deployer.account.address);
  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  console.log(
    "Deployer balance:",
    formatEther(balance),
    deployer.chain.nativeCurrency.symbol
  );

  console.log("\nDeploying Lottery contract");

  const hash = await deployer.deployContract({
    abi: lotteryAbi,
    bytecode: lotteryBytecode as Address, // Removed incorrect casting to Address
    args: [
      "LotteryToken",
      "LT0",
      TOKEN_RATIO,
      parseEther(BET_PRICE),
      parseEther(BET_FEE),
    ],
  });

  console.log("Transaction hash:", hash);
  console.log("Waiting for confirmations...");
  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
  });
  console.log("Lottery contract deployed to:", receipt.contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// ➜  contracts npx ts-node --files ./scripts/DeployWithViem.ts
// Last block number: 5703241n
// Deployer address: 0x7bdBF5b04AfE0f8Ef0840bCF7F0323638b316D6E
// Deployer balance: 0.955895188823626825 ETH

// Deploying Lottery contract
// Transaction hash: 0x445bde649edf88eee96f37fa43af99090aff99e910b11d2fc57f91920f548319
// Waiting for confirmations...
// Lottery contract deployed to: 0xe60a3ab663f98b1e966343bc3c3c2bb80da6a9d7
