import React, { useMemo } from "react";
import styled from "styled-components";

// Define Maximum Expiry Constants
// const MAX_EXPIRY_SECONDS = Math.floor(new Date('2029-12-31T23:59:59Z').getTime() / 1000); // Removed
const FOUR_YEARS_IN_SECONDS = 4 * 365.25 * 24 * 3600; // Approx.
const NOW_SECONDS = Math.floor(Date.now() / 1000);

const valueMap = [
    {days: 1, label: "1 Day"}, {days: 7, label: "7 Days"}, {days: 14, label: "14 Days"}, {days: 21, label: "21 Days"}, {days: 30, label: "1 Month"},
    {days: 30*2, label: "2 Months"}, {days: 30*3, label: "3 Months"}, {days: 30*4, label: "4 Months"}, {days: 30*5, label: "5 Months"},
    {days: 30*6, label: "6 Months"}, {days: 30*7, label: "7 Months"}, {days: 30*8, label: "8 Months"}, {days: 30*9, label: "9 Months"},
    {days: 30*10, label: "10 Months"}, {days: 30*11, label: "11 Months"}, {days: 30*12, label: "12 Months"}, // Approx months
    {days: 365, label: "1 Year"}, {days: 365*2, label: "2 Years"}, {days: 365*3, label: "3 Years"}, {days: 365*4, label: "4 Years"}
];
const baseValues = valueMap.map(item => item.days);
const baseLabels = valueMap.map(item => item.label);

const RangeSlider = ({ value, onChange, title, currentLockExpiresAt }) => {

  const { filteredValues, filteredLabels, sliderValueIndex } = useMemo(() => {
    let localFilteredValues = [...baseValues];
    let localFilteredLabels = [...baseLabels];

    if (currentLockExpiresAt && currentLockExpiresAt > 0) {
        localFilteredValues = [];
        localFilteredLabels = [];
        baseValues.forEach((durationDays, index) => {
            const potentialNewExpiry = currentLockExpiresAt + (durationDays * 24 * 3600);
            // Apply both caps: MAX_EXPIRY_SECONDS and (NOW_SECONDS + FOUR_YEARS_IN_SECONDS)
            // const cappedByMaxExpiry = Math.min(potentialNewExpiry, MAX_EXPIRY_SECONDS);
            // const cappedByFourYears = Math.min(potentialNewExpiry, NOW_SECONDS + FOUR_YEARS_IN_SECONDS);
            // The effective cap is the stricter of the two individual caps relative to the potentialNewExpiry
            // However, the problem describes applying caps sequentially or finding the overall minimum
            // The most restrictive end date is min(MAX_EXPIRY_SECONDS, NOW_SECONDS + FOUR_YEARS_IN_SECONDS)
            // A simpler way to apply both caps to potentialNewExpiry:
            // const cappedNewExpiry = Math.min(potentialNewExpiry, MAX_EXPIRY_SECONDS, NOW_SECONDS + FOUR_YEARS_IN_SECONDS); // Old logic
            const cappedNewExpiry = Math.min(potentialNewExpiry, NOW_SECONDS + FOUR_YEARS_IN_SECONDS); // New logic

            if (cappedNewExpiry > currentLockExpiresAt) {
                localFilteredValues.push(durationDays);
                localFilteredLabels.push(baseLabels[index]);
            }
        });
    }

    if (localFilteredValues.length === 0) {
        // This means no valid extension period. Parent (Extend.tsx) should ideally hide/disable.
        // To make RangeSlider robust, provide a minimal valid array.
        // The value '0' for days might be problematic if parent expects a positive duration.
        // For now, using the smallest base value or a special "N/A" value.
        // If we must return a value from baseValues, it implies the slider is still somewhat active.
        // The parent component Extend.tsx has logic to display "Cannot extend further..."
        // So, RangeSlider can reflect this by having limited/no options.
        // If truly no options, an empty list is fine, but the slider UI might break.
        // Let's provide a single "N/A" option.
        localFilteredValues = [0]; // Representing no valid extension
        localFilteredLabels = ["N/A (Maxed Out)"];
    }

    let currentSliderValIndex = localFilteredValues.indexOf(value); // value is the prop from parent (Extend.tsx)

    if (currentSliderValIndex === -1) {
        // The current 'value' from parent is no longer in the valid filtered list.
        if (localFilteredValues.length > 0) {
            // Schedule an update to the parent (Extend.tsx) with the new default valid value.
            // This new default is typically localFilteredValues[0], which could be 0 for "N/A" state.
            setTimeout(() => {
                if (value !== localFilteredValues[0]) { // Only call onChange if the value actually needs to change
                    onChange(localFilteredValues[0]);
                }
            }, 0);
            currentSliderValIndex = 0; // Set the slider to the first valid (or N/A) option.
        } else {
            // This case should ideally not happen if localFilteredValues always gets at least one entry (e.g., [0]).
            // If it does, set to a safe default.
            currentSliderValIndex = 0; 
            // If localFilteredValues is truly empty, the component might still have issues with max/value attributes.
            // The logic for populating localFilteredValues ensures it's never empty (defaults to [0]).
        }
    }
    // Ensure sliderValueIndex is always valid, even if value prop was initially out of new filtered bounds
    // or if localFilteredValues was empty and currentSliderValIndex remained uninitialised from previous logic.
    // However, the above 'if' block already sets currentSliderValIndex = 0 if value was not found.
    // So, this check is more of a safeguard or can be simplified if currentSliderValIndex is guaranteed to be set.
    if (currentSliderValIndex < 0 || currentSliderValIndex >= localFilteredValues.length) {
       // This condition implies localFilteredValues might be empty and currentSliderValIndex wasn't set,
       // but the code above ensures localFilteredValues has at least `[0]`.
       // So, this mainly guards against currentSliderValIndex somehow being out of bounds.
       currentSliderValIndex = 0;
    }
    
    return { filteredValues: localFilteredValues, filteredLabels: localFilteredLabels, sliderValueIndex: currentSliderValIndex };
  }, [currentLockExpiresAt, value, onChange]);


  // These displayLabels are for the track ticks. Keeping them static for now as per instructions.
  // A more dynamic approach would be to pick N items from filteredLabels.
  const trackDisplayLabels = ["7 Days", "1 Year", "2 Years", "3 Years", "4 Years"];

  const handleChange = (event) => {
    const newSliderIndex = Number(event.target.value);
    if (filteredValues[newSliderIndex] !== undefined && (filteredValues[0] !== 0 || filteredValues.length > 1) ) { // Ensure not N/A state
        onChange(filteredValues[newSliderIndex]);
    }
  };

  const currentLabel = (filteredLabels && filteredLabels[sliderValueIndex]) || "N/A";


  return (
    <div className="flex flex-col items-center p-4 w-full rounded-xl px-4 pb-4 bg-[#0b120d] border-[#2a2a2a] pt-6 border">
      <div className="mt-3 pb-8 text-xs text-start">
        {title} <span className="themeClr">{currentLabel}</span> for 0.0 veGOBV2 voting power
      </div>
      <Slider
        type="range"
        min="0"
        max={filteredValues.length - 1}
        step="1"
        value={sliderValueIndex}
        onChange={handleChange}
        disabled={filteredValues.length === 1 && filteredValues[0] === 0} // Disable if only "N/A"
        className="w-full appearance-none bg-gray-300 h-2 rounded-lg"
      />
      <div className="flex justify-between w-full text-gray-400 mt-1">
        {trackDisplayLabels.map((item, index) => ( // Using static trackDisplayLabels for now
          <span
            key={index}
            className="text-[10px] "
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

const Slider = styled.input`
  -webkit-appearance: none;
  background: linear-gradient(90deg, #ffffff, #26d962);
  &:disabled {
    background: #555; // Darker background for disabled state
    opacity: 0.5;
  }
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: #00ff4e;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
  }
  &:disabled::-webkit-slider-thumb {
    background: #777; // Greyed-out thumb for disabled state
    cursor: not-allowed;
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #00ff4e;
    border-radius: 50%;
    cursor: pointer;
  }
  &:disabled::-moz-range-thumb {
    background: #777; // Greyed-out thumb for disabled state
    cursor: not-allowed;
  }
`;

export default RangeSlider;
