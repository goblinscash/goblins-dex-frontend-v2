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
  const [withdrawPercentage, setWithdrawPercentage] = useState(100);
  const [stakingAction, setStakingAction] = useState<string | null>(null);
  const [load, setLoad] = useState<{ [key: string]: boolean }>({});
  const [activeStakeInfo, setActiveStakeInfo] = useState<ActiveStakeInfo>({});
  const [quotedToken0ToReceive, setQuotedToken0ToReceive] = useState<string>('--');
  const [quotedToken1ToReceive, setQuotedToken1ToReceive] = useState<string>('--');
  const signer = useEthersSigner();
  const chainId = useChainId();
  const { address } = useAccount();

  const searchParams = useSearchParams();
  const _position = Number(searchParams.get("position"))
  const id = searchParams.get("id");
  const [stakeDetails, setStakeDetails] = useState<StakeDetails>();


  const fetchUserPosition = async (chainId: number, index: number) => {
    if (!address) return
    let _activeStake: ActiveStakeInfo;


    if (_position > 0) {
      console.log("*************", _position, typeof(_position))
      const v3Position: LiquidityPosition = await fetchV3Position(chainId, Number(searchParams.get("position")));
      //@ts-expect-error ignore
      const [pool]: [FormattedPool] = await Promise.all([byIndex(chainId, index)]);
      console.log(v3Position, "resulkt", pool);
      setActiveStakeInfo((prevState) => ({
        ...prevState,
        position: v3Position,
        activeVersion: "v3",
        pool

      }))
      _activeStake = {
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
      _activeStake = {
        position: position_,
        activeVersion: "v2",
        pool
      }
    }

    console.log(_activeStake?.activeVersion == "v3", "||PP", _activeStake.position?.amount0, _activeStake.position?.amount1)

    const token0 = getToken(_activeStake?.pool!.token0)!;
    const token1 = getToken(_activeStake?.pool!.token1)!;
    const rewardToken = getToken(_activeStake.pool!.emissions_token);

    const stakeInfo = {
      lp: _activeStake.pool!.lp,
      liquidity: Number(_activeStake.position!.liquidity) / 10 ** 18,
      token0: token0,
      token1: token1,
      fee: _activeStake.pool!.fee || "",
      type: PoolTypeMap[String(_activeStake.pool!.type)],
      //@ts-expect-error ignore
      token0Amount: _activeStake?.activeVersion == "v3" ? fromUnits(_activeStake?.pool.reserve0, token0.decimals) : String(Number(_activeStake.position?.amount0 || 0)/  10**token0.decimals),
      //@ts-expect-error ignore
      token1Amount: _activeStake?.activeVersion == "v3" ? fromUnits(_activeStake?.pool.reserve1, token1.decimals) : String(Number(_activeStake.position?.amount1 || 0) / 10**token1.decimals),
      unstaked0Amount: fromUnits(_activeStake.position?.staked0 || 0, token0.decimals),
      unstaked1Amount: fromUnits(_activeStake.position?.staked1 || 0, token1.decimals),
      apr: `${_activeStake.pool!.apr}%`,
      emissionsToken: rewardToken?.symbol ?? "",
      emissionsAmount: rewardToken ? String(Number(_activeStake.position?.emissions_earned || 0) / 10 ** rewardToken.decimals) : "",
      tradingFees0: String(Number(_activeStake.position?.unstaked_earned0 || 0) / 10 ** token0.decimals),
      tradingFees1: String(Number(_activeStake.position?.unstaked_earned1 || 0) / 10 ** token1.decimals),
      depositedUsd: `$${(parseFloat(String(_activeStake.pool!.poolBalance).replace("$", "")) * Number(_activeStake.position!.liquidity) / _activeStake.pool!.liquidity).toFixed(2)}`,
      poolTotalUsd: `${_activeStake.pool!.poolBalance}`,
      gauge: _activeStake.pool!.gauge,
      gauge_alive: _activeStake.pool!.gauge_alive,
      gauge_liquidity: _activeStake.pool!.gauge_liquidity
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

      if (!stakeDetails) {
        toast.error("Stake details not loaded.");
        handleLoad("Unstake", false);
        return;
      }

      let amountToUnstake;
      if (_position === 0 && activeStakeInfo?.activeVersion === "v2") { // V2 Gauge Unstake
        if (stakePercentage <= 0 || stakePercentage > 100) {
          toast.warn("Please select a valid percentage (1-100).");
          handleLoad("Unstake", false);
          return;
        }
        // Assuming stakeDetails.gauge_liquidity is a number representing total staked LP tokens in GWEI/wei
        // and stakePercentage is 0-100.
        // We need to convert gauge_liquidity (which is likely a formatted number) to BigNumber based on 18 decimals
        // then calculate the percentage.
        const totalStakedBigNum = toUnits(String(stakeDetails.gauge_liquidity), 18);
        amountToUnstake = totalStakedBigNum.mul(stakePercentage).div(100);

        if (amountToUnstake.isZero()) {
            toast.warn("Amount to unstake is zero.");
            handleLoad("Unstake", false);
            return;
        }
      } else {
        // This case should ideally not be hit if UI logic is correct,
        // as CL unstake calls clUnstake() directly.
        // Defaulting to full V2 unstake if somehow reached (original behavior).
        amountToUnstake = toUnits(String(stakeDetails.gauge_liquidity), 18);
      }


      const gaugeInstance = new ethers.Contract(
        stakeDetails.gauge,
        guageAbi,
        await signer
      );

      const tx = await gaugeInstance.withdraw( // For V2 gauges, withdraw is (uint256 amount)
        amountToUnstake,
        {
          gasLimit: 5000000
        }
      );

      await tx.wait();
      Notify({ chainId, txhash: tx.hash });
      toast.success("Successfully unstaked from gauge!");
      if (chainId && id && address) {
        fetchUserPosition(chainId, Number(id)); // Refresh data
      }
      setStakePercentage(100); // Reset percentage
      handleLoad("Unstake", false);
    } catch (error) {
      console.log(error);
      const err = error as any;
      toast.error(err?.reason || err?.message || "Failed to unstake from gauge.");
      handleLoad("Unstake", false);
    }
  }

  const removeV2Liquidity = async () => {
    try {
      if (!address) return alert("Please connect your wallet");
      if (!stakeDetails) return;
      if (withdrawPercentage <= 0 || withdrawPercentage > 100) {
        return toast.warn("Please enter a valid percentage (1-100).");
      }

      handleLoad("RemoveLiquidity", true);

      const liquidityToRemoveNumerical = (Number(stakeDetails.liquidity) * withdrawPercentage) / 100;
      if (liquidityToRemoveNumerical <= 0) {
        toast.warn("Calculated liquidity to remove is zero.");
        handleLoad("RemoveLiquidity", false);
        return;
      }

      const lpAmountToRemoveBigNum = toUnits(liquidityToRemoveNumerical, 18); // LP tokens usually have 18 decimals

      const aerodromeRouter = new ethers.Contract(
        aerodromeContracts[chainId].router,
        aerodromeRouterAbi,
        await signer
      );

      const stable = stakeDetails.type.includes("Volatile") ? false : true;

      // Approve the router to spend LP tokens
      // The approve util takes (tokenAddr, signer, spenderAddr, numericAmount, decimals)
      // Assuming stakeDetails.lp is the address of the LP token
      const txApprove = await approve(
        stakeDetails.lp,
        await signer,
        aerodromeContracts[chainId].router,
        liquidityToRemoveNumerical, // Use the numerical value for approval, matching current approve util
        18 // LP token decimals
      );
      if (txApprove) {
        await txApprove.wait();
      } else {
        // If approve returns null or undefined (e.g. if approval failed pre-transaction)
        toast.error("LP Token approval failed.");
        handleLoad("RemoveLiquidity", false);
        return;
      }

      // Get expected amounts of underlying tokens
      const [expectedToken0Amount, expectedToken1Amount] = await aerodromeRouter.quoteRemoveLiquidity(
        stakeDetails.token0.address,
        stakeDetails.token1.address,
        stable,
        lpAmountToRemoveBigNum
      );

      // Update state with quoted amounts
      setQuotedToken0ToReceive(ethers.utils.formatUnits(expectedToken0Amount, stakeDetails.token0.decimals));
      setQuotedToken1ToReceive(ethers.utils.formatUnits(expectedToken1Amount, stakeDetails.token1.decimals));

      console.log("Expected Token0 Amount:", fromUnits(expectedToken0Amount, stakeDetails.token0.decimals));
      console.log("Expected Token1 Amount:", fromUnits(expectedToken1Amount, stakeDetails.token1.decimals));

      // Apply 0.5% slippage
      const amount0Min = expectedToken0Amount.mul(995).div(1000);
      const amount1Min = expectedToken1Amount.mul(995).div(1000);

      const to = address;
      const deadline = Math.floor(Date.now() / 1000) + 600;

      // Proceed with removing liquidity
      const tx = await aerodromeRouter.removeLiquidity(
        stakeDetails.token0.address,
        stakeDetails.token1.address,
        stable,
        lpAmountToRemoveBigNum,
        amount0Min,
        amount1Min,
        to,
        deadline,
        { gasLimit: 5000000 }
      );

      await tx.wait();
      Notify({ chainId, txhash: tx.hash });
      toast.success("Liquidity removed successfully!");

      if (chainId && id && address) {
        fetchUserPosition(chainId, Number(id)); // Refresh data
      }
      setWithdrawPercentage(100); // Reset percentage
      setQuotedToken0ToReceive('--'); // Reset quoted amounts on success
      setQuotedToken1ToReceive('--');

    } catch (error) {
      console.log(error);
      const err = error as any;
      toast.error(err?.reason || err?.message || "Failed to remove liquidity.");
    } finally {
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
      //@ts-expect-error ignore
      toast.error(error.reason)
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


  console.log(stakeDetails, "pool+++++>>>>>>>>>>>" , activeStakeInfo)

  const isV2LPRemovalMode =
    stakingAction === "withdraw" &&
    activeStakeInfo.activeVersion === "v2" &&
    _position === 0 &&
    stakeDetails &&
    Number(stakeDetails.gauge_liquidity) === 0 &&
    Number(stakeDetails.liquidity) > 0;

  const showGaugeOrCLOps =
    stakeDetails &&
    (stakingAction === "stake" ||
      (stakingAction === "withdraw" && (Number(stakeDetails.gauge_liquidity) > 0 || _position > 0)));

  const isCLUnstakeMode =
    stakingAction === 'withdraw' &&
    _position > 0 &&
    activeStakeInfo?.activeVersion === "v3" &&
    showGaugeOrCLOps; // Ensures it's part of the gauge/CL ops block

  const isV2GaugeUnstakeMode =
    stakingAction === 'withdraw' &&
    _position === 0 &&
    activeStakeInfo?.activeVersion === "v2" &&
    stakeDetails && // ensure stakeDetails is loaded
    Number(stakeDetails.gauge_liquidity) > 0 &&
    showGaugeOrCLOps; // Ensures it's part of the gauge/CL ops block

  useEffect(() => {
    if (isCLUnstakeMode) {
      setStakePercentage(100); // CL NFTs are unstaked entirely
    }
  }, [isCLUnstakeMode]);

  useEffect(() => {
    // Reset quoted amounts if the percentage or underlying stake details change
    setQuotedToken0ToReceive('--');
    setQuotedToken1ToReceive('--');
  }, [withdrawPercentage, stakeDetails]);


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

        {isV2LPRemovalMode && stakeDetails ? (
          <div className="space-y-5 rounded-2xl border border-[#2A2A2A] p-5 sm:space-y-8 sm:p-8">
            <h2 className="text-lg font-bold text-white">Withdraw Liquidity from V2 Pool</h2>
            <p className="text-sm text-gray-400">
              Your total LP tokens: {stakeDetails.liquidity}
            </p>
            <p className="text-sm text-gray-400">
              Approximate underlying: {stakeDetails.token0Amount} {stakeDetails.token0.symbol} + {stakeDetails.token1Amount} {stakeDetails.token1.symbol}
            </p>

            <div className="flex flex-col gap-2">
              <label htmlFor="withdrawPercentage" className="text-sm font-medium text-white">
                Percentage to withdraw:
              </label>
              <input
                type="number"
                id="withdrawPercentage"
                name="withdrawPercentage"
                min="0"
                max="100"
                value={withdrawPercentage}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 0 && val <= 100) {
                    setWithdrawPercentage(val);
                  }
                }}
                className="w-full p-2 rounded-md bg-[#0F0F0F] text-white border border-[#2A2A2A] focus:ring-1 focus:ring-purple-500"
              />
              <div className="flex gap-2 mt-2">
                {[25, 50, 75, 100].map((perc) => (
                  <button
                    key={perc}
                    onClick={() => setWithdrawPercentage(perc)}
                    className={`py-1 px-3 rounded-md text-sm font-medium ${
                      withdrawPercentage === perc
                        ? "bg-purple-600 text-white"
                        : "bg-[#1A1A1A] text-gray-300 hover:bg-purple-500"
                    }`}
                  >
                    {perc}%
                  </button>
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-400">
              You will receive approximately:
            </p>
            <p id="calculatedToken0AmountDisplay" className="text-sm text-white font-medium">
              {quotedToken0ToReceive} {stakeDetails?.token0.symbol}
            </p>
            <p id="calculatedToken1AmountDisplay" className="text-sm text-white font-medium">
              {quotedToken1ToReceive} {stakeDetails?.token1.symbol}
            </p>

            <ActButton
              label="Confirm Withdrawal"
              onClick={removeV2Liquidity} // We'll need to adjust removeV2Liquidity to use withdrawPercentage
              load={load["RemoveLiquidity"]}
              disableBtn={
                !(withdrawPercentage > 0 && withdrawPercentage <= 100 && stakeDetails && Number(stakeDetails.liquidity) > 0)
              }
            />
          </div>
        ) : showGaugeOrCLOps && stakeDetails ? (
          // Existing UI for gauge/CL operations
          <div className=" space-y-5 rounded-2xl border border-[#2A2A2A] p-5 sm:space-y-8 sm:p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">
                {stakingAction === "stake" ? "Staking amount" : "Unstaking amount"}
              </h2>
            </div>

            {/* Staking Slider Component */}
            {stakingAction === "stake" && !isCLUnstakeMode && (
              <StakeSlider
                initialPercentage={stakePercentage}
                onChange={(value) => setStakePercentage(value)}
                position={_position > 0} // Simplified: true if CL, false if V2
              />
            )}
            {isV2GaugeUnstakeMode && ( // Slider for V2 gauge unstaking
              <StakeSlider
                initialPercentage={stakePercentage}
                onChange={(value) => setStakePercentage(value)}
                position={false} // V2 position
              />
            )}

            {isCLUnstakeMode && (
              <p className="text-center text-white my-4">
                CL NFT #{_position} will be unstaked entirely (100%).
              </p>
            )}

            {/* Token Amounts */}
            {/* Render TokenAmountCards only if not CLUnstakeMode or if explicitly needed for CL */}
            {!isCLUnstakeMode && stakeDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <TokenAmountCard
                  chainId={chainId}
                  token={stakeDetails.token0.address}
                  tokenSymbol={stakeDetails.token0.name}
                  amount={
                    stakingAction === "stake"
                      ? (Number(stakeDetails.token0Amount) * stakePercentage) / 100
                      : isV2GaugeUnstakeMode // For V2 gauge unstaking
                      ? (Number(stakeDetails.unstaked0Amount) * stakePercentage) / 100
                      : 0 // Default or CL unstake (hidden)
                  }
                  iconColor="purple-600"
                />
                <TokenAmountCard
                  chainId={chainId}
                  token={stakeDetails.token1.address}
                  tokenSymbol={stakeDetails.token1.name}
                  amount={
                    stakingAction === "stake"
                      ? (Number(stakeDetails.token1Amount) * stakePercentage) / 100
                      : isV2GaugeUnstakeMode // For V2 gauge unstaking
                      ? (Number(stakeDetails.unstaked1Amount) * stakePercentage) / 100
                      : 0 // Default or CL unstake (hidden)
                  }
                  iconColor="yellow-500"
                />
              </div>
            )}

            {/* Fee Notice Component */}
            {(stakingAction === "stake" || isV2GaugeUnstakeMode) && <FeeNotice message={feeNoticeMessage} />}

            {stakingAction === "stake" && (
              <ActButton
                label="Stake"
                onClick={() => _position > 0 ? clStake() : stake()}
                load={_position > 0 ? load['ClStake'] : load["Stake"]}
                disableBtn={stakingAction === "withdraw"}
              />
            )}
            {stakingAction === "withdraw" && (
               <ActButton
                label="Unstake"
                onClick={() => {
                  if (isCLUnstakeMode) {
                    clUnstake();
                  } else if (isV2GaugeUnstakeMode) {
                    unstake(); // This function needs to be reviewed/modified to use stakePercentage for V2 gauge unstake
                  }
                }}
                load={isCLUnstakeMode ? load['ClUnstake'] : (isV2GaugeUnstakeMode ? load["Unstake"] : false)}
                disableBtn={stakingAction === "stake"} // Keep original logic, or adjust if needed for new modes
              />
            )}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400">Loading details or no applicable action...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StakePage;