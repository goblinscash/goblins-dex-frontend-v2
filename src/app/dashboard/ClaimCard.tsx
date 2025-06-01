import Tooltip from '@/components/common/Tooltip';
import React from 'react';

interface ClaimCardProps {
    fBOMBAmount: string;
    wstETHAmount: string;
    lockId?: string; // Optional prop for lock ID
}

  // Tooltip content component
  const TooltipContent = () => (
    <div className="flex flex-col gap-3">
      <div>
        <div className="text-gray-400 text-xs mb-1">Pool Address</div>
        <div className="flex items-center justify-between">
          <div className="text-white text-xs font-medium">0xBd1F...B8780</div>
          <button 
            className="text-white hover:text-neon-green"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText('0xBd1F...B8780');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
        </div>
      </div>
      
      <div>
        <div className="text-gray-400 text-xs mb-1">Gauge Address</div>
        <div className="flex items-center justify-between">
          <div className="text-white text-xs font-medium">0xBd1F...B8780</div>
          <button 
            className="text-white hover:text-neon-green"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText('0xBd1F...B8780');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );

const ClaimCard: React.FC<ClaimCardProps> = ({ fBOMBAmount, wstETHAmount, lockId = "68969" }) => {
    return (
        <div className="bg-[#000E0E] [align-items:normal] text-white p-4 sm:p-6 rounded-xl flex flex-col sm:flex-row justify-between align-top border border-[#1E2233]">
            {/* Left side */}
            <div className='border-accent-10 border-b flex flex-col gap-5 lg:border-b-0 lg:border-r lg:mb-0 lg:pb-0 lg:w-80 mb-4 sm:mr-5 pb-4 w-full'>
                <div className="flex items-start gap-4 w-full sm:w-auto">
                    <div className="flex-shrink-0">
                        <div className="flex -space-x-2">
                            <img className="shrink-0 rounded-full transition size-10" src="https://raw.githubusercontent.com/SmolDapp/tokenAssets/main/tokens/8453/0x74ccbe53f77b08632ce0cb91d3a545bf6b8e0979/logo.svg" loading="lazy" alt="Token Image" />
                            <img className="shrink-0 rounded-full transition size-10" src="https://raw.githubusercontent.com/SmolDapp/tokenAssets/main/tokens/8453/0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452/logo.svg" loading="lazy" alt="Token Image" />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                            WETH / USDC
                            <span className="text-xs bg-[#1E2233] text-gray-300 px-1.5 py-0.5 rounded">0.0405%</span>
                            <span className="text-xs bg-[#1E2233] text-gray-400 px-1.5 py-0.5 rounded">ALM</span>
                            <Tooltip
                                content={<TooltipContent />}
                                placement="top"
                                contentClassName="w-64"
                            >
                                <div className='ml-2 cursor-pointer'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis-vertical size-4"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                </div>
                            </Tooltip>
                        </div>
                        <div className="text-sm text-[#00ff4e] hover:underline cursor-pointer">
                            Concentrated Volatile 100
                        </div>
                    </div>
                </div>
            </div>
            {/* Center lock info */}
            <div className="text-sm text-gray-300 mt-4 sm:mt-0 sm:px-6">
                <span className='flex items-center mb-1'>
                    <span className="font-semibold text-white">Lock #{lockId}</span>
                    <svg className="ml-2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                    </svg>
                </span>
                <div className="text-xs text-gray-400">2.51561 GOBV2 locked</div>
            </div>

            {/* Right side values */}
            <div className="flex flex-col gap-1 text-xs text-right mt-4 sm:mt-0 sm:ml-auto">
                <div className="flex sm:justify-end gap-2">
                    <span className="text-gray-400">0.00002</span>
                    <span className="text-white">WETH</span>
                    <span className="text-[10px] text-gray-500">FEE</span>
                </div>
                <div className="flex sm:justify-end gap-2">
                    <span className="text-gray-400">0.05997</span>
                    <span className="text-white">USDC</span>
                    <span className="text-[10px] text-gray-500">FEE</span>
                </div>
                <div className="flex sm:justify-end gap-2">
                    <span className="text-gray-400">0.00001</span>
                    <span className="text-white">GOBV2</span>
                    <span className="text-[10px] text-blue-400">INCENTIVE</span>
                </div>
                <div className="flex sm:justify-end gap-2">
                    <span className="text-gray-400">0.0</span>
                    <span className="text-white">WELL</span>
                    <span className="text-[10px] text-blue-400">INCENTIVE</span>
                </div>
                <button className="text-[#00ff4e] text-xs font-medium mt-1 text-end hover:underline">
                    Claim
                </button>
            </div>
        </div>
    );
};

export default ClaimCard; 