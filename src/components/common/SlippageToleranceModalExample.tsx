import React, { useState } from 'react';
import SlippageToleranceModal from './SlippageToleranceModal';

const SlippageToleranceModalExample: React.FC = () => {
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for slippage values
  const [slippage, setSlippage] = useState(0.01); // Default 1%
  const [customInputValue, setCustomInputValue] = useState('1'); // Default 1%
  
  // Handler for opening the modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  
  // Handler for closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  // Handler for slippage change
  const handleSlippageChange = (newSlippage: number) => {
    setSlippage(newSlippage);
    console.log(`Slippage set to: ${newSlippage * 100}%`);
  };
  
  // Handler for custom input change
  const handleCustomInputChange = (value: string) => {
    setCustomInputValue(value);
  };
  
  // Handler for pill selection
  const handlePillSelect = (value: number) => {
    // Additional logic can be added here if needed
    console.log(`Pill selected: ${value * 100}%`);
  };
  
  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Current Settings</h2>
        <p>Slippage Tolerance: {(slippage * 100).toFixed(2)}%</p>
      </div>
      
      <button 
        onClick={handleOpenModal}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Set Slippage Tolerance
      </button>
      
      {/* SlippageToleranceModal Component */}
      <SlippageToleranceModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSlippageChange={handleSlippageChange}
        currentSlippage={slippage}
        customInputValue={customInputValue}
        onCustomInputChange={handleCustomInputChange}
        onPillSelect={handlePillSelect}
      />
    </div>
  );
};

export default SlippageToleranceModalExample; 