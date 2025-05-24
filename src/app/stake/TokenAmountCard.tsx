import Logo from '@/components/common/Logo';
import React from 'react';

interface TokenAmountCardProps {
  chainId: number;
  token: string;
  tokenSymbol: string;
  amount: string;
  // usdValue: string;
  iconColor: string;
}

const TokenAmountCard: React.FC<TokenAmountCardProps> = ({
  chainId,
  token,
  tokenSymbol,
  amount,
  // usdValue,
  iconColor
}) => {
  return (
    <div className="bg-[#0F1118] border border-[#2A2A2A] rounded-lg p-4">
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full bg-${iconColor} flex items-center justify-center mr-2`}>
          <Logo
            chainId={chainId}
            token={token}
            margin={0}
            height={28}
          />
        </div>
        <span className="text-white font-medium">{amount} {tokenSymbol}</span>
      </div>
      {/* <div className="text-gray-400 text-sm mt-2">{usdValue}</div> */}
    </div>
  );
};

export default TokenAmountCard; 