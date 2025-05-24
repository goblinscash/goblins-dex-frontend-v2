"use client";
import React, { useEffect, useState } from 'react';
import StakeSlider from './StakeSlider';
import TokenAmountCard from './TokenAmountCard';
import PoolInfoCard from './PoolInfoCard';
import DepositInfoCard from './DepositInfoCard';
import FeeNotice from './FeeNotice';
import { byIndex, FormattedPool, PoolTypeMap, Position, positions } from '@/utils/sugar.utils';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useAccount, useChainId } from 'wagmi';
import { useSearchParams } from 'next/navigation';
import { getToken, Token } from '@/utils/token.utils';
import { approve } from '@/utils/web3.utils';
import { zeroAddr } from '@/utils/config.utils';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import guageAbi from "@/abi/aerodrome/gauge.json"
import { toUnits } from '@/utils/math.utils';
import ActButton from '@/components/common/ActButton';
import Notify from '@/components/common/Notify';

const feeNoticeMessage = "10% of fees generated from unstaked deposits is distributed to pool voters.";

type StakeDetails = {
  lp: string;
  liquidity: number;
  token0: Token;
  token1: Token;
  fee: string;
  type: string;
  token0Amount: string;
  token1Amount: string;
  unstaked0Amount: string;
  unstaked1Amount: string;
  apr: string;
  emissionsToken: string;
  emissionsAmount: string;
  tradingFees0: string;
  tradingFees1: string;
  depositedUsd: string;
  poolTotalUsd: string;
  gauge: string;
  gauge_alive: boolean;
  gauge_liquidity: number;
};

const StakePage = () => {
  const [stakePercentage, setStakePercentage] = useState(100);
  const [load, setLoad] = useState<{ [key: string]: boolean }>({});
  const signer = useEthersSigner();
  const chainId = useChainId();
  const { address } = useAccount();

  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [stakeDetails, setStakeDetails] = useState<StakeDetails>();


  const fetchUserPosition = async (chainId: number, index: number) => {
    if (!address) return
    //@ts-expect-error ignore
    const [pool, position]: [FormattedPool, Position[]] = await Promise.all([byIndex(chainId, index), positions(chainId, 100, 0, address)]);

    //@ts-expect-error ignore
    const position_: Position = position.find((position_: Position) => position_.lp === pool.lp)

    const token0 = getToken(pool.token0)!;
    const token1 = getToken(pool.token1)!;
    const rewardToken = getToken(pool.emissions_token);

    console.log(token0, "Deposits by account: ", pool)

    const stakeInfo = {
      lp: pool.lp,
      liquidity: Number(position_.liquidity) / 10 ** 18,
      token0: token0,
      token1: token1,
      fee: pool.pool_fee || "",
      type: PoolTypeMap[String(pool.type)],
      token0Amount: String(Number(position_.amount0) / 10 ** token0.decimals),
      token1Amount: String(Number(position_.amount1) / 10 ** token1.decimals),
      unstaked0Amount: String(Number(position_.staked0) / 10 ** token0.decimals),
      unstaked1Amount: String(Number(position_.staked1) / 10 ** token1.decimals),
      apr: `${pool.apr}%`,
      emissionsToken: rewardToken?.symbol ?? "",
      emissionsAmount: rewardToken ? String(Number(position_.emissions_earned) / 10 ** rewardToken.decimals) : "",
      tradingFees0: String(Number(position_.unstaked_earned0) / 10 ** token0.decimals),
      tradingFees1: String(Number(position_.unstaked_earned1) / 10 ** token1.decimals),
      depositedUsd: `$${(parseFloat(String(pool.poolBalance).replace("$", "")) * Number(position_.liquidity) / pool.liquidity).toFixed(2)}`,
      poolTotalUsd: `${pool.poolBalance}`,
      gauge: pool.gauge,
      gauge_alive: pool.gauge_alive,
      gauge_liquidity: pool.gauge_liquidity
    } as StakeDetails;

    setStakeDetails(stakeInfo)
  }


  useEffect(() => {
    if (chainId && id && address) {
      fetchUserPosition(chainId, Number(id))
    }
  }, [searchParams, chainId, id, address]);


  const handleLoad = (action: string, status: boolean) => {
    setLoad((prev) => ({ ...prev, [action]: status }));
  };

  const stake = async () => {
    try {
      if (!address) return toast.warn("Please connect your wallet");
      if (stakeDetails?.gauge == zeroAddr) return toast.warn("Gauge is not available for this pool")
      if (stakeDetails?.liquidity == 0) return toast.warn("You dont have lp token to stake");
      if (!stakeDetails?.lp) return;

      handleLoad("Stake", true);

      const tx0Approve = await approve(
        stakeDetails?.lp,
        await signer,
        stakeDetails?.gauge,
        stakeDetails.liquidity,
        18
      );
      if (tx0Approve) {
        await tx0Approve.wait();
      }


      const gaugeInstance = new ethers.Contract(
        stakeDetails.gauge,
        guageAbi,
        await signer
      );

      const tx = await gaugeInstance["deposit(uint256)"](
        toUnits(stakeDetails.liquidity, 18),
        {
          gasLimit: 5000000
        }
      );


      await tx.wait()
      Notify({ chainId, txhash: tx.hash });
      handleLoad("Stake", false);
    } catch (error) {
      console.log(error);
      handleLoad("Stake", false);
    }

  }

  const unstake = async () => {
    try {
      if (!address) return toast.warn("Please connect your wallet");
      if (stakeDetails?.gauge == zeroAddr) return toast.warn("Gauge is not available for this pool")
      if (stakeDetails?.liquidity != 0 || !stakeDetails?.gauge_liquidity) return;

      handleLoad("Unstake", true);

      const gaugeInstance = new ethers.Contract(
        stakeDetails.gauge,
        guageAbi,
        await signer
      );

      const tx = await gaugeInstance.withdraw(
        stakeDetails.gauge_liquidity,
        {
          gasLimit: 5000000
        }
      );


      await tx.wait()
      Notify({ chainId, txhash: tx.hash });
      handleLoad("Unstake", false);
    } catch (error) {
      console.log(error);
      handleLoad("Unstake", false);
    }

  }

  console.log("pool+++++>>>>>>>>>>>", stakeDetails)

  return (
    <div className='container px-3 py-5 flex flex-col grow h-full min-h-[55vh]'>
      <div className='flex flex-col gap-8 mx-auto'>
        {/* Stake Header */}
        <div className="">
          {/* Pool Info Card Component */}
          {
            stakeDetails && <PoolInfoCard
              chainId={chainId}
              token0={stakeDetails.token0.address}
              token0Name={stakeDetails.token0.symbol}
              token1={stakeDetails.token1.address}
              token1Name={stakeDetails.token1.symbol}
              fee={`${Number(stakeDetails.fee) / 100}%`}
              type={stakeDetails.type}
              labelName="Stake"
            />
          }

          {/* Deposit Info Card Component */}
          <DepositInfoCard
            depositId={0}
            depositValue="~$0.07565"
          />
        </div>

        {/* Staking Amount Section */}
        <div className=" space-y-5 rounded-2xl border border-[#2A2A2A] p-5 sm:space-y-8 sm:p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Staking amount</h2>
          </div>

          {/* Staking Slider Component */}
          <StakeSlider
            initialPercentage={stakePercentage}
            onChange={(value) => setStakePercentage(value)}
          />

          {/* Token Amounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {stakeDetails && <TokenAmountCard
              chainId={chainId}
              token={stakeDetails.token0.address}
              tokenSymbol={stakeDetails?.token0.name}
              amount={stakeDetails.token0Amount}
              // usdValue={'0'}
              iconColor="purple-600"
            />}

            {stakeDetails && <TokenAmountCard
              chainId={chainId}
              token={stakeDetails.token1.address}
              tokenSymbol={stakeDetails?.token1.name}
              amount={stakeDetails.token1Amount}
              // usdValue={'0'}
              iconColor="yellow-500"
            />}
          </div>

          {/* Fee Notice Component */}
          <FeeNotice message={feeNoticeMessage} />

          <ActButton
            label="stake"
            onClick={() => stake()}
            load={load["Stake"]}
          />
          <ActButton
            label="Unstake"
            onClick={() => unstake()}
            load={load["Unstake"]}
          />


        </div>

      </div>
    </div>
  );
};

export default StakePage; 