import React from 'react';

interface TokenAmountCardProps {
  tokenSymbol: string;
  amount: string;
  usdValue: string;
  iconColor: string;
}

const TokenAmountCard: React.FC<TokenAmountCardProps> = ({
  tokenSymbol,
  amount,
  usdValue,
  iconColor
}) => {
  return (
    <div className="bg-[#0F1118] border border-[#2A2A2A] rounded-lg p-4">
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full bg-${iconColor} flex items-center justify-center mr-2`}>
          <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z" />
          </svg>
        </div>
        <span className="text-white font-medium">{amount} {tokenSymbol}</span>
      </div>
      <div className="text-gray-400 text-sm mt-2">{usdValue}</div>
    </div>
  );
};

export default TokenAmountCard; 