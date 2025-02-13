// "use client";

// import { useEthersSigner } from "@/hooks/useEthersSigner";
// import { UniswapContract, uniswapContracts, vfatContracts, zeroAddr } from "@/utils/config.utils";
// import { getDepositParams } from "@/utils/farmData.utils";
// import { ethers } from "ethers";
// import farmStrategyAbi from "../../abi/farmStrategy.json"
// import { useAccount, useChainId } from "wagmi";
// import { fetchNftBalance, fetchPosition } from "@/utils/web3.utils";
// import { toUnits } from "@/utils/math.utils";

// const page = () => {
//     const signer = useEthersSigner();
//     const chainId = useChainId()
//     const { address } = useAccount()

//     const amount0Desired = toUnits(1000, 18)
//     const amount1Desired = toUnits(1000, 18)
//     const amount0Min = 0
//     const amount1Min = 0

//     const deposit = async () => {
//         console.log(chainId, "chain")
//         await fetchPosition(chainId, 12254)
//         await fetchNftBalance(chainId, address)
//         if (!chainId) return null
//         const uniswapContract = uniswapContracts[Number(chainId)] as UniswapContract;
//         const tokenId = 0
//         const token0 = "0x067Fe9C33b6c1B4750ED60357d25b9Eb29Ef8c7f"
//         const token1 = "0x6AE97D8132619521bf16256a2cEEA4850866d496"

//         const pool = "0xF9f6FE6d14c0F8653F35a4e8A3875a489f2AF0Ff"
//         const zero = zeroAddr
//         const tickLower = -120
//         const tickUpper = 120
//         const fee = 3000

//         const { params, settings, sweepTokens, approved, referralCode } = getDepositParams(
//             uniswapContract.nfpm as string,
//             tokenId,
//             token0,
//             token1,
//             amount0Desired,
//             amount1Desired,
//             amount0Min,
//             amount1Min,
//             pool,
//             zero,
//             tickLower,
//             tickUpper,
//             fee
//         );


//         try {
//             const nftFarmStrategy = new ethers.Contract(vfatContracts[Number(chainId)].NftFarmStrategy as string,
//                 farmStrategyAbi,
//                 await signer);

//             const tx = await nftFarmStrategy.deposit(
//                 params,
//                 settings,
//                 sweepTokens,
//                 approved,
//                 referralCode,
//                 { gasLimit: 8000000 }
//             );

//             console.log("Transaction Hash:", tx.hash);
//             await tx.wait();
//             console.log("Deposit Successful!");
//         } catch (error) {
//             console.error("Transaction Failed:", error?.message);
//         }
//     }
//     return (
//         <>
//             <div>Yeild</div>
//             <button onClick={() => deposit()}>deposit</button>
//         </>
//     )
// }

// export default page

import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page