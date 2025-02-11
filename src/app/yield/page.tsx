"use client";

import { useEthersSigner } from "@/hooks/useEthersSigner";
import { uniswapContracts, vfatContracts, zeroAddr } from "@/utils/config.utils";
import { getDepositParams } from "@/utils/farmData.utils";
import { ethers } from "ethers";
import farmStrategyAbi from "../../abi/farmStrategy.json"
import { useAccount, useChainId } from "wagmi";

const page = () => {
    const signer = useEthersSigner();
    const chainId  = useChainId()
    const { address } = useAccount()

    const amount0Desired = ethers.parseUnits("1000", 18).toString();
    const amount1Desired = ethers.parseUnits("1000", 18).toString();
    const amount0Min = ethers.parseUnits("583.622018870502157692", 18).toString();
    const amount1Min = ethers.parseUnits("581.537516819099281181", 18).toString();

    const deposit = async () => {
        console.log(chainId, "chain")
        if (!chainId) return null
        const _uniswapContract = uniswapContracts[Number(chainId)];
        const nfpm = "0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2" // _uniswapContract.nfpm
        const tokenId = 0
        const token0 = "0x067Fe9C33b6c1B4750ED60357d25b9Eb29Ef8c7f"
        const token1 = "0x6AE97D8132619521bf16256a2cEEA4850866d496"

        const pool = "0xF9f6FE6d14c0F8653F35a4e8A3875a489f2AF0Ff"
        const zero = zeroAddr
        const tickLower = -120
        const tickUpper = 120
        const fee = 3000

        // const { params, settings, sweepTokens, approved, referralCode } = getDepositParams(
        //     //@ts-ignore ignore type 
        //     nfpm,
        //     tokenId,
        //     token0,
        //     token1,
        //     amount0Desired,
        //     amount1Desired,
        //     amount0Min,
        //     amount1Min,
        //     pool,
        //     zero,
        //     tickLower,
        //     tickUpper,
        //     fee
        // );

        // console.log(settings, "settings++")

        const params = {
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
                        tokenId: 0,
                        pool: {
                            token0: token0,
                            token1: token1,
                            fee: 3000
                        },
                        tickLower: -120,
                        tickUpper: 120,
                        amount0Desired: amount0Desired,
                        amount1Desired: amount1Desired,
                        amount0Min: amount0Min,
                        amount1Min: amount1Min,
                        deadline: Math.floor(Date.now() / 1000) + 600,
                        extraData: "0x"
                    }
                },
                tokensIn: [token0, token1],
                amountsIn: [amount0Desired, amount1Desired],
                extraData: "0x"
            }
        };
    
        // Define the `settings` struct
        const settings = {
            pool: pool,
            autoRebalance: false,
            rebalanceConfig: {
                tickSpacesBelow: 0,
                tickSpacesAbove: 0,
                bufferTicksBelow: 0,
                bufferTicksAbove: 0,
                dustBP: 0,
                priceImpactBP: 0,
                slippageBP: 0,
                cutoffTickLow: 0,
                cutoffTickHigh: 0,
                delayMin: 0,
                rewardConfig: {
                    rewardBehavior: 0,
                    harvestTokenOut: zero
                }
            },
            automateRewards: false,
            rewardConfig: {
                rewardBehavior: 0,
                harvestTokenOut: zero
            },
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
    
        const sweepTokens = [token1];
        const approved = zero;
        const referralCode = ethers.encodeBytes32String("REF123");

        try {
            const nftFarmStrategy =  new ethers.Contract(uniswapContracts[Number(chainId)].nfpm as string,
                 farmStrategyAbi,
                  await signer);
            const tx = await nftFarmStrategy.deposit(
                params,
                settings,
                sweepTokens,
                approved,
                referralCode,
                { gasLimit: 8000000 } // Increased gas limit
            );
    
            console.log("Transaction Hash:", tx.hash);
            await tx.wait();
            console.log("Deposit Successful!");
        } catch (error) {
            console.error("Transaction Failed:", error?.message);
        }
    }
    return (
        <>
            <div>Yeild</div>
            <button onClick={() => deposit()}>deposit</button>
        </>
    )
}

export default page