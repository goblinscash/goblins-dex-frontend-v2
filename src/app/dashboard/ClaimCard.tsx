import React from 'react';

interface ClaimCardProps {
    positionId: number;
    token0Symbol: string;
    token1Symbol: string;
    token0Logo: string;
    token1Logo: string;
    amount0: string;
    amount1: string;
    onClaim: () => void;
    lpDisplayName: string; // e.g., "WETH / USDC"
    poolFeeStr: string;    // e.g., "0.0405%"
    poolTypeStr: string;   // e.g., "Concentrated Volatile 100" or "Basic Stable"
    // poolManagementTag?: string; // e.g., "ALM", if available and needed from page.tsx
}

const ClaimCard: React.FC<ClaimCardProps> = (props) => {
    const { 
        positionId, 
        token0Symbol, 
        token1Symbol, 
        token0Logo, 
        token1Logo, 
        amount0, 
        amount1, 
        onClaim, 
        lpDisplayName, 
        poolFeeStr, 
        poolTypeStr 
    } = props;

    return (
        <div className="bg-[#000E0E] [align-items:normal] text-white p-4 sm:p-6 rounded-xl flex flex-col sm:flex-row justify-between align-top border border-[#1E2233]">
            {/* Left side */}
            <div className='border-accent-10 border-b flex flex-col gap-5 lg:border-b-0 lg:border-r lg:mb-0 lg:pb-0 lg:w-80 mb-4 mr-5 pb-4 w-full'>
                <div className="flex items-start gap-4 w-full sm:w-auto">
                    <div className="flex-shrink-0">
                        <div className="flex -space-x-2">
                            <img className="shrink-0 rounded-full transition size-10" src={token0Logo} loading="lazy" alt={`${token0Symbol} logo`} />
                            <img className="shrink-0 rounded-full transition size-10" src={token1Logo} loading="lazy" alt={`${token1Symbol} logo`} />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            {lpDisplayName}
                            <span className="text-xs bg-[#1E2233] text-gray-300 px-1.5 py-0.5 rounded">{poolFeeStr}</span>
                            {/* If poolManagementTag is available and needed, it can be added here */}
                            {/* <span className="text-xs bg-[#1E2233] text-gray-400 px-1.5 py-0.5 rounded">ALM</span> */}
                        </div>
                        <div className="text-sm text-[#00ff4e] hover:underline cursor-pointer">
                            {poolTypeStr}
                        </div>
                    </div>
                </div>
            </div>
            {/* Center info section */}
            <div className="text-sm text-gray-300 mt-4 sm:mt-0 sm:px-6">
                <span className='flex items-center mb-1'>
                    <span className="font-semibold text-white">Position ID: {positionId}</span>
                </span>
            </div>

            {/* Right side values */}
            <div className="flex flex-col gap-1 text-xs text-right mt-4 sm:mt-0 sm:ml-auto">
                <div className="flex sm:justify-end gap-2">
                    <span className="text-gray-400">{amount0}</span>
                    <span className="text-white">{token0Symbol}</span>
                    <span className="text-[10px] text-gray-500">FEE</span>
                </div>
                <div className="flex sm:justify-end gap-2">
                    <span className="text-gray-400">{amount1}</span>
                    <span className="text-white">{token1Symbol}</span>
                    <span className="text-[10px] text-gray-500">FEE</span>
                </div>
                <button 
                    onClick={onClaim}
                    className="text-[#00ff4e] text-xs font-medium mt-1 text-end hover:underline"
                >
                    Claim
                </button>
            </div>
        </div>
    );
};

export default ClaimCard;