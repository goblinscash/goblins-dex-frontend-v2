"use client";
import React, { useState } from 'react';
import StakeSlider from './StakeSlider';
import TokenAmountCard from './TokenAmountCard';
import PoolInfoCard from './PoolInfoCard';
import DepositInfoCard from './DepositInfoCard';
import FeeNotice from './FeeNotice';

const StakePage = () => {
  const [stakePercentage, setStakePercentage] = useState(100);
  
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
    labelName:'Stake'
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