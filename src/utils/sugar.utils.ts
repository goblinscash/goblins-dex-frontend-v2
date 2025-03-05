import { ethers } from "ethers";
import { aerodromeContracts, rpcUrls } from "./config.utils";

import lpSugarAbi from "../abi/sugar/lpSugar.json"
import { formatValue } from "./math.utils";
// import erc20Abi from "../abi/erc20.json"
// import { toUnits } from "./math.utils";


export const all = async (chainId: number, limit: number, offset: number) => {
   try {
    const instance = new ethers.Contract(
        aerodromeContracts[chainId].lpSugar as string,
        lpSugarAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );

    // const alm = await instance.alm_factory()
    // console.log(alm, "almmm")

    const poolsRaw = await instance.all(limit, offset);

    //@ts-expect-error ignore warning
    const formattedPools = poolsRaw.map(pool => ({
        poolAddress: pool[0],
        name: pool[1],
        decimals: formatValue(pool[2]),
        totalSupply: formatValue(pool[3]),
        fee: formatValue(pool[4]),
        adminFee: formatValue(pool[5]),
        protocolFee: formatValue(pool[6]),
        token0: pool[7],
        reserves0: formatValue(pool[8]),
        reserves1: formatValue(pool[9]),
        token1: pool[10],
        token0Balance: formatValue(pool[11]),
        token1Balance: formatValue(pool[12]),
        factory: pool[13],
        isStable: formatValue(pool[14]),
        gauge: pool[15],
        bribe: pool[16],
        voter: pool[17],
        emissions: pool[18],
        feeReceiver: formatValue(pool[19]),
        weight: pool[20],
        claimable0: formatValue(pool[21]),
        claimable1: formatValue(pool[22]),
        liquidity: formatValue(pool[23]),
        swapFees: formatValue(pool[24]),
        token0Gauge: pool[25],
        token1Gauge: pool[26],
        claimableReward: pool[27]
    }));

    console.log(formattedPools, "Formatted Pool Data");

    return formattedPools;
   } catch (error) {
    console.log(error, "+++++++++++++++++++", chainId, rpcUrls[chainId])
    return []
   }
};

