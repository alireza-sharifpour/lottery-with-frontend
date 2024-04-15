"use client";

import { cookieStorage, createConfig, createStorage } from "wagmi";
import abi from "../artifacts/contracts/Lottery.sol/Lottery.json";
import { sepolia } from "viem/chains";
import { readContract } from "@wagmi/core";
import { safe, walletConnect } from "@wagmi/connectors";
import { createClient, http } from "viem";
import { useEffect, useState } from "react";

export const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID!;

export const wagmiConfig = createConfig({
  chains: [sepolia], // required
  connectors: [
    walletConnect({
      projectId,
    }),
  ],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});

const LotteryFE = () => {
  const [isLotteryStarted, setIsLotteryStarted] = useState(false);
  const contract = async () => {
    const hasLotteryStarted = await readContract(wagmiConfig, {
      address: "0xe60A3AB663f98B1E966343bc3C3C2bB80da6A9d7",
      abi: abi.abi,
      functionName: "betsOpen",
    });
    console.log("contract", hasLotteryStarted);
    setIsLotteryStarted(hasLotteryStarted as boolean);
  };

  useEffect(() => {
    contract();
  }, []);

  return (
    <div>
      <h3>Has the lottery started? {isLotteryStarted ? "Yes" : "No"}</h3>
    </div>
  );
};

export default LotteryFE;
