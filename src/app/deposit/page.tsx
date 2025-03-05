"use client";
import React, { useState } from 'react'
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useAccount, useChainId } from 'wagmi';
import ActButton from '@/components/common/ActButton';
import { toUnits } from '@/utils/math.utils';
import { approve } from '@/utils/web3.utils';
import { aerodromeContracts } from '@/utils/config.utils';
import aerodromeRouterAbi from '../../abi/aerodromeRouter.json';
import { ethers } from 'ethers';

const Deposit = () => {
    const [load, setLoad] = useState<{ [key: string]: boolean }>({});

    const signer = useEthersSigner();
    const chainId = useChainId();
    const { address } = useAccount();

    const handleLoad = (action: string, status: boolean) => {
        setLoad((prev) => ({ ...prev, [action]: status }));
    };

    const addLiquidity = async () => {
        try {
            if (!address) return alert('Please connect your wallet')
            handleLoad("addLiquidity", true)
            const token0 = "0xf1220b3Bb3839e6f4e5dF59321fbaD2981c1CE89";
            const token1 = "0x8B56D59cd9b1Ce5dd1Fb2A4e3cA7FBE3043Be42F";
            const stable = false;
            const amount0Desired = toUnits(1500, 18);
            const amount1Desired = toUnits(2000, 18);
            const amount0Min = 0;
            const amount1Min = 0;
            const to = address;
            const deadline = Math.floor(Date.now() / 1000) + 600;

            const tx0Approve = await approve(
                token0,
                await signer,
                aerodromeContracts[chainId].router,
                1000,
                18
            );
            if (tx0Approve) {
                await tx0Approve.wait();
            }

            const tx1Approve = await approve(
                token1,
                await signer,
                aerodromeContracts[chainId].router,
                1200,
                18
            );
            if (tx1Approve) {
                await tx1Approve.wait();
            }

            const aerodromeRouter = new ethers.Contract(
                aerodromeContracts[chainId].router,
                aerodromeRouterAbi,
                await signer
            );

            const tx = await aerodromeRouter.addLiquidity(
                token0,
                token1,
                stable,
                amount0Desired,
                amount1Desired,
                amount0Min,
                amount1Min,
                to,
                deadline,
                { gasLimit: 5000000 }
            );

            await tx.wait();

            handleLoad('addLiquidity', false);
        } catch (error) {
            console.log(error)
            handleLoad('addLiquidity', false);
        }
    }

    return (
        <div>
            <ActButton label="addLiquidity" onClick={() => addLiquidity()} load={load["addLiquidity"]} />
        </div>
    )
}

export default Deposit