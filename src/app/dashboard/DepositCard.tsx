import Logo from '@/components/common/Logo';
import React, { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useRouter } from 'next/navigation'
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import poolAbi from "@/abi/aerodrome/pool.json"
import Notify from '@/components/common/Notify';
import { zeroAddr } from '@/utils/config.utils';
import gaugeAbi from "@/abi/aerodrome/gauge.json"
import Tooltip from '@/components/common/Tooltip';
import { showErrorToast, showSuccessToast } from '@/utils/toast/toast.utils';


interface TokenPair {
  index: number;
  lp: string;
  gauge: string;
  token0: string;
  token1: string;
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
  position?: number;
  tickUpper?: string;
  tickLower?: string;
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
  const [load, setLoad] = useState<{ [key: string]: boolean }>({});
  const signer = useEthersSigner();
  const chainId = useChainId();
  const { address } = useAccount();

  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter()

  console.log(tokenPair, "tokenPair", depositId)

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

  const navigate = (type: string) => {
    if (type == "deposit") {
      router.push(`/deposit?token0=${tokenPair.token0}&token1=${tokenPair.token1}&type=${tokenPair.type}`)
    } else if (type == "stake") {
      router.push(`/gauge?stake=true&pool=${tokenPair.lp}&type=${tokenPair.type}&id=${tokenPair.index || 0}&position=${tokenPair.position}`)
    } else if (type == "withdraw") {
      router.push(`/gauge?withdraw=true&token0=${tokenPair.token0}&token1=${tokenPair.token1}&type=${tokenPair.type}&id=${tokenPair.index || 0}&position=${tokenPair.position}`)
    }
  }

  const handleLoad = (action: string, status: boolean) => {
    setLoad((prev) => ({ ...prev, [action]: status }));
  };

  const claimPoolFee = async () => {
    let txHash: string = "";
    try {

      if (!address) return toast.warn("Please connect your wallet");
      if (!tokenPair.lp) return;

      handleLoad("Claim", true);

      const poolInstance = new ethers.Contract(
        tokenPair.lp,
        poolAbi,
        await signer
      );

      const tx = await poolInstance.claimFees(
        {
          gasLimit: 5000000
        }
      );
      txHash = tx?.hash;
      await tx.wait()
      // Notify({ chainId, txhash: tx.hash });
      showSuccessToast(chainId, tx.hash);
      handleLoad("Claim", false);
    } catch (error) {
      console.log(error);
      handleLoad("Claim", false);
      if (txHash) {
        showErrorToast(chainId, txHash);
      }
      else showErrorToast();
    }

  }

  const claimGuageReward = async () => {
    let txHash: string = "";
    try {
      if (!address) return toast.warn("Please connect your wallet");
      if (tokenPair?.gauge == zeroAddr) return toast.warn("Gauge not found for this pool")
      if (Number(tokenPair.emissionsAmount) == 0) return toast.warn("Emission is zero.")

      handleLoad("ClaimGuageReward", true);

      const gaugeInstance = new ethers.Contract(
        tokenPair.gauge,
        gaugeAbi,
        await signer
      );

      const tx = await gaugeInstance.getReward(
        address,
        {
          gasLimit: 5000000
        }
      );

      txHash = tx?.hash;
      await tx.wait()
      // Notify({ chainId, txhash: tx.hash });
      showSuccessToast(chainId, tx?.hash);
      handleLoad("ClaimGuageReward", false);
    } catch (error) {
      console.log(error);
      handleLoad("ClaimGuageReward", false);
      if (txHash) {
        showErrorToast(chainId, txHash);
      }
      else showErrorToast();
    }
  }

  // Tooltip content component
  const TooltipContent = () => (
    <div className="flex flex-col gap-3">
      <div>
        <div className="text-gray-400 text-xs mb-1">Pool Address</div>
        <div className="flex items-center justify-between">
          <div className="text-white text-xs font-medium">{tokenPair.lp ? (tokenPair.lp.slice(0, 6) + '...' + tokenPair.lp.slice(-5)) : 'N/A'}</div>
          <button
            className="text-white hover:text-neon-green"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(tokenPair.lp || '');
              toast.success('Address copied to clipboard');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
          </button>
        </div>
      </div>

      <div>
        <div className="text-gray-400 text-xs mb-1">Gauge Address</div>
        <div className="flex items-center justify-between">
          <div className="text-white text-xs font-medium">{tokenPair.gauge ? (tokenPair.gauge.slice(0, 6) + '...' + tokenPair.gauge.slice(-5)) : 'N/A'}</div>
          <button
            className="text-white hover:text-neon-green"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(tokenPair.gauge || '');
              toast.success('Address copied to clipboard');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
          </button>
        </div>
      </div>
    </div>
  );



  function toFixedValue(value: string): string {
    return Number(value).toFixed(3);
  }


  return (
    <div className="w-full">
      {/* Pool Info Header */}
      <div className="w-full bg-[#000E0E] border border-[#2A2A2A] rounded-lg overflow-hidden mb-2 p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex items-center">
            {/* Token Icons */}
            <div className="flex items-center gap-3">
              <ul className="list-none pl-3 mb-0 flex-shrink-0 flex items-center">
                <li className="" style={{ marginLeft: -10 }}>
                  <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                    <Logo
                      chainId={chainId}
                      token={tokenPair.token0}
                      margin={0}
                      height={28}
                    />{" "}
                  </div>
                </li>
                <li className="" style={{ marginLeft: -10 }}>
                  <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                    <Logo
                      chainId={chainId}
                      token={tokenPair.token1}
                      margin={0}
                      height={28}
                    />{" "}
                  </div>
                </li>
              </ul>
            </div>

            {/* Token info */}
            <div className="ml-2 sm:ml-3">
              <div className="flex items-center">
                <span className="text-white text-sm sm:text-base font-medium">{tokenPair.token0Name} / {tokenPair.token1Name}</span>
                <span className="ml-2 text-gray-500 text-xs">{tokenPair.fee}%</span>
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
              <div className="text-neon-green text-xs">{tokenPair.type}</div>
            </div>
          </div>

          <div className="text-right mt-1 sm:mt-0">
            <div className="text-gray-500 text-xs hidden sm:block">Deposited</div>
            <div className="text-white text-sm hidden sm:text-base font-medium sm:block">{tokenPair.depositedUsd}</div>
            <div className='sm:hidden flex justify-between items-center'>
              <span className='text-gray-500 text-xs'>Deposited</span>
              <span className="text-white text-sm sm:text-base font-medium">{tokenPair.depositedUsd}</span>
            </div>
            <div className="text-gray-500 hidden sm:block text-xs">{tokenPair.poolTotalUsd} Pool Total</div>
          </div>
        </div>
      </div>

      {/* Collapsible Deposit Section */}
      <div className="w-full bg-[#000E0E] border border-[#2A2A2A] rounded-lg overflow-hidden">
        {/* Header with Toggle Button */}
        <div
          className="flex items-center justify-between p-3 sm:p-4 border-b border-[#2A2A2A] cursor-pointer"
          onClick={toggleExpand}
        >
          <div className="flex items-center">
            <button className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="ml-1 sm:ml-2 text-white text-sm font-medium whitespace-nowrap">Deposit #{tokenPair.position}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white opacity-60 text-xs hidden sm:inline">{isExpanded ? 'Hide' : 'Show'} Details</span>
            <button
              onClick={() => navigate("deposit")}
              className="px-2 sm:px-3 py-1 sm:py-1.5 text-neon-green text-xs font-medium rounded-md whitespace-nowrap"
            >
              Deposit
            </button>
          </div>
        </div>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#2A2A2A]">
            {/* Staked Column */}
            <div className="p-3 sm:p-4">
              <div className="text-gray-400 text-xs mb-2">Staked</div>
              <div className="text-white text-sm font-medium">
                {toFixedValue(tokenPair.token0Amount)} {tokenPair.token0Name}
              </div>
              <div className="text-white text-sm font-medium">
                {toFixedValue(tokenPair.token1Amount)} {tokenPair.token1Name}
              </div>
            </div>

            {/* Unstaked Column */}
            <div className="p-3 sm:p-4">
              <div className="text-gray-400 text-xs mb-2">Unstaked</div>
              <div className="text-white text-sm font-medium">
                {toFixedValue(tokenPair.unstaked0Amount)} {tokenPair.token0Name}
              </div>
              <div className="text-white text-sm font-medium">
                {toFixedValue(tokenPair.unstaked1Amount)} {tokenPair.token1Name}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => navigate("stake")}>
                  <span className="px-2 sm:px-3 py-1 text-neon-green text-xs font-medium rounded-md hover:bg-[#3A3A3A] transition-colors whitespace-nowrap">
                    Stake
                  </span>
                </button>
                <button onClick={() => navigate("withdraw")}>
                  <span className="px-2 sm:px-3 py-1 text-neon-green text-xs font-medium rounded-md hover:bg-[#3A3A3A] transition-colors whitespace-nowrap">
                    Withdraw
                  </span>
                </button>
              </div>
            </div>

            {/* APR Column */}
            <div className="p-3 sm:p-4">
              <div className="text-gray-400 text-xs mb-2">APR</div>
              <div className="text-white text-sm font-bold">{toFixedValue(tokenPair.apr.split('%')[0])}%</div>
            </div>

            {/* Emissions Column */}
            <div className="p-3 sm:p-4">
              <div className="text-gray-400 text-xs mb-2">Emissions</div>
              <div className="text-white text-sm font-bold">
                {toFixedValue(tokenPair.emissionsAmount)} {tokenPair.emissionsToken}
              </div>
              <div className="flex mt-4">
                <button
                  onClick={claimGuageReward}
                  className="px-2 sm:px-3 py-1 text-neon-green text-xs font-medium rounded-md transition-colors whitespace-nowrap"
                >
                  {load["ClaimGuageReward"] ? "Processing..." : "Claim"}
                </button>
              </div>
            </div>

            {/* Trading Fees Column */}
            <div className="p-3 sm:p-4">
              <div className="text-gray-400 text-xs mb-2">Trading Fees</div>
              <div className="text-white text-sm font-bold">
                {toFixedValue(tokenPair.tradingFees0)} {tokenPair.token0Name}
              </div>
              <div className="text-white text-sm font-bold">
                {toFixedValue(tokenPair.tradingFees1)} {tokenPair.token1Name}
              </div>
              <div className="flex mt-4">
                <button
                  onClick={claimPoolFee}
                  className="px-2 sm:px-3 py-1 text-neon-green text-xs font-medium rounded-md transition-colors whitespace-nowrap"
                >
                  {load["Claim"] ? "Processing..." : "Claim"}
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