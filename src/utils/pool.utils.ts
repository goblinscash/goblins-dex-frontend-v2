import { fromUnits } from "./math.utils";
import { getUsdPrice, getUsdRate } from "./price.utils";
import { FormattedPool } from "./sugar.utils";
import { getToken } from "./token.utils";

export const calculateVolume = async (chainId: number, pool: FormattedPool) => {
  const poolFee = Number(pool.pool_fee)
  const pool_fee_percentage = poolFee
  const token0 = getToken(pool.token0)
  const token1 = getToken(pool.token1)

  if (!poolFee || poolFee === 0) return 0;

  const volumePct = 100 / pool_fee_percentage;

  // const token0Fees = await getUsdPrice(chainId, pool.token0, Number(pool.token0_fees) / 10**18)
  // const token1Fees = await getUsdPrice(chainId, pool.token0, Number(pool.token1_fees) / 10**6)

  const token0Fees = Number(pool.token0_fees) / 10 ** (token0?.decimals ?? 18)
  const token1Fees = Number(pool.token1_fees) / 10 ** (token1?.decimals ?? 18)

  const volume = volumePct * (token0Fees + token1Fees);

  return Number(volume.toFixed(3));
}


export const calculateAPR = (chainId: number, pool: FormattedPool, rates: Record<string, number>) => {
  console.log("hellooooooo")
  const SECONDS_PER_DAY = 86400;

  const emissions = Number(pool.emissions) / 10**18; // per second in USD
  const reserve0 = Number(pool.reserve0);
  const reserve1 = Number(pool.reserve1);
  const liquidity = Number(pool.liquidity) / 10**18; // total pool token supply
  const gaugeLiquidity = Number(pool.gauge_liquidity) / 10**18;; // staked pool tokens

  const token0 = getToken(pool.token0)
  const token1 = getToken(pool.token1)

  const token0Rate = rates[pool.token0]
  const token1Rate = rates[pool.token1]


  // Compute TVL in USD
  const tvl = (Number(fromUnits(reserve0, Number(token0?.decimals))) * token0Rate) + (Number(fromUnits(reserve1, Number(token1?.decimals))) * token1Rate);

  // Defensive checks
  if (!emissions || !tvl || !liquidity || !gaugeLiquidity) return 0;

  // Calculate daily reward in USD
  const rewardPerDay = emissions * SECONDS_PER_DAY;

  // Calculate staked percentage and staked TVL
  const stakedPct = gaugeLiquidity / liquidity;
  const stakedTVL = tvl * stakedPct;

  if (stakedTVL === 0) return 0;

  console.log(emissions, "gaugeLiquiditygaugeLiquiditygaugeLiquidity",tvl, gaugeLiquidity, "99", liquidity, "___",rewardPerDay, stakedTVL)

  // Final APR
  const apr = (Number(rewardPerDay) / stakedTVL) * 365;
  return Number(apr.toFixed(3));
}
