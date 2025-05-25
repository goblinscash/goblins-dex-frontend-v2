import React from 'react';

interface PoolInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  token0: {
    symbol: string;
    iconColor: string;
  };
  token1: {
    symbol: string;
    iconColor: string;
  };
  fee: string;
  type: string;
  apr?: string;
  tvl?: string;
  volume?: string;
  tradingFee?: string;
  fees?: string;
}

const PoolInfoModal: React.FC<PoolInfoModalProps> = ({
  isOpen,
  onClose,
  token0,
  token1,
  fee,
  type,
  apr = '0.0%',
  tvl = '~$0.07649',
  volume = '~$0.38402',
  tradingFee = '0.3%',
  fees = '~$0.00115'
}) => {
  if (!isOpen) return null;

  const cross = (
    <svg
      width="12"
      height="12"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 17L1 1M17 1L1 17"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <div className="fixed z-[9999] inset-0 flex items-center justify-center">
      <div className="absolute inset-0 bg-black z-[9] opacity-70" onClick={onClose}></div>
      <div className="relative p-6 mx-auto rounded-lg z-[9999] bg-[#1A1B25] w-full max-w-[500px]">
        <button onClick={onClose} className="border-0 p-0 absolute top-4 right-4">
          {cross}
        </button>
        
        <h2 className="text-white text-xl font-bold mb-6">Pool info</h2>
        
        <div className="flex items-center mb-6">
          {/* Token Icons */}
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full bg-${token0.iconColor} flex items-center justify-center z-10`}>
              <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z" />
              </svg>
            </div>
            <div className={`w-10 h-10 rounded-full bg-${token1.iconColor} flex items-center justify-center -ml-4`}>
              <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z" />
              </svg>
            </div>
          </div>
          
          {/* Token info */}
          <div className="ml-3">
            <div className="flex items-center">
              <span className="text-white text-base font-medium">{token0.symbol} / {token1.symbol}</span>
              <span className="ml-2 text-gray-400 text-sm">{fee}</span>
            </div>
            <div className="text-blue-400 text-sm">{type}</div>
          </div>
        </div>
        
        {/* Pool Stats */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-[#273257] pb-3">
            <span className="text-gray-400">APR</span>
            <span className="text-white">{apr}</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-[#273257] pb-3">
            <span className="text-gray-400">TVL</span>
            <span className="text-white">{tvl}</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-[#273257] pb-3">
            <span className="text-gray-400">Volume</span>
            <span className="text-white">{volume}</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-[#273257] pb-3">
            <span className="text-gray-400">Fees</span>
            <span className="text-white">{fees}</span>
          </div>
          
          <div className="flex justify-between items-center pb-3">
            <span className="text-gray-400">Trading fee</span>
            <span className="text-white">{tradingFee}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolInfoModal; 