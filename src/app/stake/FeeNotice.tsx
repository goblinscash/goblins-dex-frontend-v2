import React from 'react';

interface FeeNoticeProps {
  message: string;
}

const FeeNotice: React.FC<FeeNoticeProps> = ({ message }) => {
  return (
    <div className="bg-[#16161E] border border-[#2A2A2A] rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <div className="flex items-center justify-center rounded-full bg-amber-500 w-6 h-6 mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-black">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-amber-500 text-sm">
          {message}
        </div>
      </div>
    </div>
  );
};

export default FeeNotice; 