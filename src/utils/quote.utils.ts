import axios from "axios";
import { UNI_ROUTING_API_URL } from "./constant.utils";

export const getUniswapQuote = async (
  chain: number, 
  tokenIn: string, 
  tokenOut: string, 
  decimals: number
): Promise<string | null> => {
  try {
    const amount = 1 * 10 ** decimals;

    const params = {
      tokenInAddress: tokenIn,
      tokenInChainId: chain,
      tokenOutAddress: tokenOut,
      tokenOutChainId: chain,
      amount: amount.toString(),
      type: "exactIn",
    };

    const result = await axios.get<{ quoteDecimals: string }>(`${UNI_ROUTING_API_URL}/quote`, { params });

    return parseFloat(result.data?.quoteDecimals).toFixed(2);
  } catch (error) {
    console.log(error)
    return null;
  }
};
