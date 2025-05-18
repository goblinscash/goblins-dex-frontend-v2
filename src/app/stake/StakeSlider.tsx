import React, { useState, useEffect } from 'react';

interface StakeSliderProps {
  initialPercentage?: number;
  onChange?: (percentage: number) => void;
}

const StakeSlider: React.FC<StakeSliderProps> = ({ 
  initialPercentage = 100, 
  onChange 
}) => {
  const [percentage, setPercentage] = useState(initialPercentage);
  
  useEffect(() => {
    setPercentage(initialPercentage);
  }, [initialPercentage]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setPercentage(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };
  
  const handlePresetClick = (value: number) => {
    setPercentage(value);
    if (onChange) {
      onChange(value);
    }
  };
  
  return (
    <div className="w-full mb-6">
      <div className="text-gray-400 text-sm mb-2">
        Stake your deposit to start earning emissions.
      </div>
      
      <div className="relative pt-1">
        {/* Percentage label */}
        <div className="absolute right-0 -top-6 bg-gray-800 text-white px-2 py-1 rounded text-xs">
          {percentage}%
        </div>
        
        {/* Percentage ticks */}
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-400">0%</span>
          <span className="text-xs text-gray-400">25%</span>
          <span className="text-xs text-gray-400">50%</span>
          <span className="text-xs text-gray-400">75%</span>
          <span className="text-xs text-gray-400">100%</span>
        </div>
        
        {/* Slider */}
        <input
          type="range"
          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
          min="0"
          max="100"
          step="1"
          value={percentage}
          onChange={handleChange}
        />
      </div>
      
      {/* Quick select buttons */}
      <div className="flex justify-between gap-2 mt-3">
        <button 
          onClick={() => handlePresetClick(25)}
          className="px-3 py-1 bg-[#1A1A24] border border-[#2A2A2A] text-white text-xs rounded hover:bg-[#2A2A2A] transition-colors"
        >
          25%
        </button>
        <button 
          onClick={() => handlePresetClick(50)}
          className="px-3 py-1 bg-[#1A1A24] border border-[#2A2A2A] text-white text-xs rounded hover:bg-[#2A2A2A] transition-colors"
        >
          50%
        </button>
        <button 
          onClick={() => handlePresetClick(75)}
          className="px-3 py-1 bg-[#1A1A24] border border-[#2A2A2A] text-white text-xs rounded hover:bg-[#2A2A2A] transition-colors"
        >
          75%
        </button>
        <button 
          onClick={() => handlePresetClick(100)}
          className="px-3 py-1 bg-[#1A1A24] border border-[#2A2A2A] text-white text-xs rounded hover:bg-[#2A2A2A] transition-colors"
        >
          100%
        </button>
      </div>
    </div>
  );
};

export default StakeSlider; 