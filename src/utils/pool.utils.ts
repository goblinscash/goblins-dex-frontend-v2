import { FormattedPool } from "./sugar.utils";

export const calculateVolume = (pool: FormattedPool): number => {
    // Convert pool_fee to a regular number
    const poolFee =  Number(pool.pool_fee)
  
    if (!poolFee || poolFee === 0) return 0;
  
    const volumePct = 100 / poolFee;
  
    const token0Fees =  Number(pool.token0_fees) 
    const token1Fees = Number(pool.token1_fees)
  
    const volume = volumePct * (token0Fees + token1Fees);
    return volume;
  }
  

  export const calculateAPR = (pool: FormattedPool) => {
    const SECONDS_PER_DAY = 86400;
  
    const emissions = Number(pool.emissions); // per second in USD
    const reserve0 = Number(pool.reserve0);
    const reserve1 = Number(pool.reserve1);
    const liquidity = Number(pool.liquidity); // total pool token supply
    const gaugeLiquidity = Number(pool.gauge_liquidity); // staked pool tokens
  
    // Compute TVL in USD
    const tvl = reserve0 + reserve1;
  
    // Defensive checks
    if (!emissions || !tvl || !liquidity || !gaugeLiquidity) return 0;
  
    // Calculate daily reward in USD
    const rewardPerDay = emissions * SECONDS_PER_DAY;
  
    // Calculate staked percentage and staked TVL
    const stakedPct = gaugeLiquidity / liquidity;
    const stakedTVL = tvl * stakedPct;
  
    if (stakedTVL === 0) return 0;
  
    // Final APR
    const apr = (rewardPerDay / stakedTVL) * 100 * 365;
    return apr;
  }
  