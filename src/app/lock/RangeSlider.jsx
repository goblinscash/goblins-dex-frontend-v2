'use client'
import React, { useMemo } from "react";
import Slider from '@mui/material/Slider';

const marks = [
  { value: 1, label: "1 D" },
  { value: 365, label: "1 Y" },
  { value: 730, label: "2 Y" },
  { value: 1095, label: "3 Y" },
  { value: 1460, label: "4 Y" },
];

const NOW_SECONDS = Math.floor(Date.now() / 1000);
const MAX_LOCK_DAYS = 1460; // 4 years approx

// Helper to convert days to readable label
const formatDaysLabel = (days) => {
  if (days === 1) return "1 Day";

  if (days < 30) return `${days} Days`;

  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remDays = days % 30;

  let label = "";
  if (years > 0) label += `${years} Year${years > 1 ? "s" : ""} `;
  if (months > 0) label += `${months} Month${months > 1 ? "s" : ""} `;
  if (years === 0 && months === 0) label += `${remDays} Day${remDays > 1 ? "s" : ""}`;

  return label.trim();
};

const RangeSlider = ({ value, onChange, title, currentLockExpiresAt, activeSlider = false }) => {
  // Slider min 1 day, max 4 years (1460 days)
  const min = 1;
  const max = MAX_LOCK_DAYS;

  // Filtering based on currentLockExpiresAt if needed
  const filteredMin = currentLockExpiresAt && currentLockExpiresAt > 0 ? 1 : min;
  const filteredMax = currentLockExpiresAt && currentLockExpiresAt > 0 ? MAX_LOCK_DAYS : max;

  // Clamp value between min and max
  const sliderValue = Math.min(Math.max(value, filteredMin), filteredMax);

  // On slider change, just pass new days value
  const handleSliderChange = (_, newValue) => {
    onChange(newValue);
  };

  return (
    <div className="flex flex-col items-center p-4 w-full rounded-xl px-4 pb-4 bg-[#0b120d] border-[#2a2a2a] pt-6 border">
      <div className="mt-3 pb-8 text-xs text-start w-full">
        {title} <span className="themeClr">{formatDaysLabel(sliderValue)}</span> for 0.0 veGOBV2 voting power
      </div>

      <Slider
        aria-label="Lock Duration"
        value={sliderValue}
        onChange={handleSliderChange}
        step={1}
        min={min}
        max={max}
        marks={marks}
        valueLabelDisplay="off"
        disabled={activeSlider}
        sx={{
          color: 'green',  // slider ka main color green ho jayega
          '& .MuiSlider-thumb': {
            borderColor: 'green',
            // agar thumb me aur styling chahiye toh yahan add kar
          },
          '& .MuiSlider-rail': {
            opacity: 0.3,
            backgroundColor: 'green',
          },
          '& .MuiSlider-track': {
            backgroundColor: 'green',
          },
          '& .MuiSlider-markLabel': {
            color: 'white',  // marks label white kar diya
            fontWeight: 'bold',
            fontSize: "10px",

          },
        }}
      />
    </div>
  );
};

export default RangeSlider;
