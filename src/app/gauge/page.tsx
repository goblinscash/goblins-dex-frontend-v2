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
import { approve, fetchV3Position } from '@/utils/web3.utils';
import { aerodromeContracts, zeroAddr } from '@/utils/config.utils';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import guageAbi from "@/abi/aerodrome/gauge.json"
import { fromUnits, toUnits } from '@/utils/math.utils';
import ActButton from '@/components/common/ActButton';
import Notify from '@/components/common/Notify';
import aerodromeRouterAbi from "@/abi/aerodrome/router.json"
import nfpmAbi from "@/abi/aerodrome/nfpm.json"
import clGaugeAbi from "@/abi/aerodrome/clGauge.json"

const feeNoticeMessage = "10% of fees generated from unstaked deposits is distributed to pool voters.";
type LiquidityPosition = {
  nonce: string;
  operator: string;
  token0: string;
  token1: string;
  fee: string;
  tickLower: string;
  tickUpper: string;
  liquidity: string;
  feeGrowthInside0LastX128: string;
  feeGrowthInside1LastX128: string;
  tokensOwed0: string;
  tokensOwed1: string;
  lp: string;
} & Position;

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
type ActiveStakeInfo = {
  activeVersion?: string;
  pool?: FormattedPool;
  position?: Position | LiquidityPosition;
};



const StakePage = () => {
  const [stakePercentage, setStakePercentage] = useState(100);
  const [stakingAction, setStakingAction] = useState<string | null>(null);
  const [load, setLoad] = useState<{ [key: string]: boolean }>({});
  const [activeStakeInfo, setActiveStakeInfo] = useState<ActiveStakeInfo>({});
  const signer = useEthersSigner();
  const chainId = useChainId();
  const { address } = useAccount();

  const searchParams = useSearchParams();
  const _position = Number(searchParams.get("position"))
  const id = searchParams.get("id");
  const [stakeDetails, setStakeDetails] = useState<StakeDetails>();


  const fetchUserPosition = async (chainId: number, index: number) => {
    if (!address) return
    let activeStake: ActiveStakeInfo;


    if (_position > 0) {
      const v3Position: LiquidityPosition = await fetchV3Position(chainId, Number(searchParams.get("position")));
      //@ts-expect-error ignore
      const [pool]: [FormattedPool] = await Promise.all([byIndex(chainId, index)]);
      console.log(v3Position, "resulkt");
      setActiveStakeInfo((prevState) => ({
        ...prevState,
        position: v3Position,
        activeVersion: "v3",
        pool

      }))
      activeStake = {
        position: v3Position,
        activeVersion: "v3",
        pool
      }
    }
    else {
      //@ts-expect-error ignore
      const [pool, position]: [FormattedPool, Position[]] = await Promise.all([byIndex(chainId, index), positions(chainId, 100, 0, address)]);
      console.log(pool, "poolpool", position)
      //@ts-expect-error ignore
      const position_: Position = position.find((position_: Position) => position_.lp === pool.lp)
      setActiveStakeInfo((prevState) => ({
        ...prevState,
        position: position_,
        activeVersion: "v2",
        pool

      }))
      activeStake = {
        position: position_,
        activeVersion: "v2",
        pool
      }
    }

    const token0 = getToken(activeStake?.pool!.token0)!;
    const token1 = getToken(activeStake?.pool!.token1)!;
    const rewardToken = getToken(activeStake.pool!.emissions_token);

    const stakeInfo = {
      lp: activeStake.pool!.lp,
      liquidity: Number(activeStake.position!.liquidity) / 10 ** 18,
      token0: token0,
      token1: token1,
      fee: activeStake.pool!.fee || "",
      type: PoolTypeMap[String(activeStake.pool!.type)],
      //@ts-expect-error ignore
      token0Amount: activeStake?.pool.type > 0 ? fromUnits(activeStake?.pool.reserve0, token0.decimals) : fromUnits(activeStake.position?.amount0 || 0 , token0.decimals),
      //@ts-expect-error ignore
      token1Amount: activeStake?.pool.type > 0 ? fromUnits(activeStake?.pool.reserve1, token1.decimals) : fromUnits(activeStake.position?.amount1 || 0, token1.decimals),
      unstaked0Amount: fromUnits(activeStake.position?.staked0 || 0, token0.decimals),
      unstaked1Amount: fromUnits(activeStake.position?.staked1 || 0, token1.decimals),
      apr: `${activeStake.pool!.apr}%`,
      emissionsToken: rewardToken?.symbol ?? "",
      emissionsAmount: rewardToken ? String(Number(activeStake.position?.emissions_earned || 0) / 10 ** rewardToken.decimals) : "",
      tradingFees0: String(Number(activeStake.position?.unstaked_earned0 || 0) / 10 ** token0.decimals),
      tradingFees1: String(Number(activeStake.position?.unstaked_earned1 || 0) / 10 ** token1.decimals),
      depositedUsd: `$${(parseFloat(String(activeStake.pool!.poolBalance).replace("$", "")) * Number(activeStake.position!.liquidity) / activeStake.pool!.liquidity).toFixed(2)}`,
      poolTotalUsd: `${activeStake.pool!.poolBalance}`,
      gauge: activeStake.pool!.gauge,
      gauge_alive: activeStake.pool!.gauge_alive,
      gauge_liquidity: activeStake.pool!.gauge_liquidity
    } as StakeDetails;

    setStakeDetails(stakeInfo)
  }


  useEffect(() => {
    if (chainId && id && address) {
      fetchUserPosition(chainId, Number(id))
    }

    if (Boolean(searchParams.get("withdraw"))) {
      setStakingAction("withdraw");

    }
    if (Boolean(searchParams.get("stake"))) {
      setStakingAction("stake");

    }

  }, [searchParams, chainId, id, address]);

  console.log(stakingAction, "stakingAction")
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
        toUnits((stakeDetails.liquidity * stakePercentage) / 100, 18),
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

  const removeV2Liquidity = async () => {
    try {
      if (!address) return alert("Please connect your wallet");
      if (!stakeDetails) return

      handleLoad("RemoveLiquidity", true);
      const amount0Min = toUnits(stakeDetails?.token0Amount, stakeDetails.token0?.decimals);
      const amount1Min = toUnits(stakeDetails?.token0Amount, stakeDetails.token1?.decimals);
      const to = address;
      const deadline = Math.floor(Date.now() / 1000) + 600;
      const stable = stakeDetails.type.includes("Volatile") ? false : true

      const tx0Approve = await approve(
        stakeDetails?.lp,
        await signer,
        aerodromeContracts[chainId].router,
        stakeDetails.liquidity,
        18
      );
      if (tx0Approve) {
        await tx0Approve.wait();
      }

      const aerodromeRouter = new ethers.Contract(
        aerodromeContracts[chainId].router,
        aerodromeRouterAbi,
        await signer
      );

      const tx = await aerodromeRouter.removeLiquidity(
        stakeDetails.token0.address,
        stakeDetails.token1.address,
        stable,
        toUnits(stakeDetails.liquidity, 18),
        amount0Min,
        amount1Min,
        to,
        deadline,
        { gasLimit: 5000000 }
      );

      await tx.wait();

      handleLoad("RemoveLiquidity", false);
    } catch (error) {
      console.log(error);
      handleLoad("RemoveLiquidity", false);
    }
  };

  const clStake = async () => {
    try {
      if (!address) return toast.warn("Please connect your wallet");
      if (stakeDetails?.gauge == zeroAddr) return toast.warn("Gauge is not available for this pool")
      if (_position == 0) return toast.warn("You dont have lp position to stake");
      if(!stakeDetails) return

      handleLoad("ClStake", true);


      const nfpmInstance = new ethers.Contract(
        aerodromeContracts[chainId].nfpm,
        nfpmAbi,
        await signer
      )

      const txApprove = await nfpmInstance.approve(stakeDetails?.gauge, _position)
      await txApprove.wait()

      const gaugeInstance = new ethers.Contract(
        stakeDetails.gauge,
        clGaugeAbi,
        await signer
      );

      const tx = await gaugeInstance.deposit(
        _position,
        {
          gasLimit: 5000000
        }
      );


      await tx.wait()
      Notify({ chainId, txhash: tx.hash });
      handleLoad("ClStake", false);
    } catch (error) {
      console.log(error);
      handleLoad("ClStake", false);
    }

  }

  const clUnstake = async () => {
    try {
      if (!address) return toast.warn("Please connect your wallet");
      if (stakeDetails?.gauge == zeroAddr) return toast.warn("Gauge is not available for this pool")
      // if (_position == 0) return toast.warn("You dont have lp position to stake");
      if(!stakeDetails) return

      handleLoad("ClUnstake", true);

      const gaugeInstance = new ethers.Contract(
        stakeDetails.gauge,
        clGaugeAbi,
        await signer
      );

      const tx = await gaugeInstance.withdraw(
        _position,
        {
          gasLimit: 5000000
        }
      );


      await tx.wait()
      Notify({ chainId, txhash: tx.hash });
      handleLoad("ClUnstake", false);
    } catch (error) {
      console.log(error);
      handleLoad("ClUnstake", false);
    }

  }


  console.log("pool+++++>>>>>>>>>>>", stakeDetails , activeStakeInfo)

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
            position={searchParams.get("position") != null && Number(searchParams.get("position")) > 0 ? true : false}
          />

          {/* Token Amounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {stakeDetails && <TokenAmountCard
              chainId={chainId}
              token={stakeDetails.token0.address}
              tokenSymbol={stakeDetails?.token0.name}
              amount={(Number(stakeDetails.token0Amount) * stakePercentage) / 100}
              // usdValue={'0'}
              iconColor="purple-600"
            />}

            {stakeDetails && <TokenAmountCard
              chainId={chainId}
              token={stakeDetails.token1.address}
              tokenSymbol={stakeDetails?.token1.name}
              amount={(Number(stakeDetails.token1Amount) * stakePercentage) / 100}
              // usdValue={'0'}
              iconColor="yellow-500"
            />}
          </div>

          {/* Fee Notice Component */}
          <FeeNotice message={feeNoticeMessage} />

          <ActButton
            label="stake"
            onClick={() => _position > 0 ? clStake() : stake()}
            load={_position > 0 ? load['ClStake'] : load["Stake"]}
            disableBtn={stakingAction == "withdraw"}

          />
          <ActButton
            label="Unstake"
            onClick={() => unstake()}
            load={load["Unstake"]}
            disableBtn={stakingAction == "stake"}

          />

          {_position == 0 && <ActButton
            label="RemoveLiquidity"
            onClick={() => removeV2Liquidity()}
            load={load["RemoveLiquidity"]}
          /> }
        </div>

      </div>
    </div>
  );
};

export default StakePage; 