import Link from 'next/link';
import React from 'react';

interface LockData {
  id: string;
  amount: string;
  tokenSymbol: string;
  lockedFor: string;
  rebaseApr: string;
  rebaseAmount: string;
}

interface LockCardProps {
  lock: LockData;
}

const LockCard: React.FC<LockCardProps> = ({ lock }) => {
  return (
    <div className="w-full">
      <div className="w-full bg-[#0F1118] border border-[#2A2A2A] rounded-lg overflow-hidden p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Left section with lock info */}
          <div className="flex items-center">
            {/* Token Logo */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 mr-3">
              <svg width="30" height="30" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4L45.8923 40H2.10769L24 4Z" fill="#3461FF"/>
              </svg>
            </div>
            
            <div>
              <div className="flex items-center">
                <div className="text-white text-sm sm:text-lg font-medium">Lock #{lock.id}</div>
                <svg className="ml-2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div className="text-gray-400 text-xs sm:text-sm">{lock.amount} {lock.tokenSymbol} locked for {lock.lockedFor}</div>
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
              href="#"
              className="px-3 py-1.5 bg-transparent text-blue-400 font-medium rounded-md hover:bg-[#1E1E1E] transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              Increase
            </Link>
            <Link
              href="#"
              className="px-3 py-1.5 bg-transparent text-gray-400 font-medium rounded-md hover:bg-[#1E1E1E] transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              Extend
            </Link>
            <Link
              href="#"
              className="px-3 py-1.5 bg-transparent text-gray-400 font-medium rounded-md hover:bg-[#1E1E1E] transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              Merge
            </Link>
          </div>
          
          <button className="px-3 py-1.5 bg-transparent text-blue-400 font-medium rounded-md hover:bg-[#1E1E1E] transition-colors text-xs sm:text-sm whitespace-nowrap mt-2 sm:mt-0">
            Claim & Lock
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockCard; 