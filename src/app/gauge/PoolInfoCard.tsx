import React, { useState } from 'react';
import PoolInfoModal from './PoolInfoModal';
import Logo from '@/components/common/Logo';

interface PoolInfoCardProps {
  chainId: number;
  token0: string;
  token1: string;
  token0Name: string;
  token1Name: string;
  fee: string;
  type: string;
  labelName: string;
}

const PoolInfoCard: React.FC<PoolInfoCardProps> = ({
  chainId,
  token0,
  token1,
  token0Name,
  token1Name,
  fee,
  type,
  labelName
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="w-full bg-[#0F1118] border border-[#2A2A2A] rounded-lg overflow-hidden p-4 mb-4">
      <h1 className="flex items-center gap-2 border-b border-[#273257] pb-3 text-lg font-semibold sm:pb-5 sm:text-xl mb-6">{labelName}</h1>
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <div className="flex items-center">
          {/* Token Icons */}
          <div className="flex items-center">

            <div className={`w-10 h-10 rounded-full flex items-center justify-center -ml-4`}>
              <Logo
                chainId={chainId}
                token={token0}
                margin={0}
                height={28}
              /> {" "}
            </div>

            <div className={`w-10 h-10 rounded-full flex items-center justify-center -ml-4`}>
              <Logo
                chainId={chainId}
                token={token1}
                margin={0}
                height={28}
              />
            </div>
          </div>

          {/* Token info */}
          <div className="ml-3">
            <div className="flex items-center">
              <span className="text-white text-base font-medium">{token0Name} / {token1Name}</span>
              <span className="ml-2 text-gray-400 text-sm">{fee}</span>
            </div>
            <div className="text-blue-400 text-sm">{type}</div>
          </div>
        </div>

        <div>
          <button
            onClick={openModal}
            className="px-3 py-2 bg-[#131E40] text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Pool Info
          </button>
        </div>
      </div>

      {/* Pool Info Modal */}
      {/* <PoolInfoModal
        isOpen={isModalOpen}
        onClose={closeModal}
        token0={token0}
        token1={token1}
        fee={fee}
        type={type}
      /> */}
    </div>
  );
};

export default PoolInfoCard; 