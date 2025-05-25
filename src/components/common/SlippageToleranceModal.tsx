import React, { useState, useEffect } from 'react';

interface SlippageToleranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSlippageChange: (slippage: number) => void;
  currentSlippage: number;
  customInputValue: string;
  onCustomInputChange: (value: string) => void;
  onPillSelect: (value: number) => void;
}

const SlippageToleranceModal: React.FC<SlippageToleranceModalProps> = ({
  isOpen,
  onClose,
  onSlippageChange,
  currentSlippage,
  customInputValue,
  onCustomInputChange,
  onPillSelect,
}) => {
  // Pre-defined slippage options
  const slippageOptions = [0.0001, 0.001, 0.005, 0.01, 0.05]; // 0.01%, 0.1%, 0.5%, 1%, 5%

  // Validate input to ensure it's a valid number
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty input or valid numbers
    if (value === '' || (/^\d*\.?\d*$/.test(value) && !isNaN(parseFloat(value)))) {
      onCustomInputChange(value);
      
      if (value !== '') {
        const numValue = parseFloat(value) / 100; // Convert percentage to decimal
        onSlippageChange(numValue);
      }
    }
  };

  // Handle pill selection
  const handlePillSelect = (value: number) => {
    onPillSelect(value);
    onSlippageChange(value);
    
    // Update custom input field to match the selected pill
    onCustomInputChange((value * 100).toString());
  };

  // Format percentage for display
  const formatPercentage = (value: number): string => {
    if (value === 0.0001) return '0.01%';
    if (value === 0.001) return '0.1%';
    if (value === 0.005) return '0.5%';
    if (value === 0.01) return '1%';
    if (value === 0.05) return '5%';
    return `${(value * 100).toFixed(2)}%`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-[9999] inset-0 flex items-center justify-center">
      <div className="absolute inset-0 bg-black z-[9] opacity-70" onClick={onClose}></div>
      <div className="relative p-4 px-lg-5 mx-auto rounded-lg z-[9999] bg-[#272625] w-full max-w-[400px]">
        <div className="flex justify-between items-center mb-4">
          <h4 className="m-0 font-bold text-xl text-white">Slippage tolerance</h4>
          <button onClick={onClose} className="border-0 p-0 bg-transparent text-white">
            <svg
              width="16"
              height="16"
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
          </button>
        </div>
        
        <div className="mt-4 text-gray-300 text-sm">
          <p className="mb-4">
            Slippage is the difference between the current market price of a token and the price at which 
            the actual swap is executed. Volatile tokens usually require a larger value.
          </p>
          
          <div className="relative mt-6 mb-4">
            <input
              type="text"
              value={customInputValue}
              onChange={handleInputChange}
              className="w-full h-[40px] px-3 py-2 bg-[#1a1a1a] text-white border border-gray-700 rounded-md focus:outline-none focus:border-blue-500"
              placeholder="0.5"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              %
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mt-4">
            {slippageOptions.map((option) => (
              <button
                key={option}
                onClick={() => handlePillSelect(option)}
                className={`py-2 px-3 rounded-md text-center text-sm transition-colors ${
                  currentSlippage === option
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]'
                }`}
              >
                {formatPercentage(option)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlippageToleranceModal; 