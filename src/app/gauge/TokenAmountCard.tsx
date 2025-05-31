import Logo from '@/components/common/Logo';
import React from 'react';

interface TokenAmountCardProps {
  chainId: number;
  token: string;
  tokenSymbol: string;
  amount: string | number;
  usdValue?: string;
  iconColor: string;
}

const TokenAmountCard: React.FC<TokenAmountCardProps> = ({
  chainId,
  token,
  tokenSymbol,
  amount,
  usdValue,
  iconColor
}) => {
  return (
    <div className="bg-[#000E0E] border border-[#2A2A2A] rounded-lg p-4">
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full bg-${iconColor} flex items-center justify-center mr-2`}>
          <Logo
            chainId={chainId}
            token={token}
            margin={0}
            height={28}
          />
        </div>
        <p className="text-base font-medium text-white"> {/* Adjusted text size from xl to base to better fit card */}
          {Number(amount).toFixed(4)} {tokenSymbol}
          {usdValue && <span className="text-sm text-gray-400 ml-1">({usdValue})</span>} {/* Adjusted margin */}
        </p>
      </div>
    </div>
  );
};

export default TokenAmountCard; 