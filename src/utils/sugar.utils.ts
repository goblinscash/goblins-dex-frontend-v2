import { ethers } from "ethers";
import { aerodromeContracts, rpcUrls } from "./config.utils";

import lpSugarAbi from "../abi/sugar/lpSugar.json"
import { formatValue, fromUnits } from "./math.utils";
// import erc20Abi from "../abi/erc20.json"
// import { toUnits } from "./math.utils";

export type FormattedPool = {
    lp: string;
    symbol: string;
    decimals: number;
    liquidity: number;
    type: number;
    tick: number;
    sqrt_ratio: number;
    token0: string;
    reserve0: number;
    staked0: number;
    token1: string;
    reserve1: number;
    staked1: number;
    gauge: string;
    gauge_liquidity: number;
    gauge_alive: boolean;
    fee: string;
    bribe: string;
    factory: string;
    emissions: number;
    emissions_token: string;
    pool_fee: number;
    unstaked_fee: number;
    token0_fees: number;
    token1_fees: number;
    nfpm: string;
    alm: string;
    root: string;
    poolBalance: number;
    apr: number;
    volume: number;
};


export const all = async (chainId: number, limit: number, offset: number) => {
   try {
    const instance = new ethers.Contract(
        aerodromeContracts[chainId].lpSugar as string,
        lpSugarAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );

    const poolsRaw = await instance.all(limit, offset);

    //@ts-expect-error ignore warning
    const formattedPools = poolsRaw.map((pool, index) => ({
        id:index,
        lp: pool[0],
        symbol: pool[1],
        decimals: formatValue(pool[2]),
        liquidity: formatValue(pool[3]),
        type: formatValue(pool[4]),
        tick: formatValue(pool[5]),
        sqrt_ratio: formatValue(pool[6]),
        token0: pool[7],
        reserve0: formatValue(pool[8]),
        staked0: formatValue(pool[9]),
        token1: pool[10],
        reserve1: formatValue(pool[11]),
        staked1: formatValue(pool[12]),
        gauge: pool[13],
        gauge_liquidity: formatValue(pool[14]),
        gauge_alive: pool[15],
        fee: pool[16],
        bribe: pool[17],
        factory: pool[18],
        emissions: formatValue(pool[19]),
        emissions_token: pool[20],
        pool_fee: formatValue(pool[21]),
        unstaked_fee: formatValue(pool[22]),
        token0_fees: formatValue(pool[23]),
        token1_fees: formatValue(pool[24]),
        nfpm: pool[25],
        alm: pool[26],
        root: pool[27],
        // Custom fields
        poolBalance: Number(fromUnits(pool[8], Number(pool[2]))) + Number(fromUnits(pool[11], Number(pool[2]))),
        apr: 0,
        volume: 0,
        url: `/deposit?id=${index}&token0=${pool[7]}&token1=${pool[10]}`
    }));

    return formattedPools;
   } catch (error) {
    console.log(error, chainId)
    return []
   }
};

export const byIndex = async (chainId: number, index:number) => {
    try {
     const instance = new ethers.Contract(
         aerodromeContracts[chainId].lpSugar as string,
         lpSugarAbi,
         new ethers.JsonRpcProvider(rpcUrls[chainId])
     );
 
     const pool = await instance.byIndex(index);
 
     const formattedPools = {
         lp: pool[0],
         symbol: pool[1],
         decimals: formatValue(pool[2]),
         liquidity: formatValue(pool[3]),
         type: formatValue(pool[4]),
         tick: formatValue(pool[5]),
         sqrt_ratio: formatValue(pool[6]),
         token0: pool[7],
         reserve0: formatValue(pool[8]),
         staked0: formatValue(pool[9]),
         token1: pool[10],
         reserve1: formatValue(pool[11]),
         staked1: formatValue(pool[12]),
         gauge: pool[13],
         gauge_liquidity: formatValue(pool[14]),
         gauge_alive: pool[15],
         fee: pool[16],
         bribe: pool[17],
         factory: pool[18],
         emissions: formatValue(pool[19]),
         emissions_token: pool[20],
         pool_fee: formatValue(pool[21]),
         unstaked_fee: formatValue(pool[22]),
         token0_fees: formatValue(pool[23]),
         token1_fees: formatValue(pool[24]),
         nfpm: pool[25],
         alm: pool[26],
         root: pool[27],
         // Custom fields
         poolBalance: Number(fromUnits(pool[8], Number(pool[2]))) + Number(fromUnits(pool[11], Number(pool[2]))),
         apr: 0,
         volume: 0,
     }
 
     // // await positions(chainId, limit, offset, "0xe47C11e16783eE272117f8959dF3ceEC606C045d")
     // const positionsRaw = await instance.positions(100, 0, "0x892Ff98a46e5bd141E2D12618f4B2Fe6284debac")
  
      console.log(formattedPools, "formattedPools")
 
     return formattedPools;
    } catch (error) {
     console.log(error, chainId)
     return []
    }
 };

export const positions = async (chainId: number, limit: number, offset: number, account: string) => {
    try {
     const instance = new ethers.Contract(
         aerodromeContracts[chainId].lpSugar as string,
         lpSugarAbi,
         new ethers.JsonRpcProvider(rpcUrls[chainId])
     );
 
     const positionsRaw = await instance.positions(limit, offset, account)
 
     console.log(positionsRaw, "positionsRaw")
    
    } catch (error) {
     console.log(error, chainId)
     return []
    }
 };

export const aprSugar = () => { return 0}
export const volume = () => { return 0}
export const totalFees = () => { return 0}
export const poolFeePercentage = () => { return 0}
export const volumePct = () => { return 0}



