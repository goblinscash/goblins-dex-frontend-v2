import { ethers } from "ethers";
import { aerodromeContracts, rpcUrls } from "./config.utils";
import { formatValue, fromUnits } from "./math.utils";
import { FormattedPool } from "./sugar.utils";
import offchainOracleAbi from "../abi/offchainOracle.json";

export const StableCoin: Record<number, string> = {
  56: "0xa44319d6232afeaa21a38b040ca095110ad76d38", // tUSDT on BSC
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on BASE
}

export const getUsdPrice = async (chainId: number, token: string, amount: number): Promise<number> => {
  const rate = await getUsdRate(chainId, token);
  return rate * amount;
};

export const getUsdRate = async (chainId: number, token: string): Promise<number> => {
  if (token.toLowerCase() === StableCoin[chainId].toLowerCase()) {
    return 1; // If the token is the stablecoin, return the amount directly
  }

  try {
      const instance = new ethers.Contract(
          aerodromeContracts[chainId].offchainOracle as string,
          offchainOracleAbi,
          new ethers.JsonRpcProvider(rpcUrls[chainId])
      );

      console.log(token, StableCoin[chainId], chainId);
      const rate = await instance.getRate(token, StableCoin[chainId], true);
      const formattedRate = Number(fromUnits(rate, 18));
      return formattedRate;
  } catch (error) {
      console.log(error, chainId)
      return 0;
  }
};