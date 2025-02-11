import { BigNumberish, ethers } from "ethers";
import {
    DepositParams,
    DepositReturn,
    HarvestParams,
    RewardConfig,
    SettingsConfig
} from "./farmDataInterface.utils";
import { MAX_UINT_128 } from "./constant.utils";

export const getDepositParams = (
    nfpm: string,
    tokenId: number,
    token0: string,
    token1: string,
    amount0Desired: BigNumberish,
    amount1Desired: BigNumberish,
    amount0Min: BigNumberish,
    amount1Min: BigNumberish,
    pool: string,
    zero: string,
    tickLower: number,
    tickUpper: number,
    fee: number
): DepositReturn => {
    const rewardConfig: RewardConfig = {
        rewardBehavior: 0,
        harvestTokenOut: zero
    };

    const params: DepositParams = {
        farm: {
            stakingContract: nfpm,
            poolIndex: 0
        },
        nft: nfpm,
        increase: {
            zap: {
                swaps: [],
                addLiquidityParams: {
                    nft: nfpm,
                    tokenId: tokenId,
                    pool: {
                        token0: token0,
                        token1: token1,
                        fee: fee
                    },
                    tickLower: tickLower,
                    tickUpper: tickUpper,
                    amount0Desired: amount0Desired.toString(),
                    amount1Desired: amount1Desired.toString(),
                    amount0Min: amount0Min.toString(),
                    amount1Min: amount1Min.toString(),
                    deadline: Math.floor(Date.now() / 1000) + 600,
                    extraData: "0x"
                }
            },
            tokensIn: [token0, token1],
            amountsIn: [amount0Desired.toString(), amount1Desired.toString()],
            extraData: "0x"
        }
    };

    const settings: SettingsConfig = {
        pool: pool,
        autoRebalance: false,
        rebalanceConfig: {
            rewardBehavior: 0, 
            harvestTokenOut: zero,
            rewardConfig: {
                rewardBehavior: 0,  
                harvestTokenOut: zero
            },
            tickSpacesBelow: 0,
            tickSpacesAbove: 0,
            bufferTicksBelow: 0,
            bufferTicksAbove: 0,
            dustBP: 0,
            priceImpactBP: 0,
            slippageBP: 0,
            cutoffTickLow: 0,
            cutoffTickHigh: 0,
            delayMin: 0
        },
        automateRewards: false,
        rewardConfig, 
        autoExit: false,
        exitConfig: {
            triggerTickLow: 0,
            triggerTickHigh: 0,
            exitTokenOutLow: zero,
            exitTokenOutHigh: zero,
            priceImpactBP: 0,
            slippageBP: 0
        }
    }; 

    const sweepTokens = [token0, token1];
    const referralCode = ethers.AbiCoder.defaultAbiCoder().encode(["string"], ["REF123"]);

    return { params, settings, sweepTokens, approved: zero, referralCode };
};


export const getHarvestParams = ({
    stakingContract,
    tokenId,
    rewardTokens,
    outputTokens,
    sweepTokens,
    amount0Max = MAX_UINT_128,
    amount1Max = MAX_UINT_128
}: HarvestParams) => {
    return {
        position: {
            farm: {
                stakingContract,
                poolIndex: 0
            },
            nft: stakingContract,
            tokenId
        },
        params: {
            harvest: {
                rewardTokens,
                amount0Max,
                amount1Max,
                extraData: "0x00"
            },
            swaps: [],
            outputTokens,
            sweepTokens
        }
    };
};
