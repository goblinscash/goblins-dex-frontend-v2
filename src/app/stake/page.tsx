"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StakeSlider from './StakeSlider';
import TokenAmountCard from './TokenAmountCard';
import PoolInfoCard from './PoolInfoCard';
import DepositInfoCard from './DepositInfoCard';
import FeeNotice from './FeeNotice';
import { PoolTypeMap, FormattedPool } from '@/utils/sugar.utils';
import { useLpTokenBalance } from '@/hooks/useLpTokenBalance';
import { ethers } from 'ethers'; // Removed BigNumber import
import erc20Abi from '@/abi/erc20.json';

// Minimal ABI for Gauge deposit
const gaugeMinimalAbi = [
  {
    "name": "deposit",
    "type": "function",
    "inputs": [{ "name": "amount", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

// Mock data fetching function
const fetchPoolDataByGaugeAddress = async (gaugeAddress: string): Promise<FormattedPool | null> => {
  console.log(`Fetching data for gauge: ${gaugeAddress}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  if (gaugeAddress === "0xInvalidGaugeAddress") return null;
  const mockPoolData: FormattedPool = {
    chainId: 1, lp: `0xLPTokenAddress_${gaugeAddress}`, symbol: "LP-XYZ/ABC", decimals: 18,
    liquidity: 1000000, type: -1, tick: 0, sqrt_ratio: "0", token0: "0xToken0Address",
    token0Symbol: "DEGEN", reserve0: 50000, staked0: 1000, token1: "0xToken1Address",
    token1Symbol: "Bonk", reserve1: 5000000, staked1: 10000, gauge: gaugeAddress,
    gauge_liquidity: 50000, gauge_alive: true, fee: "0xSomeFeeAddress", bribe: "0xSomeBribeAddress",
    factory: "0xSomeFactoryAddress", emissions: 100, emissions_token: "0xEmissionTokenAddress",
    pool_fee: 0.003, unstaked_fee: 0.1, token0_fees: 0, token1_fees: 0, nfpm: "0xNFPMAccount",
    alm: "0xALMAccount", root: "0xRootAddress", poolBalance: 12345.67, apr: 12.34, volume: 50000,
    token0IconColor: "purple-600", token1IconColor: "yellow-500",
  };
  return mockPoolData;
};

const StakePageContent = () => {
  const searchParams = useSearchParams();
  const gaugeAddress = searchParams.get('gaugeAddress');

  const [stakePercentage, setStakePercentage] = useState(100);
  const [poolData, setPoolData] = useState<FormattedPool | null>(null);
  const [loadingPool, setLoadingPool] = useState(true);
  const [errorPool, setErrorPool] = useState<string | null>(null);
  const [isStaking, setIsStaking] = useState(false); 

  const userAddress = '0x1234567890123456789012345678901234567890'; 
  const [provider, setProvider] = useState<ethers.BrowserProvider | undefined>(undefined); // Updated to BrowserProvider

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      setProvider(new ethers.BrowserProvider((window as any).ethereum)); // Updated to BrowserProvider
    } else {
      console.warn("No Ethereum provider found. Please install MetaMask or use a dApp browser.");
    }

    if (gaugeAddress) {
      setLoadingPool(true);
      setErrorPool(null);
      fetchPoolDataByGaugeAddress(gaugeAddress)
        .then(data => {
          if (data) setPoolData(data);
          else setErrorPool(`Pool data not found for gauge address: ${gaugeAddress}`);
        })
        .catch(err => {
          console.error("Failed to fetch pool data:", err);
          setErrorPool("Failed to load pool data.");
        })
        .finally(() => setLoadingPool(false));
    } else {
      setErrorPool("Gauge address not provided in URL.");
      setLoadingPool(false);
    }
  }, [gaugeAddress]);

  const {
    balance: userLpBalance, // Renamed from userLpBalanceBigNum, now bigint
    formattedBalance: lpTokenFormattedBalance,
    decimals: lpDecimals,
    totalSupply: totalLpSupply, // Renamed from totalLpSupplyBigNum, now bigint
    loading: loadingLpTokenInfo,
    error: errorLpTokenInfo
  } = useLpTokenBalance({
    tokenAddress: poolData?.lp,
    userAddress: userAddress,
    provider: provider,
  });

  const handleStake = async () => {
    console.log("Stake Action: Initiated.");
    setIsStaking(true);

    try {
      if (!provider) {
        console.error("Stake Action Error: Provider not available.");
        setIsStaking(false);
        return;
      }
      if (!userLpBalance || userLpBalance === 0n) { // Check for null or 0n for bigint
        console.error("Stake Action Error: No LP token balance to stake.");
        setIsStaking(false);
        return;
      }
      if (!poolData?.gauge || !poolData?.lp || !userAddress) {
        console.error("Stake Action Error: Critical data missing (Pool gauge, LP address, or User address).");
        setIsStaking(false);
        return;
      }
      if (stakePercentage <= 0) {
        console.error("Stake Action Error: Stake percentage must be greater than 0.");
        setIsStaking(false);
        return;
      }

      // Use BigInt arithmetic
      const amountToStake = (userLpBalance * BigInt(stakePercentage)) / 100n;

      if (amountToStake === 0n) { // Check for 0n for bigint
        console.error("Stake Action Error: Calculated amount to stake is zero.");
        setIsStaking(false);
        return;
      }

      const signer = await provider.getSigner(); // getSigner is async in v6
      const lpTokenContract = new ethers.Contract(poolData.lp, erc20Abi, signer);
      const gaugeContract = new ethers.Contract(poolData.gauge, gaugeMinimalAbi, signer);
      const formattedAmount = ethers.formatUnits(amountToStake, lpDecimals || 18); // ethers.formatUnits

      console.log(`Stake Action: Approving ${formattedAmount} ${poolData.symbol} for gauge ${poolData.gauge}...`);
      const approvalTx = await lpTokenContract.approve(poolData.gauge, amountToStake);
      console.log("Stake Action: Approval transaction submitted. Hash:", approvalTx.hash, ". Waiting for confirmation...");
      await approvalTx.wait();
      console.log("Stake Action: Approval successful!");

      console.log(`Stake Action: Staking ${formattedAmount} ${poolData.symbol} into gauge ${poolData.gauge}...`);
      const depositTx = await gaugeContract.deposit(amountToStake);
      console.log("Stake Action: Staking transaction submitted. Hash:", depositTx.hash, ". Waiting for confirmation...");
      await depositTx.wait();
      console.log("Stake Action: Staked successfully!");

    } catch (error: any) {
      console.error("Stake Action Error:", error);
      if (error.data?.message) console.error("EVM Revert Reason:", error.data.message);
      else if (error.message) console.error("Error Message:", error.message);
    } finally {
      setIsStaking(false);
    }
  };

  if (loadingPool) return <div className="text-center py-10">Loading pool data...</div>;
  if (errorPool) return <div className="text-center py-10 text-red-500">{errorPool}</div>;
  if (!poolData || !provider) return <div className="text-center py-10">No pool data available or provider not ready.</div>;

  const feeNoticeMessage = `${(poolData.unstaked_fee * 100)}% of fees generated from unstaked deposits is distributed to pool voters.`;
  let amountToken0ToStake = "0.00";
  let amountToken1ToStake = "0.00";

  if (userLpBalance && totalLpSupply && lpDecimals !== null &&
      poolData.reserve0 !== undefined && poolData.reserve1 !== undefined) {
    try {
      // For display calculation, converting to number after formatting is acceptable.
      // For on-chain precision, keep as bigint as long as possible.
      const userLpNumeric = parseFloat(ethers.formatUnits(userLpBalance, lpDecimals));
      const totalLpSupplyNumeric = parseFloat(ethers.formatUnits(totalLpSupply, lpDecimals));
      if (totalLpSupplyNumeric > 0) {
        const userShare = userLpNumeric / totalLpSupplyNumeric;
        const token0FullAmount = userShare * poolData.reserve0;
        const token1FullAmount = userShare * poolData.reserve1;
        const percentageFactor = stakePercentage / 100;
        const displayDecimals = poolData.decimals || 18;
        amountToken0ToStake = (token0FullAmount * percentageFactor).toFixed(Math.min(displayDecimals, 6));
        amountToken1ToStake = (token1FullAmount * percentageFactor).toFixed(Math.min(displayDecimals, 6));
      }
    } catch (e) {
      console.error("Error calculating token amounts for staking:", e);
    }
  }

  const isButtonDisabled =
    isStaking ||
    loadingLpTokenInfo ||
    !userLpBalance || // Check if userLpBalance is null or 0n
    userLpBalance === 0n ||
    stakePercentage === 0 ||
    !poolData.gauge;

  return (
    <div className='container px-3 py-5 flex flex-col grow h-full min-h-[55vh]'>
      <div className='flex flex-col gap-8 mx-auto'>
        <div className="">
          <PoolInfoCard
            token0={{ symbol: poolData.token0Symbol, iconColor: poolData.token0IconColor || "gray-500" }}
            token1={{ symbol: poolData.token1Symbol, iconColor: poolData.token1IconColor || "gray-500" }}
            fee={`${(poolData.pool_fee * 100).toFixed(2)}%`}
            type={PoolTypeMap[poolData.type] || "Unknown Type"}
            labelName='Stake'
          />
          <DepositInfoCard
            depositId={poolData.gauge}
            depositValue={`~$${poolData.poolBalance.toFixed(2)}`}
          />
        </div>
        <div className="space-y-5 rounded-2xl border border-[#2A2A2A] p-5 sm:space-y-8 sm:p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Staking amount</h2>
          </div>
          <div className="text-white mb-4 p-3 border border-gray-700 rounded-lg">
            <h3 className="text-md font-semibold">Your Wallet LP Balance:</h3>
            {loadingLpTokenInfo && <p>Loading LP balance...</p>}
            {errorLpTokenInfo && <p className="text-red-500">Error: {errorLpTokenInfo.message}</p>}
            {lpTokenFormattedBalance !== null && !loadingLpTokenInfo && (
              <p className="text-xl">{lpTokenFormattedBalance} {poolData.symbol}</p>
            )}
            {!userAddress && <p className="text-yellow-500">Connect wallet to see LP balance.</p>}
          </div>
          <StakeSlider
            initialPercentage={stakePercentage}
            onChange={(value) => setStakePercentage(value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <TokenAmountCard
              tokenSymbol={poolData.token0Symbol}
              amount={amountToken0ToStake}
              usdValue={"~$0.0"}
              iconColor={poolData.token0IconColor || "gray-500"}
            />
            <TokenAmountCard
              tokenSymbol={poolData.token1Symbol}
              amount={amountToken1ToStake}
              usdValue={"~$0.0"}
              iconColor={poolData.token1IconColor || "gray-500"}
            />
          </div>
          <FeeNotice message={feeNoticeMessage} />
          <button
            onClick={handleStake}
            disabled={isButtonDisabled}
            className={`w-full py-3 font-medium rounded-md transition-colors ${
              isButtonDisabled
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isStaking ? "Staking..." : (stakePercentage === 0 ? "Enter an amount" : "Stake")}
          </button>
        </div>
      </div>
    </div>
  );
};

const StakePage = () => {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <StakePageContent />
    </Suspense>
  );
};

export default StakePage;