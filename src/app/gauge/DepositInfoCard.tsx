import React from 'react';

interface DepositInfoCardProps {
  depositId: number;
  depositValue: string;
}

const DepositInfoCard: React.FC<DepositInfoCardProps> = ({
  depositId,
  depositValue
}) => {
  return (
    <div className="w-full bg-[#0F1118] border border-[#2A2A2A] rounded-lg overflow-hidden p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs">$</span>
          <span className="text-white text-base font-medium">Deposit #{depositId}</span>
        </div>
        <div className="text-white text-base font-medium">{depositValue}</div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-400">
          <div className="flex items-center">
            <span>0</span>
            <span className="mx-2">•</span>
            <span>∞</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositInfoCard; 