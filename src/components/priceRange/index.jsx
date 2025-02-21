"use client"
import React from "react";

const PriceRangeGraph = ({ lowerPrice, upperPrice, currentPrice, widthPercentage, apr }) => {
  const range = upperPrice - lowerPrice;
  const lowerPosition = 0;
  const upperPosition = 100;
  let currentPosition = ((currentPrice - lowerPrice) / range) * 100;

  // Ensure current price is always within bounds
  currentPosition = Math.max(5, Math.min(95, currentPosition));

  return (
    <div className="w-full  pt-4 bg-black text-white rounded-lg shadow-md">
      <div className="flex px-4 justify-between text-sm mb-2">
        <span>Current position</span>
        <span>Width: {widthPercentage}%</span>
        <span>APR: {apr}%</span>
      </div>
      <div className="relative w-full h-14 bg-green-900 rounded-md">
        {/* Lower Price Vertical Line & Label */}
        <div
          className="absolute w-0.5 h-full bg-green-500"
          style={{ left: `${lowerPosition}%`, transform: "translateX(-50%)" }}
        ></div>
        <div
          className="absolute text-xs bg-[#15803dbf] px-1 py-0.5 rounded"
          style={{ left: `${lowerPosition}%`, transform: "translateX(-50%)" }}
        >
          {lowerPrice}
        </div>

        {/* Current Price Vertical Line & Label */}
        <div
          className="absolute w-0.5 h-full bg-blue-500"
          style={{ left: `${currentPosition}%`, transform: "translateX(-50%)" }}
        ></div>
        <div
          className="absolute text-xs bg-[#1d4ed8b3] px-1 py-0.5 rounded"
          style={{ left: `${currentPosition}%`, transform: "translateX(-50%)" }}
        >
          {currentPrice}
        </div>

        {/* Upper Price Vertical Line & Label */}
        <div
          className="absolute w-0.5 h-full bg-green-500"
          style={{ left: `${upperPosition}%`, transform: "translateX(-50%)" }}
        ></div>
        <div
          className="absolute text-xs bg-[#15803dbf] px-1 py-0.5 rounded"
          style={{ left: `${upperPosition}%`, transform: "translateX(-50%)" }}
        >
          {upperPrice}
        </div>
      </div>
    </div>
  );
};

export default PriceRangeGraph