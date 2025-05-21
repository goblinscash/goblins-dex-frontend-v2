"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PoolInfoCard from '../stake/PoolInfoCard'; 
import DepositInfoCard from '../stake/DepositInfoCard';
import StakeSlider from '../stake/StakeSlider';
import TokenAmountCard from '../stake/TokenAmountCard';
import { PoolTypeMap, FormattedPool } from '@/utils/sugar.utils'; 
import { useGaugeStakedBalance } from '@/hooks/useGaugeStakedBalance'; 
import { ethers } from 'ethers'; // Removed BigNumber import

// Minimal ABI for Gauge withdraw
const gaugeWithdrawMinimalAbi = [
  {
    "name": "withdraw",
    "type": "function",
    "inputs": [{ "name": "amount", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

// Mock data fetching function
const fetchPoolDataByGaugeAddress = async (gaugeAddress: string): Promise<FormattedPool | null> => {
  console.log(`Fetching data for gauge (withdraw): ${gaugeAddress}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  if (gaugeAddress === "0xInvalidGaugeAddress") return null;
  const mockPoolData: FormattedPool = {
    chainId: 1, lp: `0xLPTokenAddress_${gaugeAddress}`, symbol: "LP-XYZ/ABC", decimals: 18,
    liquidity: 1200000, type: 0, tick: 0, sqrt_ratio: "0", token0: "0xToken0Address_Withdraw",
    token0Symbol: "USDC", reserve0: 600000, staked0: 2000, token1: "0xToken1Address_Withdraw",
    token1Symbol: "DAI", reserve1: 600000, staked1: 2000, gauge: gaugeAddress,
    gauge_liquidity: 75000, gauge_alive: true, fee: "0xSomeFeeAddressWithdraw", bribe: "0xSomeBribeAddressWithdraw",
    factory: "0xSomeFactoryAddressWithdraw", emissions: 150, emissions_token: "0xEmissionTokenAddressWithdraw",
    pool_fee: 0.001, unstaked_fee: 0.05, token0_fees: 0, token1_fees: 0, nfpm: "0xNFPMAccountWithdraw",
    alm: "0xALMAccountWithdraw", root: "0xRootAddressWithdraw", poolBalance: 9876.54, apr: 9.87, volume: 60000,
    token0IconColor: "blue-500", token1IconColor: "orange-500",
  };
  return mockPoolData;
};

const WithdrawPageContent = () => {
  const searchParams = useSearchParams();
  const gaugeAddress = searchParams.get('gaugeAddress');

  const [withdrawPercentage, setWithdrawPercentage] = useState(100);
  const [poolData, setPoolData] = useState<FormattedPool | null>(null);
  const [loadingPool, setLoadingPool] = useState(true);
  const [errorPool, setErrorPool] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false); 

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
          console.error("Failed to fetch pool data for withdraw:", err);
          setErrorPool("Failed to load pool data.");
        })
        .finally(() => setLoadingPool(false));
    } else {
      setErrorPool("Gauge address not provided in URL.");
      setLoadingPool(false);
    }
  }, [gaugeAddress]);

  const {
    balance: stakedLpBalance, // Renamed from stakedLpBalanceBigNum, now bigint
    formattedBalance: stakedLpFormattedBalance,
    decimals: stakedLpDecimals,
    loading: loadingStakedBalance,
    error: errorStakedBalance,
  } = useGaugeStakedBalance({
    gaugeAddress: poolData?.gauge,
    userAddress: userAddress,
    provider: provider,
    lpTokenDecimals: poolData?.decimals,
  });

  const handleWithdraw = async () => {
    console.log("Withdraw Action: Initiated.");
    setIsWithdrawing(true);

    try {
      if (!provider) {
        console.error("Withdraw Action Error: Provider not available.");
        setIsWithdrawing(false);
        return;
      }
      if (!stakedLpBalance || stakedLpBalance === 0n) { // Check for null or 0n for bigint
        console.error("Withdraw Action Error: No staked LP balance to withdraw.");
        setIsWithdrawing(false);
        return;
      }
      if (!poolData?.gauge || !userAddress) {
        console.error("Withdraw Action Error: Critical data missing (Gauge address or User address).");
        setIsWithdrawing(false);
        return;
      }
      if (withdrawPercentage <= 0) {
        console.error("Withdraw Action Error: Withdraw percentage must be greater than 0.");
        setIsWithdrawing(false);
        return;
      }

      // Use BigInt arithmetic
      const amountToWithdraw = (stakedLpBalance * BigInt(withdrawPercentage)) / 100n;

      if (amountToWithdraw === 0n) { // Check for 0n for bigint
        console.error("Withdraw Action Error: Calculated amount to withdraw is zero.");
        setIsWithdrawing(false);
        return;
      }

      const signer = await provider.getSigner(); // getSigner is async in v6
      const gaugeContract = new ethers.Contract(poolData.gauge, gaugeWithdrawMinimalAbi, signer);
      const formattedAmount = ethers.formatUnits(amountToWithdraw, stakedLpDecimals || 18); // ethers.formatUnits

      console.log(`Withdraw Action: Withdrawing ${formattedAmount} ${poolData.symbol || 'LP tokens'} from gauge ${poolData.gauge}...`);
      const withdrawTx = await gaugeContract.withdraw(amountToWithdraw);
      console.log("Withdraw Action: Transaction submitted. Hash:", withdrawTx.hash, ". Waiting for confirmation...");
      await withdrawTx.wait();
      console.log("Withdraw Action: Withdrawn successfully!");
      
    } catch (error: any) {
      console.error("Withdraw Action Error:", error);
      if (error.data?.message) console.error("EVM Revert Reason:", error.data.message);
      else if (error.message) console.error("Error Message:", error.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loadingPool) return <div className="text-center py-10">Loading pool data...</div>;
  if (errorPool) return <div className="text-center py-10 text-red-500">{errorPool}</div>;
  if (!poolData || !provider) return <div className="text-center py-10">No pool data available or provider not ready.</div>;
  
  let withdrawableToken0Amount = "0.00";
  let withdrawableToken1Amount = "0.00";

  if (stakedLpBalance && stakedLpDecimals !== null && poolData.gauge_liquidity > 0 && 
      poolData.staked0 !== undefined && poolData.staked1 !== undefined) {
    try {
      // Calculate the portion of LP to withdraw based on percentage
      const lpAmountToWithdraw = (stakedLpBalance * BigInt(withdrawPercentage)) / 100n;
      const amountLpToWithdrawNumeric = parseFloat(ethers.formatUnits(lpAmountToWithdraw, stakedLpDecimals));

      if (poolData.gauge_liquidity > 0) { 
        const userShareOfTotalStaked = amountLpToWithdrawNumeric / poolData.gauge_liquidity;
        withdrawableToken0Amount = (userShareOfTotalStaked * poolData.staked0).toFixed(6);
        withdrawableToken1Amount = (userShareOfTotalStaked * poolData.staked1).toFixed(6);
      }
    } catch(e) {
      console.error("Error calculating withdrawable underlying token amounts:", e);
    }
  }

  const isButtonDisabled = 
    isWithdrawing || 
    loadingStakedBalance || 
    !stakedLpBalance || // Check if stakedLpBalance is null or 0n
    stakedLpBalance === 0n || 
    withdrawPercentage === 0 ||
    !poolData.gauge;

  return (
    <div className='container px-3 py-5 flex flex-col grow h-full min-h-[55vh] '>
      <div className='flex flex-col gap-8 mx-auto sm:min-w-[40%]'>
        <div className="">          
          <PoolInfoCard
            token0={{ symbol: poolData.token0Symbol, iconColor: poolData.token0IconColor || "gray-500" }}
            token1={{ symbol: poolData.token1Symbol, iconColor: poolData.token1IconColor || "gray-500" }}
            fee={`${(poolData.pool_fee * 100).toFixed(2)}%`}
            type={PoolTypeMap[poolData.type] || "Unknown Type"}
            labelName='Withdraw'
          />
          <DepositInfoCard 
            depositId={poolData.gauge} 
            depositValue={`~$${poolData.poolBalance.toFixed(2)}`} 
          />
        </div>
        <div className=" space-y-5 rounded-2xl border border-[#2A2A2A] p-5 sm:space-y-8 sm:p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Withdrawing amount</h2>
          </div>
          <div className="text-white mb-4 p-3 border border-gray-700 rounded-lg">
            <h3 className="text-md font-semibold">Your Staked LP Balance:</h3>
            {loadingStakedBalance && <p>Loading staked balance...</p>}
            {errorStakedBalance && <p className="text-red-500">Error: {errorStakedBalance.message}</p>}
            {stakedLpFormattedBalance !== null && !loadingStakedBalance && (
              <p className="text-xl">{stakedLpFormattedBalance} {poolData.symbol}</p>
            )}
            {!userAddress && <p className="text-yellow-500">Connect wallet to see staked balance.</p>}
          </div>
          <StakeSlider 
            initialPercentage={withdrawPercentage} 
            onChange={(value) => setWithdrawPercentage(value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <TokenAmountCard 
              tokenSymbol={poolData.token0Symbol}
              amount={withdrawableToken0Amount} 
              usdValue={"~$0.0"} 
              iconColor={poolData.token0IconColor || "gray-500"}
            />
            <TokenAmountCard 
              tokenSymbol={poolData.token1Symbol}
              amount={withdrawableToken1Amount}
              usdValue={"~$0.0"} 
              iconColor={poolData.token1IconColor || "gray-500"}
            />
          </div>
          <button 
            onClick={handleWithdraw}
            disabled={isButtonDisabled}
            className={`w-full py-3 font-medium rounded-md transition-colors ${
              isButtonDisabled
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isWithdrawing ? "Withdrawing..." : (withdrawPercentage === 0 ? "Enter an amount" : "Withdraw")}
          </button>
        </div>
      </div>
    </div>
  );
};

const WithDrawPage = () => {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <WithdrawPageContent />
    </Suspense>
  );
};

export default WithDrawPage;