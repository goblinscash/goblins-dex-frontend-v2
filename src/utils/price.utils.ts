import { ethers } from "ethers";
import { aerodromeContracts, rpcUrls } from "./config.utils";
import offchainOracleAbi from "../abi/offchainOracle.json";
import multicallAbi from "../abi/multicall.json";
import { getToken } from "./token.utils";

export const StableCoin: Record<number, string> = {
  56: "0xa44319D6232afEAa21A38b040Ca095110ad76d38", // tUSDT on BSC
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on BASE
}

export const multicallAddress: Record<number, string> = {
  56: "0xed386Fe855C1EFf2f843B910923Dd8846E45C5A4", // Uniswap V3 Multicall on BSC
  8453: "0xfee958fa595b4478cea7560c91400a98b83d6c91", // Uniswap V3 Multicall on BASE
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

      const rate = await instance.getRate(token, StableCoin[chainId], true);

      const decimals = getToken(token)?.decimals || 18; // Default to 18 decimals if not found
      const numerator = 10 ** decimals;
      const denominator = 1e18;

      return Number(rate) * numerator / denominator / 1e18;
  } catch (error) {
      console.log(error, chainId)
      return 0;
  }
};


export const getUsdRates = async (chainId: number, tokens: string[]): Promise<Record<string, number>> => {
  const result: Record<string, number> = {};
  try {
      if (tokens.length === 0) {
          return result; // Return empty object if no tokens are provided
      }

      result[StableCoin[chainId]] = 1; // Set stablecoin rate to 1

      const filteredTokens = tokens.filter(token => token.toLowerCase() !== StableCoin[chainId].toLowerCase());

      const provider = new ethers.JsonRpcProvider(rpcUrls[chainId]);
      const multicallContract = new ethers.Contract(multicallAddress[chainId], multicallAbi, provider);

      const oracleContract = new ethers.Contract(
          aerodromeContracts[chainId].offchainOracle as string,
          offchainOracleAbi,
          provider,
      );

      const calls = filteredTokens.map((token) => ({
        target: oracleContract.target,
        callData: oracleContract.interface.encodeFunctionData('getRate', [
            token,
            StableCoin[chainId],
            true,
        ]),
      }));

      // console.log(multicallContract)
      const results = await multicallContract.tryAggregate.staticCall(false, calls);
      console.log(results, 123);
      for (let i = 0; i < results.length; i++) {
          if (!results[i].success) {
              result[filteredTokens[i]] = 0; // If the call failed, set rate to 0
              continue;
          }

          const decodedRate = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], results[i].returnData).toString();

          const decimals = getToken(filteredTokens[i])?.decimals || 18; // Default to 18 decimals if not found
          const numerator = 10 ** decimals;
          const denominator = 1e18;

          result[filteredTokens[i]] = Number(decodedRate) * numerator / denominator / 1e18;
      }

      return result;
  } catch (error) {
      console.log(error, chainId)
      return {};
  }
};