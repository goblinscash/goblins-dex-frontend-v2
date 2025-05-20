import { useEthersSigner } from '@/hooks/useEthersSigner';
import { aerodromeContracts } from '@/utils/config.utils';
import { ethers } from 'ethers';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useChainId } from 'wagmi';
import rewardDistAbi from "@/abi/aerodrome/rewardDistributor.json"
import Notify from '@/components/common/Notify';
import Link from 'next/link';

interface LockData {
  id: string;
  amount: string;
  tokenSymbol: string;
  lockedFor: string;
  rebaseApr: string;
  rebaseAmount: string;
  logoUri: string;
}

interface LockCardProps {
  lock: LockData;
}

const LockCard: React.FC<LockCardProps> = ({ lock }) => {

  const signer = useEthersSigner();
  const chainId = useChainId();
  const { address } = useAccount();
  const [load, setLoad] = useState<{ [key: string]: boolean }>({});

  const handleLoad = (action: string, status: boolean) => {
    setLoad((prev) => ({ ...prev, [action]: status }));
  };

  const claim = async () => {
    try {
      if (!address) return toast.warn("Please connect your wallet");
      handleLoad("Claim", true);

      const rewardDist = new ethers.Contract(
        aerodromeContracts[chainId].rewardDistributor,
        rewardDistAbi,
        await signer
      );

      const tx = await rewardDist.claim(lock.id, { gasLimit: 5000000 });
      await tx.wait();
      Notify({ chainId, txhash: tx.hash });
      handleLoad("Claim", false);
    } catch (error) {
      console.log(error);
      handleLoad("Claim", false);
    }
  };


  return (
    <div className="w-full">
      <div className="w-full bg-[#0F1118] border border-[#2A2A2A] rounded-lg overflow-hidden p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Left section with lock info */}
          <div className="flex items-center">
            {/* Token Logo */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 mr-3">
              <img
                src={lock.logoUri}
                alt={lock.tokenSymbol}
                className="w-7 h-7 mt-0.5 rounded-md object-cover"
              />
            </div>

            <div>
              <div className="flex items-center">
                <div className="text-white text-sm sm:text-lg font-medium">Lock #{lock.id}</div>
                <svg className="ml-2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div className="text-gray-400 text-xs sm:text-sm">{lock.amount} {lock.tokenSymbol} {lock.lockedFor}</div>
            </div>
          </div>

          {/* Right section with APR and rebases */}
          <div className="flex items-center gap-6 ml-11 sm:ml-0">
            <div className="text-right">
              <div className="text-gray-400 text-xs sm:text-sm">Rebase APR</div>
              <div className="text-white text-sm sm:text-base font-medium">{lock.rebaseApr}</div>
            </div>

            <div className="text-right">
              <div className="text-gray-400 text-xs sm:text-sm">Rebases</div>
              <div className="text-white text-sm sm:text-base font-medium">{lock.rebaseAmount} {lock.tokenSymbol}</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap justify-between items-center mt-4">
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/lock?increase=true&id=${lock.id}`}
              className="px-3 py-1.5 bg-transparent text-neon-green font-medium rounded-md transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              Increase
            </Link>
            <Link
              href={`/lock?extend=true&id=${lock.id}`}
              className="px-3 py-1.5 bg-transparent text-neon-green font-medium rounded-md transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              Extend
            </Link>
            <Link
              href={`/lock?merge=true&id=${lock.id}`}
              className="px-3 py-1.5 bg-transparent text-neon-green font-medium rounded-md transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              Merge
            </Link>
          </div>

          <button
            className="px-3 py-1.5 bg-transparent text-neon-green font-medium rounded-md transition-colors text-xs sm:text-sm whitespace-nowrap mt-2 sm:mt-0"
            onClick={() => claim()}
            disabled={load["Claim"]}
          >
            {load["Claim"] ? "Processing" : "Claim & Lock"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockCard; 