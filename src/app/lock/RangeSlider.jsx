import React, { useState } from "react";
import styled from "styled-components";

const RangeSlider = () => {
  const labels = ["7 Days", "1 Year", "2 Years", "3 Years", "4 Years"];
  const values = [7, 365, 730, 1095, 1460]; // Days corresponding to labels
  const [value, setValue] = useState(7);

  const handleChange = (event) => {
    const sliderValue = Number(event.target.value);
    setValue(sliderValue);
  };

  return (
    <div className="flex flex-col items-center p-4 w-full rounded-xl px-4 pb-4 bg-[#0b120d] border-[#2a2a2a] pt-6 border">
      <div className="mt-3 pb-8 text-xs text-start ">
        Locking for{" "}
        <span className="themeClr">
          {value <= 30 ? `${value} Days` : `${(value / 365).toFixed(1)} Years`}{" "}
        </span>
        for 0.0 veAERO voting power
      </div>
      <Slider
        type="range"
        min="0"
        max={values.length - 1}
        step="0.1"
        value={values.indexOf(value) !== -1 ? values.indexOf(value) : value}
        onChange={handleChange}
        className="w-full appearance-none bg-gray-300 h-2 rounded-lg"
      />
      <div className="flex justify-between w-full text-gray-700 mt-1">
        {labels.map((label, index) => (
          <span key={index} className="text-[10px]">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

const Slider = styled.input`
  -webkit-appearance: none;
  background: linear-gradient(90deg, #ffffff, #26d962);
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: #00ff4e;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #00ff4e;
    border-radius: 50%;
    cursor: pointer;
  }
`;

export default RangeSlider;
