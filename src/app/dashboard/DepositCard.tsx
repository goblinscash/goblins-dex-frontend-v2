import Link from 'next/link';
import React, { useState, useEffect } from 'react';

interface TokenPair {
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
}

interface DepositCardProps {
  depositId: number;
  tokenPair: TokenPair;
  forceExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

const DepositCard: React.FC<DepositCardProps> = ({ 
  depositId, 
  tokenPair, 
  forceExpanded = false,
  onExpandChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Update local expanded state when forceExpanded changes
  useEffect(() => {
    setIsExpanded(forceExpanded);
  }, [forceExpanded]);

  const toggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onExpandChange) {
      onExpandChange(newState);
    }
  };

  return (
    <div className="w-full">
      {/* Pool Info Header */}
      <div className="w-full bg-[#0F1118] border border-[#2A2A2A] rounded-lg overflow-hidden mb-2 p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex items-center">
            {/* Token Icons */}
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600 flex items-center justify-center z-10">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z" />
                </svg>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-500 flex items-center justify-center -ml-3 sm:-ml-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z" />
                </svg>
              </div>
            </div>
            
            {/* Token info */}
            <div className="ml-2 sm:ml-3">
              <div className="flex items-center">
                <span className="text-white text-sm sm:text-base font-medium">{tokenPair.token0Name} / {tokenPair.token1Name}</span>
                <span className="ml-2 text-gray-400 text-xs sm:text-sm">{tokenPair.fee}</span>
              </div>
              <div className="text-blue-400 text-xs sm:text-sm">{tokenPair.type}</div>
            </div>
          </div>
          
          <div className="text-right mt-1 sm:mt-0">
            <div className="text-gray-400 text-xs hidden sm:text-sm sm:block">Deposited</div>
            <div className="text-white text-sm hidden sm:text-base font-medium sm:block">{tokenPair.depositedUsd}</div>
            <div className='sm:hidden flex justify-between items-center'>
              <span className='text-gray-400 text-xs sm:text-sm'>Deposited</span>
              <span className="text-white text-sm sm:text-base font-medium">{tokenPair.depositedUsd}</span>
            </div>
            <div className="text-gray-400 hidden sm:block text-xs sm:text-sm">{tokenPair.poolTotalUsd} Pool Total</div>
          </div>
        </div>
      </div>
    
      {/* Collapsible Deposit Section */}
      <div className="w-full bg-[#0F1118] border border-[#2A2A2A] rounded-lg overflow-hidden">
        {/* Header with Toggle Button */}
        <div 
          className="flex items-center justify-between p-3 sm:p-4 border-b border-[#2A2A2A] cursor-pointer"
          onClick={toggleExpand}
        >
          <div className="flex items-center">
            <button className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="ml-1 sm:ml-2 text-white text-sm sm:text-lg font-medium whitespace-nowrap">Deposit #{depositId}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white opacity-60 text-xs sm:text-sm hidden sm:inline">{isExpanded ? 'Hide' : 'Show'} Details</span>
            <button className="px-2 sm:px-3 py-1 sm:py-1.5 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-[#3555BE] whitespace-nowrap">
              Deposit
            </button>
          </div>
        </div>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#2A2A2A]">
            {/* Staked Column */}
            <div className="p-3 sm:p-4">
              <div className="text-gray-400 text-xs sm:text-sm mb-2">Staked</div>
              <div className="text-white text-base sm:text-xl font-bold">
                {tokenPair.token0Amount} {tokenPair.token0Name}
              </div>
              <div className="text-white text-base sm:text-xl font-bold">
                {tokenPair.token1Amount} {tokenPair.token1Name}
              </div>
            </div>

            {/* Unstaked Column */}
            <div className="p-3 sm:p-4">
              <div className="text-gray-400 text-xs sm:text-sm mb-2">Unstaked</div>
              <div className="text-white text-base sm:text-xl font-bold">
                {tokenPair.unstaked0Amount} {tokenPair.token0Name}
              </div>
              <div className="text-white text-base sm:text-xl font-bold">
                {tokenPair.unstaked1Amount} {tokenPair.token1Name}
              </div>
              <div className="flex gap-2 mt-4">
                <Link href={'/stake'}>
                  <span className="px-2 sm:px-3 py-1 text-blue-400 text-xs sm:text-sm font-medium rounded-md hover:bg-[#3A3A3A] transition-colors whitespace-nowrap">
                    Stake
                  </span>
                </Link>
                <Link href={'/withdraw'}>
                  <span className="px-2 sm:px-3 py-1 text-blue-400 text-xs sm:text-sm font-medium rounded-md hover:bg-[#3A3A3A] transition-colors whitespace-nowrap">
                    Withdraw
                  </span>
                </Link>
              </div>
            </div>

            {/* APR Column */}
            <div className="p-3 sm:p-4">
              <div className="text-gray-400 text-xs sm:text-sm mb-2">APR</div>
              <div className="text-white text-base sm:text-xl font-bold">{tokenPair.apr}</div>
            </div>

            {/* Emissions Column */}
            <div className="p-3 sm:p-4">
              <div className="text-gray-400 text-xs sm:text-sm mb-2">Emissions</div>
              <div className="text-white text-base sm:text-xl font-bold">
                {tokenPair.emissionsAmount} {tokenPair.emissionsToken}
              </div>
            </div>

            {/* Trading Fees Column */}
            <div className="p-3 sm:p-4">
              <div className="text-gray-400 text-xs sm:text-sm mb-2">Trading Fees</div>
              <div className="text-white text-base sm:text-xl font-bold">
                {tokenPair.tradingFees0} {tokenPair.token0Name}
              </div>
              <div className="text-white text-base sm:text-xl font-bold">
                {tokenPair.tradingFees1} {tokenPair.token1Name}
              </div>
              <div className="flex mt-4">
                <button className="px-2 sm:px-3 py-1 text-blue-400 text-xs sm:text-sm font-medium rounded-md hover:bg-[#3A3A3A] transition-colors whitespace-nowrap">
                  Claim
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositCard; 