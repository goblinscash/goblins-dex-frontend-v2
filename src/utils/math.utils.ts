import { ethers } from "ethers";

export const shortenPubkey = (address: string): string => {
    if (!address) {
        return ''
    }
    return `${address.slice(0, 5)}...${address.slice(-5)}`;
};

export const fromUnits = (value: bigint, decimals: number): string => {
    return ethers.formatUnits(value, decimals);
}

export const toUnits = (value: string | number, decimals: number): bigint => {
    return ethers.parseUnits(value.toString(), decimals);
}

// export const calculateAPR = (poolData, incentiveData, rewardAmount, usdPrice) => {

//     usdPrice = parseFloat(usdPrice)
  
//     const { startTime, endTime } = incentiveData;
//     const rewardPeriodSeconds = endTime - startTime;
//     // const rewardPeriodYears =  (365 * 24 * 60 * 60);
//     const rewardPeriodYears = rewardPeriodSeconds / (365 * 24 * 60 * 60);
  
//     let calculateReward = usdPrice ? rewardAmount * usdPrice : rewardAmount;
  
//     calculateReward = Number(calculateReward).toFixed(2);
  
//     // Calculate APR
//     const apr = toFixedCustm(
//       (calculateReward / poolData.totalValueLockedUSD) *
//       (1 / rewardPeriodYears) *
//       100
//     );
  
//     // console.log(apr, "<=========APR")
  
//     return {
//       apr: apr > 1 ? Number(apr).toFixed(2) : Number(apr).toFixed(4),
//       tvl: poolData.totalValueLockedUSD,
//     };
//   };