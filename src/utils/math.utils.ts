import { ethers } from "ethers";

interface TimeResult {
  humanDate: string;
  relative: string;
  originalTimestamp: number;
}


export const shortenPubkey = (address: string): string => {
  if (!address) {
    return ''
  }
  return `${address.slice(0, 5)}...${address.slice(-5)}`;
};


export const fromUnits = (value: string | number | bigint, decimals: number): string | number | undefined => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return;
  }

  if (!decimals && decimals !== 0) {
    return;
  }

  // Convert to a safe BigInt format
  let bigIntValue: bigint;
  try {
    if (typeof value === "number") {
      bigIntValue = BigInt(Math.floor(value)); // Ensure integer
    } else {
      bigIntValue = BigInt(value.toString()); // Safe conversion for string/bigint
    }
  } catch (error) {
    console.error("Error converting to BigInt:", error);
    return;
  }

  const formatValue = ethers.formatUnits(bigIntValue, decimals)
  return Number(Number(formatValue).toFixed(4));
};


export const toUnits = (value: string | number, decimals: number): bigint => {
  const str = value.toString()
  const [integer, fraction = ""] = str.split(".")

  // Truncate fraction to at most `decimals` digits
  const truncatedFraction = fraction.slice(0, decimals)

  // Reassemble—if there’s any fractional part left, include the dot
  const sanitized = truncatedFraction.length
    ? `${integer}.${truncatedFraction}`
    : integer

  return ethers.parseUnits(sanitized, decimals)
}

export const formatValue = (value: bigint | string | number | boolean | null | undefined) => (typeof value === "bigint" ? value.toString() : value);
export const formatTimestamp = (timestamp: number) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const future = new Date(timestamp * 1000);
  future.setHours(0, 0, 0, 0);

  const isFuture = future > now;
  const from = isFuture ? now : future;
  const to = isFuture ? future : now;

  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months--;
    const daysInPrevMonth = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    days += daysInPrevMonth;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} y${years > 1 ? "" : ""}`);
  if (months > 0) parts.push(`${months} m${months > 1 ? "" : ""}`);
  if (days > 0) parts.push(`${days} d${days > 1 ? "" : ""}`);

  if (parts.length === 0) {
    return isFuture ? "Unlocks in less than a day" : "Unlocked just now";
  }

  const label = parts.join(" "); // Show all parts including days

  return isFuture ? `Unlocks in ${label}` : `Unlocked ${label} ago`;
};


export const formatLockedFor = (expiresAt: number) => {
  if (expiresAt === 0) {
    return "locked forever";
  }

  const now = Math.floor(Date.now() / 1000);
  let diff = expiresAt - now;

  const isFuture = diff > 0;
  diff = Math.abs(diff);

  const secondsInMinute = 60;
  const secondsInHour = 3600;
  const secondsInDay = 86400;
  const secondsInMonth = 2592000; // approx
  const secondsInYear = 31536000;

  const years = Math.floor(diff / secondsInYear);
  diff %= secondsInYear;

  const months = Math.floor(diff / secondsInMonth);
  diff %= secondsInMonth;

  const days = Math.floor(diff / secondsInDay);
  diff %= secondsInDay;

  const hours = Math.floor(diff / secondsInHour);
  diff %= secondsInHour;

  const minutes = Math.floor(diff / secondsInMinute);

  const parts = [];
  if (years) parts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

  if (parts.length === 0) {
    return isFuture ? "locked for less than a minute" : "unlocked just now";
  }

  const result = parts.slice(0, 3).join(" "); // first 3 parts only
  return isFuture ? `locked for ${result}` : `unlocked ${result} ago`;
};


export const getTimeSince = (timestamp: number): TimeResult => {
  const date = new Date(timestamp * 1000);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const humanDate = date.toLocaleString();

  // Determine appropriate relative time
  let relativeTime: string;
  if (diffDays > 0) {
    relativeTime = `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else if (diffHours > 0) {
    relativeTime = `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffMinutes > 0) {
    relativeTime = `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else {
    relativeTime = `${diffSeconds} second${diffSeconds === 1 ? '' : 's'} ago`;
  }

  return {
    humanDate,
    relative: relativeTime,
    originalTimestamp: timestamp
  };
}

export const isResetAvailable = (timestamp: number, chainId: number): boolean => {
  const now: number = Math.floor(Date.now() / 1000);

  const day = chainId === 8453 ? 7 : 1
  const dayInSeconds: number = day * 24 * 60 * 60;

  return (now - timestamp) > dayInSeconds;
}


// export const calculateRebaseAPR = (
//     rebaseAmount: string,
//     lockedAmount: string,
//     decimals: string
//   ) => {
//     const rebase = parseFloat(rebaseAmount) / 10 ** parseInt(decimals);
//     const locked = parseFloat(lockedAmount) / 10 ** parseInt(decimals);

//     if (locked === 0) return 0;

//     const yearlyRebase = rebase * 52;
//     const apr = (yearlyRebase / locked) * 100;
//     return apr.toFixed(5);
//   };

export const calculateRebaseAPR = (
  rebaseAmount: string,
  lockedAmount: string,
  decimals: string
) => {
  // const rebase = parseFloat(rebaseAmount) / 10 ** parseInt(decimals);
  const locked = parseFloat(lockedAmount) / 10 ** parseInt(decimals);

  if (locked === 0) return 0;

  // const yearlyApr = ((rebase) / 78811) * 7 * 24* 60* 60

  return 7 //yearlyApr.toFixed(5);
};
