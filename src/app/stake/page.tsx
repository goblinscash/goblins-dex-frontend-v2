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
import { add } from 'lodash';
import { getToken } from '@/utils/token.utils';

// Pool data
const poolData = {
  token0: {
    symbol: "DEGEN",
    iconColor: "purple-600"
  },
  token1: {
    symbol: "Bonk",
    iconColor: "yellow-500"
  },
  fee: "0.3%",
  type: "Basic Volatile",
  labelName: 'Stake'
};

// Initial token data
const depositTokens = {
  token0: {
    symbol: "DEGEN",
    amount: "13.53",
    usdValue: "~$0.07565",
    iconColor: "purple-600"
  },
  token1: {
    symbol: "Bonk",
    amount: "2,957.35",
    usdValue: "~$0.0",
    iconColor: "yellow-500"
  }
};


type StakeDetails = {
  lp: string;
  token0: string;
  token1: string;
  token0Name: string;
  token1Name: string;
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
};

const StakePage = () => {
  const [stakePercentage, setStakePercentage] = useState(100);
  const [pool, setPool] = useState<FormattedPool | null>(null);

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

    console.log("Deposits by account: ", pool, position)

    //@ts-expect-error ignore
    const position_: Position = position.find((position_: Position) => position_.lp === pool.lp)

    const token0 = getToken(pool.token0)!;
    const token1 = getToken(pool.token1)!;
    const rewardToken = getToken(pool.emissions_token);

    const stakeInfo = {
      lp: pool.lp,
      token0: pool.token0,
      token1: pool.token1,
      token0Name: token0.name,
      token1Name: token1?.name,
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
    } as StakeDetails;

    setStakeDetails(stakeInfo)
  }


  useEffect(() => {
    if (chainId && id && address) {
      fetchUserPosition(chainId, Number(id))
    }
  }, [searchParams, chainId, id, address]);

  console.log("pool+++++>>>>>>>>>>>", stakeDetails)

  // Fee notice message
  const feeNoticeMessage = "10% of fees generated from unstaked deposits is distributed to pool voters.";

  return (
    <div className='container px-3 py-5 flex flex-col grow h-full min-h-[55vh]'>
      <div className='flex flex-col gap-8 mx-auto'>
        {/* Stake Header */}
        <div className="">
          {/* Pool Info Card Component */}
          <PoolInfoCard
            token0={poolData.token0}
            token1={poolData.token1}
            fee={poolData.fee}
            type={poolData.type}
            labelName={poolData.labelName}
          />

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
            <TokenAmountCard
              tokenSymbol={depositTokens.token0.symbol}
              amount={depositTokens.token0.amount}
              usdValue={depositTokens.token0.usdValue}
              iconColor={depositTokens.token0.iconColor}
            />

            <TokenAmountCard
              tokenSymbol={depositTokens.token1.symbol}
              amount={depositTokens.token1.amount}
              usdValue={depositTokens.token1.usdValue}
              iconColor={depositTokens.token1.iconColor}
            />
          </div>

          {/* Fee Notice Component */}
          <FeeNotice message={feeNoticeMessage} />

          {/* Stake Button */}
          <button className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors">
            Stake
          </button>
        </div>
      </div>
    </div>
  );
};

export default StakePage; 